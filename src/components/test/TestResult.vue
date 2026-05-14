<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Close, Clock, Warning } from '@element-plus/icons-vue';
import type { TestResult } from '@/types/test';

interface Props {
  result: TestResult;
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: true,
});

const { t, d } = useI18n();

// 状态图标映射
const statusIcon = computed(() => {
  switch (props.result.status) {
    case 'passed':
      return Check;
    case 'failed':
      return Close;
    case 'timeout':
      return Clock;
    default:
      return Warning;
  }
});

// 状态类型映射
const statusType = computed(() => {
  switch (props.result.status) {
    case 'passed':
      return 'success';
    case 'failed':
      return 'danger';
    case 'timeout':
      return 'warning';
    default:
      return 'info';
  }
});

// 格式化时间
const formatTime = (time: string | Date) => {
  return d(new Date(time), 'long');
};
</script>

<template>
  <div :class="['test-result', `test-result--${result.status}`]">
    <div class="result-header">
      <div class="result-status">
        <el-icon :size="32" :class="`text-${statusType}`">
          <component :is="statusIcon" />
        </el-icon>
      </div>
      <div class="result-summary">
        <h3 class="result-title">
          {{ result.status === 'passed' ? t('test.results.pass') : t('test.results.fail') }}
        </h3>
        <p class="result-time">{{ formatTime(result.endTime || result.startTime) }}</p>
      </div>
    </div>

    <div class="result-stats">
      <div class="stat-card">
        <span class="stat-value text-success">{{ result.summary.passed }}</span>
        <span class="stat-label">{{ t('test.status.passed') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value text-danger">{{ result.summary.failed }}</span>
        <span class="stat-label">{{ t('test.status.failed') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ result.summary.total }}</span>
        <span class="stat-label">{{ t('report.summary.total') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ result.summary.passRate }}%</span>
        <span class="stat-label">{{ t('report.summary.passRate') }}</span>
      </div>
    </div>

    <div v-if="showDetails && result.items.length > 0" class="result-details">
      <h4 class="details-title">{{ t('test.results.title') }}</h4>
      <el-table :data="result.items" size="small" border>
        <el-table-column prop="name" :label="t('test.items.usb')" min-width="120" />
        <el-table-column prop="status" :label="t('test.status.idle')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'passed' ? 'success' : 'danger'" size="small">
              {{ row.status === 'passed' ? t('test.status.passed') : t('test.status.failed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualValue" :label="t('config.title')" width="120">
          <template #default="{ row }">
            {{ row.actualValue !== undefined ? `${row.actualValue} ${row.unit || ''}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" :label="t('common.error')" min-width="150">
          <template #default="{ row }">
            <span v-if="row.errorMessage" class="text-danger">{{ row.errorMessage }}</span>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.test-result {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.test-result--passed {
  border: 2px solid var(--success-color);
}

.test-result--failed {
  border: 2px solid var(--danger-color);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.result-summary {
  flex: 1;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.result-time {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: var(--bg-color);
  border-radius: 8px;
}

.stat-card .stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-card .stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
.text-warning { color: var(--warning-color); }

.result-details {
  border-top: 1px solid var(--border-light);
  padding-top: 20px;
}

.details-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.text-secondary {
  color: var(--text-secondary);
}
</style>
