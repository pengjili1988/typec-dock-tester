import type { TestConfig } from '@/types/config';

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

// 参数管理服务
class ParamService {
  /**
   * 从JSON文件导入配置
   */
  async importFromFile(): Promise<TestConfig | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const text = await file.text();
          const config = JSON.parse(text) as TestConfig;
          
          // 校验配置
          const validation = await this.validateConfig(config);
          if (!validation.valid) {
            console.error('Config validation errors:', validation.errors);
            alert(`配置校验失败: ${validation.errors.map(e => e.message).join(', ')}`);
            resolve(null);
            return;
          }

          // 添加ID和时间戳
          config.id = `config-${Date.now()}`;
          config.createdAt = new Date().toISOString();
          config.updatedAt = new Date().toISOString();

          resolve(config);
        } catch (error) {
          console.error('Failed to parse config file:', error);
          alert('配置文件解析失败');
          resolve(null);
        }
      };

      input.click();
    });
  }

  /**
   * 导出配置到JSON文件
   */
  async exportToFile(config: TestConfig): Promise<void> {
    const exportConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportConfig, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.name || 'config'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 校验配置完整性
   */
  async validateConfig(config: TestConfig): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // 检查必填字段
    if (!config.version) {
      errors.push({ field: 'version', message: '缺少版本号' });
    }
    if (!config.name) {
      errors.push({ field: 'name', message: '缺少配置名称' });
    }
    if (!config.product?.model) {
      errors.push({ field: 'product.model', message: '缺少产品型号' });
    }

    // 检查VID/PID格式
    if (config.product?.vid && !/^0x[0-9A-Fa-f]{4}$/.test(config.product.vid)) {
      errors.push({ field: 'product.vid', message: 'VID格式错误，应为0xXXXX' });
    }
    if (config.product?.pid && !/^0x[0-9A-Fa-f]{4}$/.test(config.product.pid)) {
      errors.push({ field: 'product.pid', message: 'PID格式错误，应为0xXXXX' });
    }

    // 检查电压范围
    if (config.usb?.voltageRange) {
      const { min, max } = config.usb.voltageRange;
      if (min >= max) {
        errors.push({ field: 'usb.voltageRange', message: '电压范围最小值应小于最大值' });
      }
    }

    // 检查至少有一个测试项目开启
    const hasEnabledTest = Object.values(config.testItems || {}).some(v => v === true);
    if (!hasEnabledTest) {
      errors.push({ field: 'testItems', message: '至少需要开启一个测试项目' });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 克隆配置
   */
  cloneConfig(source: TestConfig, newName: string): TestConfig {
    return {
      ...JSON.parse(JSON.stringify(source)),
      id: `config-${Date.now()}`,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 生成默认配置
   */
  generateDefaultConfig(): TestConfig {
    return {
      version: '1.0.0',
      id: `config-${Date.now()}`,
      name: '新配置',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      product: {
        model: '',
        vid: '',
        pid: '',
      },
      testItems: {
        usb: true,
        video: true,
        audio: true,
        network: true,
        pd: true,
        sd: true,
        firmware: true,
      },
      usb: {
        enabled: true,
        protocols: ['USB3.0'],
        speedThresholds: { readMin: 200, writeMin: 100 },
        voltageRange: { min: 4.75, max: 5.25 },
        ovpThreshold: 5.8,
        vidPidCheck: { expectedVid: '', expectedPid: '' },
        timeout: 30000,
        retries: 3,
      },
      video: {
        enabled: true,
        ports: [],
      },
      audio: {
        enabled: true,
        ports: [],
      },
      network: {
        enabled: true,
        supportedSpeeds: ['1G'],
        speedThresholds: { '1G': 900 },
        macValidation: { format: 'XX:XX:XX:XX:XX:XX' },
        macBurnEnabled: false,
        macSource: 'config',
      },
      pd: {
        enabled: true,
        protocols: ['PD3.0'],
        voltages: [5, 9, 12, 15, 20],
        currents: [1.5, 3, 5],
        maxPower: 100,
        voltageTolerance: 5,
        currentTolerance: 10,
        ocpThreshold: 5.5,
        otpThreshold: 85,
        emarkerCheck: true,
      },
      sd: {
        enabled: true,
        protocols: ['SD', 'SDXC'],
        speedThresholds: { readMin: 80, writeMin: 40 },
        capacityRange: { min: 8, max: 256 },
        timeout: 60000,
      },
      firmware: {
        enabled: true,
        firmwareTypes: ['USB', 'PD'],
        versionSources: {},
        compareMode: 'exact',
        expectedVersions: {},
      },
    };
  }
}

export const paramService = new ParamService();
