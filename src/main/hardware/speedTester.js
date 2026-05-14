/**
 * USB / SD卡读写速度测试模块
 * 通过写入/读取临时文件来测量真实速度
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

class SpeedTester {
  /**
   * 测试指定路径的写入速度
   * @param {string} driveLetter - 如 "E:"
   * @param {number} fileSizeMB - 测试文件大小(MB), 默认128
   * @returns {Promise<{writeMBps: number, readMBps: number, success: boolean, error?: string}>}
   */
  async testDriveSpeed(driveLetter, fileSizeMB = 128) {
    const testFile = path.join(driveLetter + '\\', '_xfanic_speed_test.bin');
    const bufferSize = 1024 * 1024; // 1MB chunks
    const totalChunks = fileSizeMB;
    const chunk = Buffer.alloc(bufferSize, 0xAB);

    let writeMBps = 0;
    let readMBps = 0;

    try {
      // === 写速度测试 ===
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
      writeMBps = parseFloat((fileSizeMB / writeSeconds).toFixed(2));

      // === 读速度测试 ===
      const readStart = process.hrtime.bigint();
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(testFile, { highWaterMark: bufferSize });
        readStream.on('data', () => {});
        readStream.on('end', resolve);
        readStream.on('error', reject);
      });
      const readEnd = process.hrtime.bigint();
      const readSeconds = Number(readEnd - readStart) / 1e9;
      readMBps = parseFloat((fileSizeMB / readSeconds).toFixed(2));

      // 清理测试文件
      try { fs.unlinkSync(testFile); } catch {}

      return { writeMBps, readMBps, success: true, fileSizeMB };
    } catch (e) {
      try { fs.unlinkSync(testFile); } catch {}
      return { writeMBps: 0, readMBps: 0, success: false, error: e.message };
    }
  }

  /**
   * 获取磁盘信息（可用空间、总大小）
   */
  async getDriveInfo(driveLetter) {
    return new Promise((resolve) => {
      const cmd = `powershell -NoProfile -Command "Get-PSDrive ${driveLetter.replace(':','')} | Select-Object Used,Free | ConvertTo-Json -Compress"`;
      exec(cmd, { timeout: 5000 }, (err, stdout) => {
        if (err) { resolve(null); return; }
        try {
          const d = JSON.parse(stdout.trim());
          resolve({
            freeBytes: parseInt(d.Free) || 0,
            usedBytes: parseInt(d.Used) || 0,
            totalBytes: (parseInt(d.Free) || 0) + (parseInt(d.Used) || 0)
          });
        } catch { resolve(null); }
      });
    });
  }

  /**
   * 快速小文件测速（用于测速前确认盘符可写）
   */
  async quickCheck(driveLetter) {
    const testFile = path.join(driveLetter + '\\', '_xfanic_quick.tmp');
    try {
      fs.writeFileSync(testFile, Buffer.alloc(1024 * 512, 0xFF));
      fs.unlinkSync(testFile);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new SpeedTester();
