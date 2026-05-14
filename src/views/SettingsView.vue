<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Operation, 
  Connection, 
  Monitor, 
  Printer,
  InfoFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import { useConfigStore } from '@/stores/configStore';
import type { Locale } from '@/locales';

const { t, locale } = useI18n();
const configStore = useConfigStore();

// 语言选项
const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'vi-VN', label: 'Tiếng Việt' },
];

// MES配置表单
const mesForm = reactive({
  serverUrl: '',
  apiKey: '',
  factoryCode: '',
  lineCode: '',
});

// 扫码配置表单
const scanForm = reactive({
  enabled: false,
  port: 'COM1',
  baudRate: 9600,
});

// 打印配置表单
const printForm = reactive({
  enabled: false,
  printerName: '',
  autoPrint: false,
});

// 当前语言
const currentLanguage = computed({
  get: () => configStore.language,
  set: (val: Locale) => {
    configStore.setLanguage(val);
    locale.value = val;
    ElMessage.success(t('settings.languageChanged'));
  },
});

// 功能开关
const mesEnabled = computed({
  get: () => configStore.mesEnabled,
  set: (val: boolean) => configStore.toggleFeature('mes', val),
});

const scanEnabled = computed({
  get: () => configStore.scanEnabled,
  set: (val: boolean) => configStore.toggleFeature('scan', val),
});

const printEnabled = computed({
  get: () => configStore.printEnabled,
  set: (val: boolean) => configStore.toggleFeature('print', val),
});

// 保存MES配置
const handleSaveMesConfig = async () => {
  await configStore.saveMesConfig(mesForm);
  ElMessage.success(t('common.success'));
};

// 保存扫码配置
const handleSaveScanConfig = async () => {
  await configStore.saveScanConfig(scanForm);
  ElMessage.success(t('common.success'));
};

// 保存打印配置
const handleSavePrintConfig = async () => {
  await configStore.savePrintConfig(printForm);
  ElMessage.success(t('common.success'));
};

// 测试MES连接
const handleTestMesConnection = async () => {
  ElMessage.info(t('settings.testingConnection'));
  // TODO: 实现MES连接测试
};
</script>

<template>
  <PageContainer :title="t('nav.settings')">
    <div class="settings-view">
      <!-- 语言设置 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Operation /></el-icon>
            <span>{{ t('settings.language') }}</span>
          </div>
        </template>
        <el-form label-width="120px">
          <el-form-item :label="t('settings.currentLanguage')">
            <el-select v-model="currentLanguage" style="width: 200px">
              <el-option
                v-for="option in languageOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 功能开关 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>{{ t('settings.featureFlags') }}</span>
          </div>
        </template>
        <el-form label-width="140px">
          <el-form-item :label="t('config.featureFlags.mes')">
            <el-switch v-model="mesEnabled" />
          </el-form-item>
          <el-form-item :label="t('config.featureFlags.scan')">
            <el-switch v-model="scanEnabled" />
          </el-form-item>
          <el-form-item :label="t('config.featureFlags.print')">
            <el-switch v-model="printEnabled" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- MES配置 -->
      <el-card class="settings-card" v-if="mesEnabled">
        <template #header>
          <div class="card-header">
            <el-icon><Connection /></el-icon>
            <span>{{ t('settings.mes') }}</span>
          </div>
        </template>
        <el-form :model="mesForm" label-width="140px">
          <el-form-item :label="t('settings.serverUrl')">
            <el-input v-model="mesForm.serverUrl" :placeholder="t('settings.serverUrlHint')" />
          </el-form-item>
          <el-form-item :label="t('settings.apiKey')">
            <el-input v-model="mesForm.apiKey" type="password" show-password />
          </el-form-item>
          <el-form-item :label="t('settings.factoryCode')">
            <el-input v-model="mesForm.factoryCode" />
          </el-form-item>
          <el-form-item :label="t('settings.lineCode')">
            <el-input v-model="mesForm.lineCode" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveMesConfig">
              {{ t('common.save') }}
            </el-button>
            <el-button @click="handleTestMesConnection">
              {{ t('settings.testConnection') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 扫码配置 -->
      <el-card class="settings-card" v-if="scanEnabled">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>{{ t('settings.scan') }}</span>
          </div>
        </template>
        <el-form :model="scanForm" label-width="140px">
          <el-form-item :label="t('settings.comPort')">
            <el-input v-model="scanForm.port" />
          </el-form-item>
          <el-form-item :label="t('settings.baudRate')">
            <el-select v-model="scanForm.baudRate" style="width: 200px">
              <el-option :value="9600" label="9600" />
              <el-option :value="19200" label="19200" />
              <el-option :value="38400" label="38400" />
              <el-option :value="115200" label="115200" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveScanConfig">
              {{ t('common.save') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 打印配置 -->
      <el-card class="settings-card" v-if="printEnabled">
        <template #header>
          <div class="card-header">
            <el-icon><Printer /></el-icon>
            <span>{{ t('settings.print') }}</span>
          </div>
        </template>
        <el-form :model="printForm" label-width="140px">
          <el-form-item :label="t('settings.printer')">
            <el-input v-model="printForm.printerName" />
          </el-form-item>
          <el-form-item :label="t('settings.autoPrint')">
            <el-switch v-model="printForm.autoPrint" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSavePrintConfig">
              {{ t('common.save') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 关于 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ t('settings.about') }}</span>
          </div>
        </template>
        <div class="about-content">
          <h2>TYPE-C扩展坞产测系统</h2>
          <p>v1.0.0</p>
          <p>{{ t('settings.copyright') }}</p>
        </div>
      </el-card>
    </div>
  </PageContainer>
</template>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.about-content {
  text-align: center;
  padding: 20px 0;
}

.about-content h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.about-content p {
  color: var(--text-secondary);
  margin: 4px 0;
}
</style>
