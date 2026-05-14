<script setup lang="ts">
import { computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  VideoPlay, 
  VideoPause, 
  RefreshLeft, 
  Document
} from '@element-plus/icons-vue';
import PageContainer from '@/components/common/PageContainer.vue';
import TestCard from '@/components/test/TestCard.vue';
import TestProgress from '@/components/test/TestProgress.vue';
import TestResult from '@/components/test/TestResult.vue';
import { useTestStore } from '@/stores/testStore';
import { useConfigStore } from '@/stores/configStore';
import { testService } from '@/services/testService';

const { t } = useI18n();
const testStore = useTestStore();
const configStore = useConfigStore();

// 测试项目列表
const testItems = computed(() => testStore.testItems);

// 统计数据
const stats = computed(() => ({
  total: testItems.value.length,
  current: testItems.value.filter(item => 
    item.status === 'passed' || item.status === 'failed'
  ).length,
  passed: testItems.value.filter(item => item.status === 'passed').length,
  failed: testItems.value.filter(item => item.status === 'failed').length,
}));

// 开始测试
const handleStartTest = async () => {
  if (!configStore.currentConfig) {
    return;
  }
  await testStore.startTest();
};

// 停止测试
const handleStopTest = async () => {
  await testStore.stopTest();
};

// 重试测试
const handleRetry = async () => {
  await testStore.resetTest();
  await testStore.startTest();
};

// 导出报告
const handleExportReport = async () => {
  if (!testStore.lastResult) return;
  
  try {
    await testService.exportReport(testStore.lastResult);
  } catch (error) {
    console.error('Export report failed:', error);
  }
};

// 组件卸载时清理
onUnmounted(() => {
  if (testStore.isRunning) {
    testStore.stopTest();
  }
});
</script>

<template>
  <PageContainer :title="t('nav.test')">
    <div class="test-view">
      <!-- 顶部操作栏 -->
      <div class="test-toolbar">
        <div class="toolbar-left">
          <el-button 
            type="primary" 
            size="large"
            :icon="testStore.isRunning ? VideoPause : VideoPlay"
            :disabled="!configStore.currentConfig && !testStore.isRunning"
            @click="testStore.isRunning ? handleStopTest() : handleStartTest()"
          >
            {{ testStore.isRunning ? t('test.stop') : t('test.start') }}
          </el-button>
          <el-button 
            size="large"
            :icon="RefreshLeft"
            :disabled="testStore.isRunning || !testStore.lastResult"
            @click="handleRetry"
          >
            {{ t('test.retry') }}
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button 
            size="large"
            :icon="Document"
            :disabled="!testStore.lastResult"
            @click="handleExportReport"
          >
            {{ t('report.export') }}
          </el-button>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="test-progress-wrapper" v-if="testStore.isRunning || stats.current > 0">
        <TestProgress 
          :total="stats.total"
          :current="stats.current"
          :passed="stats.passed"
          :failed="stats.failed"
        />
      </div>

      <!-- 测试项目网格 -->
      <div class="test-grid" v-if="testItems.length > 0">
        <TestCard
          v-for="(item, index) in testItems"
          :key="item.code"
          :item="item"
          :index="index"
        />
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else-if="!testStore.isRunning">
        <el-empty :description="t('test.emptyState')">
          <el-button type="primary" @click="handleStartTest" :disabled="!configStore.currentConfig">
            {{ t('test.start') }}
          </el-button>
        </el-empty>
      </div>

      <!-- 测试结果 -->
      <div class="test-result-wrapper" v-if="testStore.lastResult && !testStore.isRunning">
        <TestResult :result="testStore.lastResult" />
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.test-view {
  max-width: 1200px;
  margin: 0 auto;
}

.test-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}

.test-progress-wrapper {
  margin-bottom: 24px;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.test-result-wrapper {
  margin-top: 24px;
}
</style>
