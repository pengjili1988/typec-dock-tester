import { useTestStore } from '@/stores/testStore';
import type { TestConfig } from '@/types/config';
import type { TestResult } from '@/types/test';

// 测试服务
class TestService {
  private testStore = useTestStore();

  /**
   * 开始测试
   */
  async startTest(config: TestConfig): Promise<void> {
    this.testStore.applyConfig(config);
    await this.testStore.startTest();
  }

  /**
   * 停止测试
   */
  async stopTest(): Promise<void> {
    await this.testStore.stopTest();
  }

  /**
   * 获取测试结果
   */
  getTestResult(): TestResult | null {
    return this.testStore.lastResult;
  }

  /**
   * 获取测试状态
   */
  getTestStatus(): {
    isRunning: boolean;
    isPaused: boolean;
    progress: number;
    passed: number;
    failed: number;
  } {
    return {
      isRunning: this.testStore.isRunning,
      isPaused: this.testStore.isPaused,
      progress: this.testStore.testProgress,
      passed: this.testStore.passedCount,
      failed: this.testStore.failedCount,
    };
  }

  /**
   * 导出测试报告
   */
  async exportReport(result: TestResult): Promise<void> {
    const reportData = {
      ...result,
      exportedAt: new Date().toISOString(),
    };

    // 创建下载链接
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 打印测试报告
   */
  async printReport(result: TestResult): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>测试报告</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .passed { color: green; }
            .failed { color: red; }
          </style>
        </head>
        <body>
          <h1>测试报告</h1>
          <p>配置: ${result.configName}</p>
          <p>时间: ${new Date(result.startTime).toLocaleString()}</p>
          <p>状态: ${result.status}</p>
          <p>通过率: ${result.summary.passRate}%</p>
          <table>
            <thead>
              <tr>
                <th>测试项</th>
                <th>状态</th>
                <th>实际值</th>
                <th>错误信息</th>
              </tr>
            </thead>
            <tbody>
              ${result.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="${item.status}">${item.status}</td>
                  <td>${item.actualValue !== undefined ? item.actualValue : '-'}</td>
                  <td>${item.errorMessage || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

export const testService = new TestService();
