// 应用常量
export const APP_NAME = 'Dock Tester';
export const APP_VERSION = '1.0.0';

// 测试状态
export const TEST_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;

// 测试项目代码
export const TEST_ITEM_CODES = {
  USB: 'usb',
  VIDEO: 'video',
  AUDIO: 'audio',
  NETWORK: 'network',
  PD: 'pd',
  SD: 'sd',
  FIRMWARE: 'firmware',
} as const;

// 协议类型
export const USB_PROTOCOLS = ['USB2.0', 'USB3.0', 'USB3.1', 'USB3.2', 'USB4.0'] as const;
export const VIDEO_PROTOCOLS = ['HDMI1.4', 'HDMI2.0', 'HDMI2.1', 'DP1.2', 'DP1.4'] as const;
export const PD_PROTOCOLS = ['PD2.0', 'PD3.0', 'PD3.1'] as const;
export const SD_PROTOCOLS = ['SD', 'SDHC', 'SDXC', 'TF'] as const;

// 网络速率
export const NETWORK_SPEEDS = ['100M', '1G', '2.5G', '5G'] as const;

// 波特率选项
export const BAUD_RATES = [9600, 19200, 38400, 57600, 115200] as const;

// 存储键名
export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  FEATURE_FLAGS: 'featureFlags',
  CONFIG_LIST: 'configList',
  CURRENT_CONFIG_ID: 'currentConfigId',
  MES_CONFIG: 'mesConfig',
  SCAN_CONFIG: 'scanConfig',
  PRINT_CONFIG: 'printConfig',
} as const;

// API超时
export const API_TIMEOUT = {
  DEFAULT: 30000,
  MES: 60000,
  UPLOAD: 120000,
} as const;

// 错误码
export const ERROR_CODES = {
  TEST_FAILED: 'E001',
  MES_SYNC_FAILED: 'E002',
  CONFIG_INVALID: 'E003',
  FILE_NOT_FOUND: 'E004',
  PERMISSION_DENIED: 'E005',
  CONNECTION_FAILED: 'E006',
  TIMEOUT: 'E007',
} as const;
