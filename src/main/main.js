/**
 * XFANIC TYPE-C Dock Tester - Main Process (Hardware Integration)
 * 深圳市湘凡科技有限公司
 * 
 * 硬件对接功能：
 * - USB设备热插拔检测
 * - USB/SD卡读写速度测试
 * - PD充电功率检测（通过串口读取治具数据）
 * - 视频输出检测（HDMI/DP分辨率/刷新率）
 * - 音频设备检测
 * - 网络带宽/延迟测试
 */
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const os = require('os');

let mainWindow;

// ============ USB 设备检测 ============
async function listUsbDevices() {
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

async function listUsbDrives() {
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

async function listUsbDriveLetters() {
  return new Promise((resolve) => {
    const cmd = `powershell -NoProfile -Command "
      $usbDisks = Get-WmiObject Win32_DiskDrive | Where-Object {$_.InterfaceType -eq 'USB'}
      $results = @()
      foreach ($disk in $usbDisks) {
        $partitions = Get-WmiObject -Query \\"ASSOCIATORS OF {Win32_DiskDrive.DeviceID='$($disk.DeviceID)'} WHERE AssocClass=Win32_DiskDriveToDiskPartition\\"
        foreach ($part in $partitions) {
          $logicals = Get-WmiObject -Query \\"ASSOCIATORS OF {Win32_DiskPartition.DeviceID='$($part.DeviceID)'} WHERE AssocClass=Win32_LogicalDiskToPartition\\"
          foreach ($logical in $logicals) {
            $results += [PSCustomObject]@{DriveLetter=$logical.DeviceID; Model=$disk.Model; Size=$disk.Size; FreeSpace=$logical.FreeSpace}
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
          size: parseInt(d.Size) || 0,
          freeSpace: parseInt(d.FreeSpace) || 0
        })));
      } catch { resolve([]); }
    });
  });
}

// ============ USB/SD卡 读写速度测试 ============
async function testDriveSpeed(driveLetter, fileSizeMB = 128) {
  const testFile = path.join(driveLetter + '\\', '_xfanic_speed_test.bin');
  const bufferSize = 1024 * 1024; // 1MB chunks
  const totalChunks = fileSizeMB;
  const chunk = Buffer.alloc(bufferSize, 0xAB);

  try {
    // 写速度测试
    const writeStart = process.hrtime.bigint();
    const writeStream = fs.createWriteStream(testFile, { flags: 'w' });
    await new Promise((resolve, reject) => {
      let written = 0;
      const writeNext = () => {
        if (written >= totalChunks) {
          writeStream.end(resolve);
          return;
        }
        const ok = writeStream.write(chunk);
        written++;
        if (ok) writeNext();
        else writeStream.once('drain', writeNext);
      };
      writeStream.on('error', reject);
      writeNext();
    });
    const writeEnd = process.hrtime.bigint();
    const writeSeconds = Number(writeEnd - writeStart) / 1e9;
    const writeMBps = parseFloat((fileSizeMB / writeSeconds).toFixed(2));

    // 读速度测试
    const readStart = process.hrtime.bigint();
    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(testFile, { highWaterMark: bufferSize });
      readStream.on('data', () => {});
      readStream.on('end', resolve);
      readStream.on('error', reject);
    });
    const readEnd = process.hrtime.bigint();
    const readSeconds = Number(readEnd - readStart) / 1e9;
    const readMBps = parseFloat((fileSizeMB / readSeconds).toFixed(2));

    // 清理
    try { fs.unlinkSync(testFile); } catch {}

    return { writeMBps, readMBps, success: true, fileSizeMB };
  } catch (e) {
    try { fs.unlinkSync(testFile); } catch {}
    return { writeMBps: 0, readMBps: 0, success: false, error: e.message };
  }
}

// ============ 视频输出检测 (HDMI/DP) ============
async function listDisplays() {
  return new Promise((resolve) => {
    const cmd = `powershell -NoProfile -Command "
      Add-Type -AssemblyName System.Windows.Forms
      $screens = [System.Windows.Forms.Screen]::AllScreens
      $screens | ForEach-Object {
        [PSCustomObject]@{
          DeviceName = $_.DeviceName
          Bounds = $_.Bounds.ToString()
          Primary = $_.Primary
          BitsPerPixel = $_.BitsPerPixel
        }
      } | ConvertTo-Json -Compress"`;
    exec(cmd, { timeout: 8000 }, (err, stdout) => {
      if (err) { resolve([]); return; }
      try {
        const raw = stdout.trim();
        if (!raw) { resolve([]); return; }
        const data = JSON.parse(raw);
        const arr = Array.isArray(data) ? data : [data];
        resolve(arr.map(d => ({
          deviceName: d.DeviceName || '',
          bounds: d.Bounds || '',
          primary: d.Primary || false,
          bitsPerPixel: d.BitsPerPixel || 32
        })));
      } catch { resolve([]); }
    });
  });
}

async function getDisplayDetails() {
  return new Promise((resolve) => {
    const cmd = `powershell -NoProfile -Command "
      $monitors = Get-WmiObject WmiMonitorBasicDisplayParams -Namespace root/wmi
      $results = @()
      foreach ($m in $monitors) {
        $results += [PSCustomObject]@{
          Active = $m.Active
          InstanceName = $m.InstanceName
          MaxHorizontalImageSize = $m.MaxHorizontalImageSize
          MaxVerticalImageSize = $m.MaxVerticalImageSize
          SupportedDisplayFeatures = $m.SupportedDisplayFeatures
        }
      }
      $results | ConvertTo-Json -Compress"`;
    exec(cmd, { timeout: 8000 }, (err, stdout) => {
      if (err) { resolve([]); return; }
      try {
        const raw = stdout.trim();
        if (!raw) { resolve([]); return; }
        const data = JSON.parse(raw);
        resolve(Array.isArray(data) ? data : [data]);
      } catch { resolve([]); }
    });
  });
}

// ============ 音频设备检测 ============
async function listAudioDevices() {
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

// ============ 网络检测 ============
async function getNetworkInfo() {
  return new Promise((resolve) => {
    const cmd = `powershell -NoProfile -Command "
      $adapters = Get-NetAdapter | Where-Object {$_.Status -eq 'Up'}
      $results = @()
      foreach ($a in $adapters) {
        $stats = Get-NetAdapterStatistics -Name $a.Name -ErrorAction SilentlyContinue
        $results += [PSCustomObject]@{
          Name = $a.Name
          InterfaceDescription = $a.InterfaceDescription
          LinkSpeed = $a.LinkSpeed
          MacAddress = $a.MacAddress
          Status = $a.Status
          ReceivedBytes = $stats.ReceivedBytes
          SentBytes = $stats.SentBytes
        }
      }
      $results | ConvertTo-Json -Compress"`;
    exec(cmd, { timeout: 8000 }, (err, stdout) => {
      if (err) { resolve([]); return; }
      try {
        const raw = stdout.trim();
        if (!raw) { resolve([]); return; }
        const data = JSON.parse(raw);
        resolve(Array.isArray(data) ? data : [data]);
      } catch { resolve([]); }
    });
  });
}

async function testNetworkLatency(host = '8.8.8.8') {
  return new Promise((resolve) => {
    const cmd = `ping -n 4 -w 2000 ${host}`;
    exec(cmd, { timeout: 15000 }, (err, stdout) => {
      if (err) {
        resolve({ success: false, error: 'Ping failed', avgMs: 0 });
        return;
      }
      const match = stdout.match(/Average\s*=\s*(\d+)ms/i) || stdout.match(/平均\s*=\s*(\d+)ms/i);
      const avgMs = match ? parseInt(match[1]) : 0;
      resolve({ success: avgMs > 0, avgMs, raw: stdout });
    });
  });
}

// ============ PD充电检测（通过串口读取治具数据） ============
async function readPDData(portName = 'COM3') {
  return new Promise((resolve) => {
    // 通过PowerShell读取串口（模拟/实际实现）
    const cmd = `powershell -NoProfile -Command "
      try {
        $port = New-Object System.IO.Ports.SerialPort '${portName}', 115200, 'None', 8, 'One'
        $port.ReadTimeout = 2000
        $port.Open()
        $port.WriteLine('READ_PD')
        Start-Sleep -Milliseconds 500
        $response = $port.ReadExisting()
        $port.Close()
        Write-Output $response
      } catch {
        Write-Output 'ERROR:' + $_.Exception.Message
      }"`;
    exec(cmd, { timeout: 8000 }, (err, stdout) => {
      if (err) {
        // 模拟数据（实际治具未连接时）
        resolve({
          success: false,
          simulated: true,
          voltage: 0,
          current: 0,
          power: 0,
          error: 'PD治具未连接或串口不可用'
        });
        return;
      }
      const response = stdout.trim();
      if (response.startsWith('ERROR') || !response) {
        resolve({
          success: false,
          simulated: true,
          voltage: 0,
          current: 0,
          power: 0,
          error: '无法读取PD数据'
        });
        return;
      }
      // 解析治具返回数据格式: "V:20.0,A:3.0,P:60.0"
      const vMatch = response.match(/V:([\d.]+)/);
      const aMatch = response.match(/A:([\d.]+)/);
      const pMatch = response.match(/P:([\d.]+)/);
      resolve({
        success: true,
        simulated: false,
        voltage: vMatch ? parseFloat(vMatch[1]) : 0,
        current: aMatch ? parseFloat(aMatch[1]) : 0,
        power: pMatch ? parseFloat(pMatch[1]) : 0,
        raw: response
      });
    });
  });
}

// ============ TYPE-C扩展坞检测（增强版） ============
// 检测设备管理器中的USB集线器、网络适配器、音频设备变化
async function detectDock() {
  const results = {
    usbHubs: [],
    networkAdapters: [],
    audioDevices: [],
    usbDevices: []
  };
  
  // 1. 检测USB集线器（通用USB集线器 / SuperSpeed USB集线器）
  const usbHubCmd = `powershell -NoProfile -Command "
    Get-PnpDevice -Class USB | Where-Object {
      $_.FriendlyName -like '*集线器*' -or 
      $_.FriendlyName -like '*Hub*' -or
      $_.FriendlyName -like '*SuperSpeed*'
    } | Select-Object FriendlyName,DeviceID,Status | ConvertTo-Json -Compress"`;
  
  try {
    const usbHubs = await new Promise((resolve) => {
      exec(usbHubCmd, { timeout: 5000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          resolve(Array.isArray(data) ? data : [data]);
        } catch { resolve([]); }
      });
    });
    results.usbHubs = usbHubs.filter(d => d.Status === 'OK');
  } catch (e) { }
  
  // 2. 检测网络适配器（新增的有线网卡）
  const netCmd = `powershell -NoProfile -Command "
    Get-NetAdapter | Where-Object {
      $_.Status -eq 'Up' -and (
        $_.InterfaceDescription -like '*USB*' -or
        $_.InterfaceDescription -like '*Realtek*' -or
        $_.InterfaceDescription -like '*ASIX*' -or
        $_.InterfaceDescription -like '*LAN*'
      )
    } | Select-Object Name,InterfaceDescription,MacAddress,Status | ConvertTo-Json -Compress"`;
  
  try {
    const netAdapters = await new Promise((resolve) => {
      exec(netCmd, { timeout: 5000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          resolve(Array.isArray(data) ? data : [data]);
        } catch { resolve([]); }
      });
    });
    results.networkAdapters = netAdapters;
  } catch (e) { }
  
  // 3. 检测音频设备（新增的USB音频）
  const audioCmd = `powershell -NoProfile -Command "
    Get-WmiObject Win32_SoundDevice | Where-Object {
      $_.Status -eq 'OK' -and (
        $_.Name -like '*USB*' -or
        $_.Name -like '*Audio*'
      )
    } | Select-Object Name,Status | ConvertTo-Json -Compress"`;
  
  try {
    const audioDevices = await new Promise((resolve) => {
      exec(audioCmd, { timeout: 5000 }, (err, stdout) => {
        if (err) { resolve([]); return; }
        try {
          const raw = stdout.trim();
          if (!raw) { resolve([]); return; }
          const data = JSON.parse(raw);
          resolve(Array.isArray(data) ? data : [data]);
        } catch { resolve([]); }
      });
    });
    results.audioDevices = audioDevices;
  } catch (e) { }
  
  // 4. 获取所有USB设备用于显示
  results.usbDevices = await listUsbDevices();
  
  // 判断扩展坞是否连接：需要同时满足以下条件
  // - 检测到USB集线器
  // - 检测到网络适配器 或 音频设备
  const hasUsbHub = results.usbHubs.length > 0;
  const hasNetwork = results.networkAdapters.length > 0;
  const hasAudio = results.audioDevices.length > 0;
  
  // 扩展坞检测逻辑：必须有USB集线器 + (网卡或音频)
  const isDockConnected = hasUsbHub && (hasNetwork || hasAudio);
  
  // 构建设备信息
  let dockDevice = null;
  if (isDockConnected) {
    const hubNames = results.usbHubs.map(h => h.FriendlyName || h.name).join(', ');
    const netNames = results.networkAdapters.map(n => n.Name || n.name).join(', ');
    dockDevice = {
      name: hubNames || 'USB Dock',
      usbHubs: results.usbHubs,
      networkAdapters: results.networkAdapters,
      audioDevices: results.audioDevices
    };
  }
  
  return {
    connected: isDockConnected,
    device: dockDevice,
    details: results,
    debug: {
      hasUsbHub,
      hasNetwork,
      hasAudio,
      usbHubCount: results.usbHubs.length,
      networkCount: results.networkAdapters.length,
      audioCount: results.audioDevices.length
    }
  };
}

// ============ 创建窗口 ============
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    title: 'XFANIC TYPE-C Dock Tester',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#0a0e1a',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============ IPC 通道 ============
function setupIpc() {
  // 文件操作
  ipcMain.handle('save-config', async (event, data) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '保存测试配置文件',
      defaultPath: 'test-config.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true, path: filePath };
    }
    return { success: false };
  });

  ipcMain.handle('load-config', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: '打开测试配置文件',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });
    if (filePaths && filePaths[0]) {
      const content = fs.readFileSync(filePaths[0], 'utf8');
      return { success: true, data: JSON.parse(content), path: filePaths[0] };
    }
    return { success: false };
  });

  // ============ 硬件检测 IPC ============
  ipcMain.handle('detect-dock', async () => await detectDock());
  ipcMain.handle('list-usb-devices', async () => await listUsbDevices());
  ipcMain.handle('list-usb-drives', async () => await listUsbDrives());
  ipcMain.handle('list-drive-letters', async () => await listUsbDriveLetters());
  ipcMain.handle('test-drive-speed', async (event, driveLetter, fileSizeMB) => await testDriveSpeed(driveLetter, fileSizeMB || 128));
  ipcMain.handle('list-displays', async () => await listDisplays());
  ipcMain.handle('list-audio-devices', async () => await listAudioDevices());
  ipcMain.handle('get-network-info', async () => await getNetworkInfo());
  ipcMain.handle('test-network-latency', async (event, host) => await testNetworkLatency(host || '8.8.8.8'));
  ipcMain.handle('read-pd-data', async (event, portName) => await readPDData(portName || 'COM3'));
}

// ============ 应用生命周期 ============
app.whenReady().then(() => {
  createWindow();
  setupIpc();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
