import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import zhCn from '@/locales/zh-CN.json';
import viVn from '@/locales/vi-VN.json';
import type { TestConfig } from '@/types/config';

export type Locale = 'zh-CN' | 'vi-VN';

export const SUPPORTED_LOCALES: { value: Locale; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'vi-VN', label: 'Tiếng Việt' },
];

export const DEFAULT_LOCALE: Locale = 'zh-CN';

// 默认配置
const DEFAULT_CONFIG: Partial<TestConfig> = {
  version: '1.0.0',
  name: '默认配置',
  product: {
    model: 'USBC-001',
    vid: '0x1234',
    pid: '0x5678',
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
};

export const useConfigStore = defineStore('config', () => {
  // 状态
  const language = ref<Locale>('zh-CN');
  const mesEnabled = ref(false);
  const scanEnabled = ref(false);
  const printEnabled = ref(false);
  const mesConnected = ref(false);
  const currentConfigId = ref<string | null>(null);
  const configList = ref<TestConfig[]>([]);
  const mesConfig = ref({
    serverUrl: '',
    apiKey: '',
    factoryCode: '',
    lineCode: '',
  });
  const scanConfig = ref({
    enabled: false,
    port: 'COM1',
    baudRate: 9600,
  });
  const printConfig = ref({
    enabled: false,
    printerName: '',
    autoPrint: false,
  });

  // Getters
  const currentConfig = computed(() => {
    return configList.value.find(c => c.id === currentConfigId.value) || null;
  });

  // Actions
  const setLanguage = (lang: Locale) => {
    language.value = lang;
    localStorage.setItem('language', lang);
  };

  const toggleFeature = (feature: 'mes' | 'scan' | 'print', enabled: boolean) => {
    switch (feature) {
      case 'mes':
        mesEnabled.value = enabled;
        break;
      case 'scan':
        scanEnabled.value = enabled;
        break;
      case 'print':
        printEnabled.value = enabled;
        break;
    }
    saveConfig();
  };

  const setCurrentConfig = (config: TestConfig) => {
    if (config.id) {
      currentConfigId.value = config.id;
      localStorage.setItem('currentConfigId', config.id);
    }
  };

  const loadConfig = () => {
    // 加载语言设置
    const savedLang = localStorage.getItem('language') as Locale;
    if (savedLang && SUPPORTED_LOCALES.some(l => l.value === savedLang)) {
      language.value = savedLang;
    }

    // 加载功能开关
    const savedFlags = localStorage.getItem('featureFlags');
    if (savedFlags) {
      try {
        const flags = JSON.parse(savedFlags);
        mesEnabled.value = flags.mes ?? false;
        scanEnabled.value = flags.scan ?? false;
        printEnabled.value = flags.print ?? false;
      } catch (e) {
        console.error('Failed to parse feature flags:', e);
      }
    }

    // 加载当前配置ID
    const savedConfigId = localStorage.getItem('currentConfigId');
    if (savedConfigId) {
      currentConfigId.value = savedConfigId;
    }

    // 加载配置列表
    loadConfigs();
  };

  const loadConfigs = async () => {
    const savedConfigs = localStorage.getItem('configList');
    if (savedConfigs) {
      try {
        configList.value = JSON.parse(savedConfigs);
      } catch (e) {
        console.error('Failed to parse config list:', e);
        configList.value = [];
      }
    }

    // 如果没有配置，添加默认配置
    if (configList.value.length === 0) {
      const defaultConfig: TestConfig = {
        ...DEFAULT_CONFIG,
        id: 'default-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as TestConfig;
      configList.value.push(defaultConfig);
      saveConfigs();
    }

    // 设置当前配置
    if (!currentConfigId.value && configList.value.length > 0) {
      setCurrentConfig(configList.value[0]);
    }
  };

  const saveConfigs = () => {
    localStorage.setItem('configList', JSON.stringify(configList.value));
  };

  const saveConfig = (config?: TestConfig) => {
    if (config) {
      // 保存单个配置到列表
      const index = configList.value.findIndex(c => c.id === config.id);
      if (index >= 0) {
        configList.value[index] = config;
      } else {
        configList.value.push(config);
      }
    }
    saveConfigs();
  };

  const saveMesConfig = async (config: typeof mesConfig.value) => {
    mesConfig.value = config;
    localStorage.setItem('mesConfig', JSON.stringify(config));
  };

  const saveScanConfig = async (config: typeof scanConfig.value) => {
    scanConfig.value = config;
    localStorage.setItem('scanConfig', JSON.stringify(config));
  };

  const savePrintConfig = async (config: typeof printConfig.value) => {
    printConfig.value = config;
    localStorage.setItem('printConfig', JSON.stringify(config));
  };

  return {
    // 状态
    language,
    mesEnabled,
    scanEnabled,
    printEnabled,
    mesConnected,
    currentConfigId,
    configList,
    mesConfig,
    scanConfig,
    printConfig,
    // Getters
    currentConfig,
    // Actions
    setLanguage,
    toggleFeature,
    setCurrentConfig,
    loadConfig,
    loadConfigs,
    saveConfig,
    saveMesConfig,
    saveScanConfig,
    savePrintConfig,
  };
});

// 导出翻译消息
export { zhCn, viVn };
