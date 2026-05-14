<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { 
  Connection, 
  Monitor, 
  Document, 
  Warning,
  Check,
  RefreshRight
} from '@element-plus/icons-vue';
import PageContainer from '@/components/common/PageContainer.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useTestStore } from '@/stores/testStore';
import { useConfigStore } from '@/stores/configStore';

const { t } = useI18n();
const router = useRouter();
const testStore = useTestStore();
const configStore = useConfigStore();

// 设备状态
const deviceStatus = computed(() => {
  if (testStore.isRunning) return 'running';
  if (testStore.lastResult) return testStore.lastResult.status;
  return 'idle';
});

// 跳转到测试页面
const goToTest = () => {
  router.push('/test');
};

// 跳转到配置页面
const goToConfig = () => {
  router.push('/config');
};
</script>

<template>
  <PageContainer :title="t('nav.home')">
    <div class="home-view">
      <!-- 设备状态卡片 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="8">
          <div class="card status-card">
            <div class="card-icon status-icon--device">
              <el-icon :size="32"><Connection /></el-icon>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ t('home.deviceStatus') }}</h3>
              <StatusBadge
                :type="deviceStatus === 'idle' ? 'info' : deviceStatus === 'passed' ? 'success' : 'danger'"
                :text="t(`test.status.${deviceStatus}`)"
                :pulse="deviceStatus === 'running'"
              />
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="card status-card">
            <div class="card-icon status-icon--mes">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ t('mes.status.title') }}</h3>
              <StatusBadge
                :type="configStore.mesConnected ? 'success' : 'warning'"
                :text="t(configStore.mesConnected ? 'mes.status.connected' : 'mes.status.disconnected')"
              />
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="card status-card">
            <div class="card-icon status-icon--config">
              <el-icon :size="32"><Monitor /></el-icon>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ t('home.currentConfig') }}</h3>
              <p class="config-name">{{ configStore.currentConfig?.name || t('home.noConfig') }}</p>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="24">
          <div class="card quick-actions">
            <h3 class="section-title">{{ t('home.quickActions') }}</h3>
            <div class="action-buttons">
              <el-button type="primary" size="large" @click="goToTest">
                <el-icon class="el-icon--left"><Monitor /></el-icon>
                {{ t('test.start') }}
              </el-button>
              <el-button size="large" @click="goToConfig">
                <el-icon class="el-icon--left"><Document /></el-icon>
                {{ t('config.title') }}
              </el-button>
              <el-button size="large">
                <el-icon class="el-icon--left"><RefreshRight /></el-icon>
                {{ t('common.refresh') }}
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 最近测试结果 -->
      <el-row :gutter="20" v-if="testStore.lastResult">
        <el-col :span="24">
          <div class="card recent-result">
            <h3 class="section-title">{{ t('home.recentResult') }}</h3>
            <div class="result-summary">
              <div class="result-item result-item--total">
                <span class="result-value">{{ testStore.lastResult.summary.total }}</span>
                <span class="result-label">{{ t('report.summary.total') }}</span>
              </div>
              <div class="result-item result-item--passed">
                <el-icon><Check /></el-icon>
                <span class="result-value">{{ testStore.lastResult.summary.passed }}</span>
                <span class="result-label">{{ t('report.summary.passed') }}</span>
              </div>
              <div class="result-item result-item--failed">
                <el-icon><Warning /></el-icon>
                <span class="result-value">{{ testStore.lastResult.summary.failed }}</span>
                <span class="result-label">{{ t('report.summary.failed') }}</span>
              </div>
              <div class="result-item result-item--rate">
                <span class="result-value">{{ testStore.lastResult.summary.passRate }}%</span>
                <span class="result-label">{{ t('report.summary.passRate') }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </PageContainer>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.mb-4 {
  margin-bottom: 20px;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  height: 100%;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  flex-shrink: 0;
}

.status-icon--device {
  background-color: rgba(64, 158, 255, 0.1);
  color: var(--primary-color);
}

.status-icon--mes {
  background-color: rgba(103, 194, 58, 0.1);
  color: var(--success-color);
}

.status-icon--config {
  background-color: rgba(230, 162, 60, 0.1);
  color: var(--warning-color);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.config-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.quick-actions {
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.recent-result .result-summary {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.result-value {
  font-size: 36px;
  font-weight: 700;
}

.result-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.result-item--passed {
  color: var(--success-color);
}

.result-item--failed {
  color: var(--danger-color);
}

.result-item--rate {
  color: var(--primary-color);
}
</style>
