<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  total: number;
  current: number;
  passed: number;
  failed: number;
}

const props = defineProps<Props>();

const { t } = useI18n();

// 计算进度百分比
const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.round((props.current / props.total) * 100);
});

// 进度状态
const progressStatus = computed(() => {
  if (props.failed > 0) return 'exception';
  if (props.current === props.total) return 'success';
  return '';
});
</script>

<template>
  <div class="test-progress">
    <div class="progress-header">
      <span class="progress-title">{{ t('test.progress.title') }}</span>
      <span class="progress-count">{{ current }} / {{ total }}</span>
    </div>

    <el-progress
      :percentage="percentage"
      :status="progressStatus"
      :stroke-width="12"
      :show-text="false"
      class="progress-bar"
    />

    <div class="progress-stats">
      <div class="stat-item stat-item--passed">
        <span class="stat-value">{{ passed }}</span>
        <span class="stat-label">{{ t('test.status.passed') }}</span>
      </div>
      <div class="stat-item stat-item--failed">
        <span class="stat-value">{{ failed }}</span>
        <span class="stat-label">{{ t('test.status.failed') }}</span>
      </div>
      <div class="stat-item stat-item--pending">
        <span class="stat-value">{{ total - current }}</span>
        <span class="stat-label">{{ t('test.status.idle') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-progress {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  font-weight: 600;
  color: var(--text-primary);
}

.progress-count {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.progress-bar {
  margin-bottom: 16px;
}

.progress-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-item--passed .stat-value {
  color: var(--success-color);
}

.stat-item--failed .stat-value {
  color: var(--danger-color);
}

.stat-item--pending .stat-value {
  color: var(--text-secondary);
}
</style>
