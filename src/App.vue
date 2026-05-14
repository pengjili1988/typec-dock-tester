<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeader from '@/components/common/AppHeader.vue';
import AppSidebar from '@/components/common/AppSidebar.vue';
import PageContainer from '@/components/common/PageContainer.vue';
import { useConfigStore } from '@/stores/configStore';
import { $elementLocaleZhCn, $elementLocaleVi } from '@/locales';

const { locale } = useI18n();
const configStore = useConfigStore();

// 获取Element Plus语言包
const getElementLocale = () => {
  return locale.value === 'vi-VN' ? $elementLocaleVi : $elementLocaleZhCn;
};

// 监听语言变化
watch(
  () => configStore.language,
  (newLang) => {
    locale.value = newLang;
  }
);

onMounted(() => {
  // 加载配置
  configStore.loadConfig();
});
</script>

<template>
  <el-config-provider :locale="getElementLocale()">
    <div class="app-container">
      <!-- 顶部导航 -->
      <AppHeader />
      
      <!-- 主体内容区域 -->
      <div class="app-body">
        <!-- 侧边栏 -->
        <AppSidebar class="app-sidebar" />
        
        <!-- 主内容区 -->
        <main class="app-main">
          <PageContainer>
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </PageContainer>
        </main>
      </div>
    </div>
  </el-config-provider>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-color);
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  flex-shrink: 0;
  width: 220px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--bg-color);
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
