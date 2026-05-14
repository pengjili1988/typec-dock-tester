import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TestConfig } from '@/types/config';
import type { TestItem, TestResult } from '@/types/test';

export const useTestStore = defineStore('test', () => {
  // 状态
  const isRunning = ref(false);
  const isPaused = ref(false);
  const currentConfig = ref<TestConfig | null>(null);
  const testItems = ref<TestItem[]>([]);
  const lastResult = ref<TestResult | null>(null);
  const startTime = ref<Date | null>(null);

  // Getters
  const testProgress = computed(() => {
    if (testItems.value.length === 0) return 0;
    const completed = testItems.value.filter(
      item => item.status === 'passed' || item.status === 'failed'
    ).length;
    return Math.round((completed / testItems.value.length) * 100);
  });

  const passedCount = computed(() => {
    return testItems.value.filter(item => item.status === 'passed').length;
  });

  const failedCount = computed(() => {
    return testItems.value.filter(item => item.status === 'failed').length;
  });

  // Actions
  const applyConfig = (config: TestConfig) => {
    currentConfig.value = config;
    initTestItems(config);
  };

  const initTestItems = (config: TestConfig) => {
    testItems.value = [];
    
    const items: { code: string; name: string; label: string }[] = [
      { code: 'usb', name: 'USB', label: 'test.items.usb' },
      { code: 'video', name: 'Video', label: 'test.items.video' },
      { code: 'audio', name: 'Audio', label: 'test.items.audio' },
      { code: 'network', name: 'Network', label: 'test.items.network' },
      { code: 'pd', name: 'PD', label: 'test.items.pd' },
      { code: 'sd', name: 'SD', label: 'test.items.sd' },
      { code: 'firmware', name: 'Firmware', label: 'test.items.firmware' },
    ];

    items.forEach(item => {
      if (config.testItems?.[item.code as keyof typeof config.testItems]) {
        testItems.value.push({
          code: item.code,
          name: item.name,
          label: item.label,
          status: 'idle',
          progress: 0,
        });
      }
    });
  };

  const startTest = async () => {
    if (isRunning.value) return;
    
    isRunning.value = true;
    isPaused.value = false;
    startTime.value = new Date();
    
    // 重置测试项状态
    testItems.value.forEach(item => {
      item.status = 'idle';
      item.progress = 0;
      item.actualValue = undefined;
      item.errorMessage = undefined;
    });
    
    // 模拟测试流程
    await simulateTest();
  };

  const stopTest = async () => {
    isRunning.value = false;
    isPaused.value = false;
    
    // 生成测试结果
    generateResult();
  };

  const pauseTest = () => {
    isPaused.value = true;
  };

  const resumeTest = () => {
    isPaused.value = false;
  };

  const resetTest = () => {
    isRunning.value = false;
    isPaused.value = false;
    testItems.value.forEach(item => {
      item.status = 'idle';
      item.progress = 0;
      item.actualValue = undefined;
      item.errorMessage = undefined;
    });
    lastResult.value = null;
    startTime.value = null;
  };

  // 模拟测试流程
  const simulateTest = async () => {
    for (const item of testItems.value) {
      if (!isRunning.value) break;
      
      item.status = 'running';
      item.progress = 0;
      
      // 模拟测试进度
      for (let i = 0; i <= 100; i += 10) {
        if (!isRunning.value) break;
        await new Promise(resolve => setTimeout(resolve, 100));
        item.progress = i;
      }
      
      // 模拟测试结果（90%通过率）
      const passed = Math.random() > 0.1;
      item.status = passed ? 'passed' : 'failed';
      item.actualValue = passed ? Math.floor(Math.random() * 100) + 50 : undefined;
      item.errorMessage = passed ? undefined : '测试失败: 超时';
    }
    
    if (isRunning.value) {
      isRunning.value = false;
      generateResult();
    }
  };

  const generateResult = () => {
    const passed = testItems.value.filter(item => item.status === 'passed').length;
    const failed = testItems.value.filter(item => item.status === 'failed').length;
    const total = testItems.value.length;
    
    lastResult.value = {
      id: `result-${Date.now()}`,
      configId: currentConfig.value?.id || '',
      configName: currentConfig.value?.name || '',
      startTime: startTime.value?.toISOString() || '',
      endTime: new Date().toISOString(),
      status: failed > 0 ? 'failed' : 'passed',
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      },
      items: testItems.value.map(item => {
        let resultStatus: 'passed' | 'failed' | 'timeout' | 'error' = 'error';
        if (item.status === 'passed') resultStatus = 'passed';
        else if (item.status === 'failed') resultStatus = 'failed';
        return {
          code: item.code,
          name: item.name,
          status: resultStatus,
          actualValue: item.actualValue,
          expectedValue: item.expectedValue,
          unit: item.unit,
          errorMessage: item.errorMessage,
          duration: item.duration,
        };
      }),
    };
  };

  const updateItemStatus = (code: string, status: TestItem['status'], data?: Partial<TestItem>) => {
    const item = testItems.value.find(i => i.code === code);
    if (item) {
      item.status = status;
      if (data) {
        Object.assign(item, data);
      }
    }
  };

  return {
    // 状态
    isRunning,
    isPaused,
    currentConfig,
    testItems,
    lastResult,
    startTime,
    // Getters
    testProgress,
    passedCount,
    failedCount,
    // Actions
    applyConfig,
    initTestItems,
    startTest,
    stopTest,
    pauseTest,
    resumeTest,
    resetTest,
    updateItemStatus,
  };
});
