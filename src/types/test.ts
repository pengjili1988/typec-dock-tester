// 测试项状态
export type TestItemStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped';

// 测试项
export interface TestItem {
  code: string;
  name: string;
  label: string;
  status: TestItemStatus;
  progress?: number;
  actualValue?: number;
  expectedValue?: number;
  unit?: string;
  errorMessage?: string;
  duration?: number;
}

// 测试结果状态
export type TestResultStatus = 'passed' | 'failed' | 'timeout' | 'error';

// 测试摘要
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
}

// 测试结果项
export interface TestResultItem {
  code: string;
  name: string;
  status: TestResultStatus;
  actualValue?: number;
  expectedValue?: number;
  unit?: string;
  errorMessage?: string;
  duration?: number;
}

// 测试结果
export interface TestResult {
  id: string;
  configId: string;
  configName: string;
  startTime: string;
  endTime: string;
  status: TestResultStatus;
  summary: TestSummary;
  items: TestResultItem[];
}

// 测试日志
export interface TestLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  data?: any;
}

// 测试状态
export interface TestState {
  isRunning: boolean;
  isPaused: boolean;
  currentTest?: string;
  progress: number;
  startTime?: string;
}

// 测试报告
export interface TestReport {
  result: TestResult;
  deviceInfo: {
    serialNumber: string;
    firmwareVersion: string;
    hardwareVersion: string;
  };
  operator: {
    id: string;
    name: string;
  };
  exportedAt: string;
}
