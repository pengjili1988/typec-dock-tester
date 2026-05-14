<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  padding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  showHeader: true,
  padding: true,
});

const containerClasses = computed(() => [
  'page-container',
  { 'page-container--no-padding': !props.padding },
]);
</script>

<template>
  <div :class="containerClasses">
    <div v-if="showHeader && (title || subtitle || $slots.header)" class="page-header">
      <div class="page-header-content">
        <h1 v-if="title" class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.header" class="page-header-extra">
        <slot name="header"></slot>
      </div>
    </div>

    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-container--no-padding .page-content {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.page-header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.page-header-extra {
  flex-shrink: 0;
  margin-left: 16px;
}

.page-content {
  flex: 1;
  overflow-y: auto;
}
</style>
