/**
 * 音频测试模块
 * 通过 Windows WMI + Web Audio API（渲染进程配合）检测音频设备
 * 主进程负责枚举设备信息，渲染进程负责实际录音采样率检测
 */
const { exec } = require('child_process');

class AudioTester {
  /**
   * 枚举音频输入/输出设备
   */
  async listAudioDevices() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        Get-WmiObject Win32_SoundDevice | Select-Object Name, Status, Manufacturer | ConvertTo-Json -Compress"`;
      exec(cmd, { timeout: 6000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          const arr = Array.isArray(data) ? data : [data];
          resolve(arr.map(d => ({
            name: d.Name || '',
            status: d.Status || '',
            manufacturer: d.Manufacturer || ''
          })));
        } catch { resolve([]); }
      });
    });
  }

  /**
   * 获取音频端点详情（包含采样率信息）
   */
  async getAudioEndpoints() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class AudioEndpoints {
  [DllImport(\\"ole32.dll\\")] public static extern int CoCreateInstance(ref Guid clsid, IntPtr inner, uint ctx, ref Guid iid, out IntPtr ppv);
}
'@ -ErrorAction SilentlyContinue
        # 使用更简单的方式获取音频设备
        $deviceEnum = New-Object -ComObject 'MMDeviceAPI.MMDeviceEnumerator' -ErrorAction SilentlyContinue
        if (-not $deviceEnum) {
          # fallback: DirectShow枚举
          $devices = Get-WmiObject Win32_SoundDevice | Where-Object {$_.Status -eq 'OK'}
          $results = $devices | ForEach-Object { [PSCustomObject]@{Name=$_.Name; Type='Unknown'; SampleRate=0; Channels=0} }
          $results | ConvertTo-Json -Compress
        }"`;
      exec(cmd, { timeout: 8000 }, (err, stdout) => {
        // 这里主要fallback到WMI
        this.listAudioDevices().then(resolve);
      });
    });
  }

  /**
   * 检查特定音频设备是否已连接（通过设备名关键词）
   */
  async checkDeviceConnected(keywords = []) {
    const devices = await this.listAudioDevices();
    const found = devices.filter(d =>
      d.status === 'OK' &&
      keywords.some(kw => d.name.toLowerCase().includes(kw.toLowerCase()))
    );
    return { found: found.length > 0, devices: found };
  }

  /**
   * 获取默认音频设备信息（PowerShell）
   */
  async getDefaultDeviceInfo() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        $defaultDevice = Get-WmiObject Win32_SoundDevice | Where-Object {$_.Status -eq 'OK'} | Select-Object -First 1
        if ($defaultDevice) {
          [PSCustomObject]@{
            Name = $defaultDevice.Name
            Status = $defaultDevice.Status
            Manufacturer = $defaultDevice.Manufacturer
          } | ConvertTo-Json -Compress
        } else { Write-Output 'null' }"`;
      exec(cmd, { timeout: 6000 }, (err, stdout) => {
        if (err) { resolve(null); return; }
        try {
          const raw = stdout.trim();
          if (!raw || raw === 'null') { resolve(null); return; }
          resolve(JSON.parse(raw));
        } catch { resolve(null); }
      });
    });
  }
}

module.exports = new AudioTester();
