<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import {
  HomeFilled,
  Monitor,
  Tools,
  Setting,
} from '@element-plus/icons-vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// 菜单配置
const menuItems = [
  {
    key: 'home',
    icon: HomeFilled,
    title: 'nav.home',
    path: '/',
  },
  {
    key: 'test',
    icon: Monitor,
    title: 'nav.test',
    path: '/test',
  },
  {
    key: 'config',
    icon: Tools,
    title: 'nav.config',
    path: '/config',
  },
];

// 处理菜单点击
const handleMenuClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">{{ t('app.name') }}</h3>
      <span class="sidebar-version">v1.0.0</span>
    </div>

    <el-menu
      :default-active="route.path"
      class="sidebar-menu"
      :collapse="false"
      :router="false"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.key"
        :index="item.path"
        @click="handleMenuClick(item.path)"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <template #title>
          <span>{{ t(item.title) }}</span>
        </template>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer">
      <div class="sidebar-footer-item" @click="handleMenuClick('/settings')">
        <el-icon><Setting /></el-icon>
        <span>{{ t('nav.settings') }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--sidebar-bg);
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-version {
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
}

:deep(.el-menu-item:hover) {
  background-color: var(--bg-color);
}

:deep(.el-menu-item.is-active) {
  background-color: var(--primary-color);
  color: #fff;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #fff;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-light);
}

.sidebar-footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all var(--transition-fast);
}

.sidebar-footer-item:hover {
  background-color: var(--bg-color);
  color: var(--primary-color);
}
</style>
