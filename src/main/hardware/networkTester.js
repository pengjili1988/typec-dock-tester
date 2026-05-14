/**
 * 网络测试模块
 * 检测网卡状态、网速、延迟
 */
const { exec } = require('child_process');
const net = require('net');
const os = require('os');

class NetworkTester {
  /**
   * 枚举网络适配器（检测USB网卡）
   */
  async listNetworkAdapters() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Select-Object Name,InterfaceDescription,LinkSpeed,MacAddress,Status | ConvertTo-Json -Compress"`;
      exec(cmd, { timeout: 8000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          const arr = Array.isArray(data) ? data : [data];
          resolve(arr.map(d => ({
            name: d.Name || '',
            description: d.InterfaceDescription || '',
            linkSpeed: d.LinkSpeed || '',
            macAddress: d.MacAddress || '',
            status: d.Status || ''
          })));
        } catch { resolve([]); }
      });
    });
  }

  /**
   * 获取USB网卡（通过接口描述过滤）
   */
  async getUsbNetworkAdapters() {
    const all = await this.listNetworkAdapters();
    // USB网卡通常在描述中包含 USB, Realtek USB, ASIX等关键词
    return all.filter(a =>
      a.description.toLowerCase().includes('usb') ||
      a.description.toLowerCase().includes('realtek') ||
      a.description.toLowerCase().includes('asix') ||
      a.description.toLowerCase().includes('ax88') ||
      a.description.toLowerCase().includes('usb 10/100') ||
      a.description.toLowerCase().includes('usb gigabit')
    );
  }

  /**
   * 测试网络延迟（ping）
   * @param {string} host - 目标主机（默认网关或8.8.8.8）
   * @param {number} count - ping次数
   */
  async pingTest(host = '8.8.8.8', count = 4) {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        $result = Test-Connection -ComputerName ${host} -Count ${count} -ErrorAction SilentlyContinue
        if ($result) {
          $avg = ($result | Measure-Object -Property ResponseTime -Average).Average
          $min = ($result | Measure-Object -Property ResponseTime -Minimum).Minimum
          $max = ($result | Measure-Object -Property ResponseTime -Maximum).Maximum
          [PSCustomObject]@{Success=$true; AvgMs=[math]::Round($avg,2); MinMs=$min; MaxMs=$max; Count=$result.Count} | ConvertTo-Json -Compress
        } else {
          [PSCustomObject]@{Success=$false; AvgMs=0; MinMs=0; MaxMs=0; Count=0} | ConvertTo-Json -Compress
        }"`;
      exec(cmd, { timeout: 30000 }, (err, stdout) => {
        if (err) { resolve({ success: false, avgMs: 0, error: err.message }); return; }
        try {
          const d = JSON.parse(stdout.trim());
          resolve({
            success: d.Success,
            avgMs: d.AvgMs || 0,
            minMs: d.MinMs || 0,
            maxMs: d.MaxMs || 0,
            count: d.Count || 0
          });
        } catch { resolve({ success: false, avgMs: 0 }); }
      });
    });
  }

  /**
   * 测试网络带宽（通过下载测试文件估算）
   * 使用内网/本地测速，生产环境建议配置内网测速服务器
   */
  async bandwidthTest(url = 'http://speedtest.tele2.net/10MB.zip', timeoutSec = 15) {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        $url = '${url}'
        $start = Get-Date
        try {
          $wc = New-Object System.Net.WebClient
          $wc.DownloadFile($url, '$env:TEMP\\bw_test.tmp')
          $elapsed = ((Get-Date) - $start).TotalSeconds
          $size = (Get-Item '$env:TEMP\\bw_test.tmp').Length
          Remove-Item '$env:TEMP\\bw_test.tmp' -Force -ErrorAction SilentlyContinue
          $mbps = [math]::Round(($size / $elapsed / 1MB * 8), 2)
          [PSCustomObject]@{Success=$true; Mbps=$mbps; Seconds=[math]::Round($elapsed,2); Bytes=$size} | ConvertTo-Json -Compress
        } catch {
          [PSCustomObject]@{Success=$false; Mbps=0; Error=$_.Exception.Message} | ConvertTo-Json -Compress
        }"`;
      exec(cmd, { timeout: (timeoutSec + 5) * 1000 }, (err, stdout) => {
        if (err) { resolve({ success: false, mbps: 0, error: 'timeout' }); return; }
        try {
          const d = JSON.parse(stdout.trim());
          resolve({
            success: d.Success,
            mbps: d.Mbps || 0,
            seconds: d.Seconds || 0,
            bytes: d.Bytes || 0
          });
        } catch { resolve({ success: false, mbps: 0 }); }
      });
    });
  }

  /**
   * 获取本地网关IP
   */
  async getGateway() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "(Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway -ne $null} | Select-Object -First 1).IPv4DefaultGateway.NextHop"`;
      exec(cmd, { timeout: 5000 }, (err, stdout) => {
        if (err) { resolve('192.168.1.1'); return; }
        resolve(stdout.trim() || '192.168.1.1');
      });
    });
  }

  /**
   * 检测网卡链路速度（100M/1000M/2.5G）
   */
  async getLinkSpeed(adapterName) {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        $adapter = Get-NetAdapter -Name '${adapterName}' -ErrorAction SilentlyContinue
        if ($adapter) { $adapter.LinkSpeed } else { 'Unknown' }"`;
      exec(cmd, { timeout: 5000 }, (err, stdout) => {
        if (err) { resolve('Unknown'); return; }
        const speed = stdout.trim();
        // 解析速度字符串如 "1 Gbps", "100 Mbps"
        if (speed.includes('Gbps') || speed.includes('gbps')) {
          const val = parseFloat(speed);
          resolve(val >= 2.5 ? '2.5G' : val >= 1 ? '1000M' : '100M');
        } else if (speed.includes('Mbps') || speed.includes('mbps')) {
          const val = parseFloat(speed);
          resolve(val >= 1000 ? '1000M' : '100M');
        } else {
          resolve(speed || 'Unknown');
        }
      });
    });
  }
}

module.exports = new NetworkTester();
