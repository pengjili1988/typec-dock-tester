// 产品信息
export interface ProductConfig {
  model: string;
  vid: string;
  pid: string;
  fwVersion?: string;
  hwVersion?: string;
}

// 测试项目开关
export interface TestItemsConfig {
  usb: boolean;
  video: boolean;
  audio: boolean;
  network: boolean;
  pd: boolean;
  sd: boolean;
  firmware: boolean;
}

// USB测试配置
export interface UsbTestConfig {
  enabled: boolean;
  protocols: ('USB2.0' | 'USB3.0' | 'USB3.1' | 'USB3.2' | 'USB4.0')[];
  speedThresholds: {
    readMin: number;
    writeMin: number;
  };
  voltageRange: {
    min: number;
    max: number;
  };
  ovpThreshold: number;
  vidPidCheck: {
    expectedVid: string;
    expectedPid: string;
  };
  fwCheck?: {
    expectedVersion: string;
  };
  timeout: number;
  retries: number;
}

// 视频端口配置
export interface VideoPortConfig {
  portType: 'VGA' | 'HDMI' | 'DP' | 'USB-C';
  protocol: 'HDMI1.4' | 'HDMI2.0' | 'HDMI2.1' | 'DP1.2' | 'DP1.4';
  resolutions: string[];
  pixelMatchThreshold: number;
  rgbTolerance: {
    r: number;
    g: number;
    b: number;
  };
  brightnessRange: {
    min: number;
    max: number;
  };
}

// 视频测试配置
export interface VideoTestConfig {
  enabled: boolean;
  ports: VideoPortConfig[];
}

// 音频端口配置
export interface AudioPortConfig {
  portType: '3.5mm' | 'HDMI' | 'DP' | 'USB-C';
  expectedChannels: number[];
  frequencyRange: {
    min: number;
    max: number;
  };
  sampleRates: number[];
  snrThreshold: number;
}

// 音频测试配置
export interface AudioTestConfig {
  enabled: boolean;
  ports: AudioPortConfig[];
}

// 网络测试配置
export interface NetworkTestConfig {
  enabled: boolean;
  supportedSpeeds: ('100M' | '1G' | '2.5G' | '5G')[];
  speedThresholds: {
    [key: string]: number;
  };
  macValidation: {
    format: 'XXXX-XXXX-XXXX' | 'XX:XX:XX:XX:XX:XX';
    expectedPrefix?: string;
  };
  macBurnEnabled: boolean;
  macSource: 'config' | 'mes';
}

// PD充电测试配置
export interface PdTestConfig {
  enabled: boolean;
  protocols: ('PD2.0' | 'PD3.0' | 'PD3.1')[];
  voltages: number[];
  currents: number[];
  maxPower: number;
  voltageTolerance: number;
  currentTolerance: number;
  ocpThreshold: number;
  otpThreshold: number;
  emarkerCheck: boolean;
}

// SD卡测试配置
export interface SdTestConfig {
  enabled: boolean;
  protocols: ('SD' | 'SDHC' | 'SDXC' | 'TF')[];
  speedThresholds: {
    readMin: number;
    writeMin: number;
  };
  capacityRange: {
    min: number;
    max: number;
  };
  fwCheck?: {
    expectedVersion: string;
  };
  timeout: number;
}

// 固件测试配置
export interface FirmwareTestConfig {
  enabled: boolean;
  firmwareTypes: ('USB' | 'Video' | 'PD' | 'SD' | 'MCU')[];
  versionSources: {
    [key: string]: {
      type: 'usb' | 'sd' | 'eeprom' | 'flash';
      address?: string;
    };
  };
  compareMode: 'exact' | 'pattern' | 'hash';
  expectedVersions: {
    [key: string]: string;
  };
}

// 测试配置根对象
export interface TestConfig {
  id?: string;
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  description?: string;
  product: ProductConfig;
  testItems: TestItemsConfig;
  usb: UsbTestConfig;
  video: VideoTestConfig;
  audio: AudioTestConfig;
  network: NetworkTestConfig;
  pd: PdTestConfig;
  sd: SdTestConfig;
  firmware: FirmwareTestConfig;
}

// 功能开关配置
export interface FeatureFlags {
  mes: boolean;
  scan: boolean;
  print: boolean;
  autoTest: boolean;
  remoteUpdate: boolean;
}

// 配置校验结果
export interface ValidationResult {
  valid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}
