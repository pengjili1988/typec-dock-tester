/**
 * USB 设备检测模块
 * 基于 Windows WMI 和 PowerShell 实现真实 USB 设备枚举
 */
const { exec, execSync } = require('child_process');
const { EventEmitter } = require('events');

class UsbDetector extends EventEmitter {
  constructor() {
    super();
    this._pollInterval = null;
    this._knownDevices = new Set();
  }

  // 枚举当前所有USB设备（PowerShell WMI方式）
  async listUsbDevices() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "Get-PnpDevice -Class USB | Where-Object {$_.Status -eq 'OK'} | Select-Object FriendlyName,DeviceID,Status | ConvertTo-Json -Compress"`;
      exec(cmd, { timeout: 8000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          const arr = Array.isArray(data) ? data : [data];
          resolve(arr.map(d => ({
            name: d.FriendlyName || '',
            deviceId: d.DeviceID || '',
            status: d.Status || ''
          })));
        } catch { resolve([]); }
      });
    });
  }

  // 枚举USB存储设备（用于读写速度测试）
  async listUsbDrives() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "Get-WmiObject Win32_DiskDrive | Where-Object {$_.InterfaceType -eq 'USB'} | Select-Object Model,DeviceID,Size,Status | ConvertTo-Json -Compress"`;
      exec(cmd, { timeout: 8000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          const arr = Array.isArray(data) ? data : [data];
          resolve(arr.map(d => ({
            model: d.Model || '',
            deviceId: d.DeviceID || '',
            sizeBytes: parseInt(d.Size) || 0,
            status: d.Status || ''
          })));
        } catch { resolve([]); }
      });
    });
  }

  // 获取USB驱动器盘符
  async listUsbDriveLetters() {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        $usbDisks = Get-WmiObject Win32_DiskDrive | Where-Object {$_.InterfaceType -eq 'USB'}
        $results = @()
        foreach ($disk in $usbDisks) {
          $partitions = Get-WmiObject -Query \\"ASSOCIATORS OF {Win32_DiskDrive.DeviceID='$($disk.DeviceID)'} WHERE AssocClass=Win32_DiskDriveToDiskPartition\\"
          foreach ($part in $partitions) {
            $logicals = Get-WmiObject -Query \\"ASSOCIATORS OF {Win32_DiskPartition.DeviceID='$($part.DeviceID)'} WHERE AssocClass=Win32_LogicalDiskToPartition\\"
            foreach ($logical in $logicals) {
              $results += [PSCustomObject]@{DriveLetter=$logical.DeviceID; Model=$disk.Model; Size=$disk.Size}
            }
          }
        }
        $results | ConvertTo-Json -Compress"`;
      exec(cmd, { timeout: 12000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          const arr = Array.isArray(data) ? data : [data];
          resolve(arr.map(d => ({
            driveLetter: d.DriveLetter || '',
            model: d.Model || '',
            size: parseInt(d.Size) || 0
          })));
        } catch { resolve([]); }
      });
    });
  }

  // 获取USB设备传输速度类型（USB2/USB3/USB3.1/USB3.2）
  async getUsbSpeedType(deviceId) {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "
        $dev = Get-PnpDevice | Where-Object {$_.DeviceID -like '*${deviceId.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}*'} | Select-Object -First 1
        if ($dev) {
          $props = Get-PnpDeviceProperty -InstanceId $dev.DeviceID -KeyName 'DEVPKEY_Device_BusReportedDeviceDesc','DEVPKEY_USB_PortProperties' -ErrorAction SilentlyContinue
          $desc = ($props | Where-Object {$_.KeyName -like '*BusReported*'}).Data
          Write-Output $desc
        }"`;
      exec(cmd, { timeout: 5000 }, (err, stdout) => {
        if (err) { resolve('USB'); return; }
        const desc = stdout.trim().toLowerCase();
        if (desc.includes('3.2') || desc.includes('superspeed+')) resolve('USB3.2');
        else if (desc.includes('3.1')) resolve('USB3.1');
        else if (desc.includes('3.0') || desc.includes('superspeed')) resolve('USB3.0');
        else if (desc.includes('2.0') || desc.includes('high speed')) resolve('USB2.0');
        else resolve('USB');
      });
    });
  }

  // 开始轮询（检测设备热插拔）
  startPolling(intervalMs = 2000) {
    this._poll();
    this._pollInterval = setInterval(() => this._poll(), intervalMs);
  }

  stopPolling() {
    if (this._pollInterval) clearInterval(this._pollInterval);
  }

  async _poll() {
    const devices = await this.listUsbDevices();
    const currentIds = new Set(devices.map(d => d.deviceId));

    // 检测新插入设备
    for (const d of devices) {
      if (!this._knownDevices.has(d.deviceId)) {
        this.emit('attach', d);
      }
    }
    // 检测拔出设备
    for (const id of this._knownDevices) {
      if (!currentIds.has(id)) {
        this.emit('detach', { deviceId: id });
      }
    }
    this._knownDevices = currentIds;
  }
}

module.exports = new UsbDetector();
