<script setup lang="ts">
import { computed } from 'vue';

type BadgeType = 'success' | 'warning' | 'danger' | 'info' | 'primary';
type BadgeSize = 'small' | 'default' | 'large';

interface Props {
  type?: BadgeType;
  size?: BadgeSize;
  text?: string;
  pulse?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'default',
  text: '',
  pulse: false,
});

const badgeClasses = computed(() => [
  'status-badge',
  `status-badge--${props.type}`,
  `status-badge--${props.size}`,
  { 'status-badge--pulse': props.pulse },
]);
</script>

<template>
  <span :class="badgeClasses">
    <span v-if="pulse" class="status-badge-dot"></span>
    <slot>{{ text }}</slot>
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge--small {
  padding: 2px 8px;
  font-size: 11px;
}

.status-badge--large {
  padding: 6px 14px;
  font-size: 14px;
}

.status-badge--success {
  background-color: rgba(103, 194, 58, 0.1);
  color: var(--success-color);
}

.status-badge--warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: var(--warning-color);
}

.status-badge--danger {
  background-color: rgba(245, 108, 108, 0.1);
  color: var(--danger-color);
}

.status-badge--info {
  background-color: rgba(144, 147, 153, 0.1);
  color: var(--info-color);
}

.status-badge--primary {
  background-color: rgba(64, 158, 255, 0.1);
  color: var(--primary-color);
}

.status-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-badge--pulse .status-badge-dot {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}
</style>
