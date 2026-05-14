<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { 
  HomeFilled, 
  Setting,
  Tools,
  Monitor,
  Connection
} from '@element-plus/icons-vue';
import { useConfigStore } from '@/stores/configStore';

const { t } = useI18n();
const router = useRouter();
const configStore = useConfigStore();

// 导航菜单
const menuItems = computed(() => [
  {
    key: 'home',
    icon: HomeFilled,
    title: t('nav.home'),
    path: '/',
  },
  {
    key: 'test',
    icon: Monitor,
    title: t('nav.test'),
    path: '/test',
  },
  {
    key: 'config',
    icon: Tools,
    title: t('nav.config'),
    path: '/config',
  },
]);

// 处理菜单点击
const handleMenuClick = (item: { key: string; path: string }) => {
  router.push(item.path);
};

// 语言切换
const handleLanguageChange = (lang: string) => {
  configStore.setLanguage(lang as 'zh-CN' | 'vi-VN');
};

// 跳转到设置页面
const goToSettings = () => {
  router.push('/settings');
};
</script>

<template>
  <header class="header">
    <div class="header-left">
      <div class="logo">
        <el-icon class="logo-icon" :size="24">
          <Connection />
        </el-icon>
        <span class="logo-text">{{ t('app.name') }}</span>
      </div>
    </div>

    <div class="header-center">
      <nav class="nav-menu">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: router.currentRoute.value.path === item.path }"
          @click="handleMenuClick(item)"
        >
          <el-icon :size="18">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text">{{ item.title }}</span>
        </div>
      </nav>
    </div>

    <div class="header-right">
      <!-- MES状态指示 -->
      <div class="status-indicator" v-if="configStore.mesEnabled">
        <el-tag :type="configStore.mesConnected ? 'success' : 'warning'" size="small">
          <el-icon v-if="configStore.mesConnected"><Connection /></el-icon>
          {{ configStore.mesConnected ? t('mes.status.connected') : t('mes.status.disconnected') }}
        </el-tag>
      </div>

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="handleLanguageChange">
        <div class="language-selector">
          <el-icon><Setting /></el-icon>
          <span>{{ configStore.language === 'zh-CN' ? '中文' : 'Tiếng Việt' }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN" :selected="configStore.language === 'zh-CN'">
              简体中文
            </el-dropdown-item>
            <el-dropdown-item command="vi-VN" :selected="configStore.language === 'vi-VN'">
              Tiếng Việt
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 设置按钮 -->
      <el-button text @click="goToSettings">
        <el-icon><Setting /></el-icon>
      </el-button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  color: var(--primary-color);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background-color: var(--bg-color);
  color: var(--primary-color);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: #fff;
}

.nav-item.active .nav-text {
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  display: flex;
  align-items: center;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all var(--transition-fast);
}

.language-selector:hover {
  background-color: var(--bg-color);
  color: var(--primary-color);
}
</style>
