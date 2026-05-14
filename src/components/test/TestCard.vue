<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Close, Loading } from '@element-plus/icons-vue';
import type { TestItem } from '@/types/test';

interface Props {
  item: TestItem;
  index: number;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

const { t } = useI18n();

// 状态映射
const statusConfig: Record<string, { type: 'info' | 'warning' | 'success' | 'danger'; icon: any; label: string }> = {
  idle: { type: 'info', icon: '', label: t('test.status.idle') },
  running: { type: 'warning', icon: Loading, label: t('test.status.running') },
  passed: { type: 'success', icon: Check, label: t('test.status.passed') },
  failed: { type: 'danger', icon: Close, label: t('test.status.failed') },
};

const currentStatus = computed(() => statusConfig[props.item.status] || statusConfig.idle);
</script>

<template>
  <div :class="['test-card', `test-card--${item.status}`, { 'test-card--compact': compact }]">
    <div class="test-card-header">
      <span class="test-card-index">{{ index + 1 }}</span>
      <span class="test-card-name">{{ item.name }}</span>
    </div>

    <div class="test-card-body">
      <div class="test-card-info">
        <span class="test-card-label">{{ item.label || item.name }}</span>
        <span class="test-card-value" v-if="item.actualValue !== undefined">
          {{ item.actualValue }} {{ item.unit || '' }}
        </span>
      </div>

      <div class="test-card-status">
        <el-tag :type="currentStatus.type" size="small">
          <el-icon v-if="currentStatus.icon" :class="{ 'animate-spin': item.status === 'running' }">
            <component :is="currentStatus.icon" />
          </el-icon>
          {{ currentStatus.label }}
        </el-tag>
      </div>
    </div>

    <div v-if="item.errorMessage && item.status === 'failed'" class="test-card-error">
      {{ item.errorMessage }}
    </div>

    <el-progress
      v-if="item.status === 'running'"
      :percentage="item.progress || 0"
      :show-text="false"
      :stroke-width="4"
      class="test-card-progress"
    />
  </div>
</template>

<style scoped>
.test-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.test-card:hover {
  box-shadow: var(--shadow-md);
}

.test-card--running {
  border-color: var(--warning-color);
}

.test-card--passed {
  border-color: var(--success-color);
  background-color: rgba(103, 194, 58, 0.02);
}

.test-card--failed {
  border-color: var(--danger-color);
  background-color: rgba(245, 108, 108, 0.02);
}

.test-card--compact {
  padding: 12px;
}

.test-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.test-card-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--bg-color);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.test-card--passed .test-card-index {
  background-color: var(--success-color);
  color: #fff;
}

.test-card--failed .test-card-index {
  background-color: var(--danger-color);
  color: #fff;
}

.test-card-name {
  font-weight: 600;
  color: var(--text-primary);
}

.test-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.test-card-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.test-card-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.test-card-error {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: rgba(245, 108, 108, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: var(--danger-color);
}

.test-card-progress {
  margin-top: 12px;
}
</style>
