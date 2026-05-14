<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Upload, 
  Download, 
  Plus, 
  Delete, 
  Edit,
  Refresh
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import ParamEditor from '@/components/config/ParamEditor.vue';
import { useConfigStore } from '@/stores/configStore';
import { useTestStore } from '@/stores/testStore';
import { paramService } from '@/services/paramService';
import type { TestConfig } from '@/types/config';

const { t } = useI18n();
const configStore = useConfigStore();
const testStore = useTestStore();

// 编辑器状态
const editorVisible = ref(false);
const currentEditConfig = ref<Partial<TestConfig>>({});

// 加载配置列表
onMounted(async () => {
  await configStore.loadConfigs();
});

// 当前选中配置
const currentConfig = computed(() => configStore.currentConfig);

// 配置列表
const configList = computed(() => configStore.configList);

// 选中配置
const handleSelectConfig = (config: TestConfig) => {
  configStore.setCurrentConfig(config);
  ElMessage.success(t('config.selectedSuccess'));
};

// 新建配置
const handleNewConfig = () => {
  currentEditConfig.value = {
    version: '1.0.0',
    name: '',
    description: '',
    product: { model: '', vid: '', pid: '' },
    testItems: {
      usb: true, video: true, audio: true, 
      network: true, pd: true, sd: true, firmware: true
    },
  };
  editorVisible.value = true;
};

// 编辑配置
const handleEditConfig = (config: TestConfig) => {
  currentEditConfig.value = { ...config };
  editorVisible.value = true;
};

// 保存配置
const handleSaveConfig = async (config: Partial<TestConfig>) => {
  await configStore.saveConfig(config as TestConfig);
  ElMessage.success(t('common.success'));
};

// 删除配置
const handleDeleteConfig = async (config: TestConfig) => {
  // 从列表中移除
  const index = configStore.configList.findIndex(c => c.id === config.id);
  if (index > -1) {
    configStore.configList.splice(index, 1);
    ElMessage.success(t('common.success'));
  }
};

// 导入配置
const handleImport = async () => {
  try {
    const config = await paramService.importFromFile();
    if (config) {
      await configStore.saveConfig(config);
      ElMessage.success(t('common.success'));
    }
  } catch (error) {
    console.error('Import failed:', error);
    ElMessage.error(t('common.error'));
  }
};

// 导出配置
const handleExport = async () => {
  if (!currentConfig.value) {
    ElMessage.warning(t('config.noConfigSelected'));
    return;
  }
  
  try {
    await paramService.exportToFile(currentConfig.value);
    ElMessage.success(t('common.success'));
  } catch (error) {
    console.error('Export failed:', error);
    ElMessage.error(t('common.error'));
  }
};

// 应用配置到测试
const handleApplyConfig = () => {
  if (!currentConfig.value) {
    ElMessage.warning(t('config.noConfigSelected'));
    return;
  }
  testStore.applyConfig(currentConfig.value);
  ElMessage.success(t('config.appliedSuccess'));
};
</script>

<template>
  <PageContainer :title="t('nav.config')">
    <div class="config-view">
      <!-- 工具栏 -->
      <div class="config-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleNewConfig">
            {{ t('config.new') }}
          </el-button>
          <el-button :icon="Upload" @click="handleImport">
            {{ t('config.import') }}
          </el-button>
          <el-button :icon="Download" @click="handleExport" :disabled="!currentConfig">
            {{ t('config.export') }}
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Refresh" @click="configStore.loadConfigs">
            {{ t('common.refresh') }}
          </el-button>
        </div>
      </div>

      <el-row :gutter="20">
        <!-- 配置列表 -->
        <el-col :span="8">
          <div class="config-list-card">
            <h3 class="card-title">{{ t('config.list') }}</h3>
            <div class="config-list">
              <div 
                v-for="config in configList"
                :key="config.id"
                :class="['config-item', { 'config-item--active': currentConfig?.id === config.id }]"
                @click="handleSelectConfig(config)"
              >
                <div class="config-item-info">
                  <span class="config-name">{{ config.name }}</span>
                  <span class="config-model">{{ config.product?.model }}</span>
                </div>
                <div class="config-item-actions">
                  <el-button 
                    text 
                    size="small" 
                    @click.stop="handleEditConfig(config)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button 
                    text 
                    size="small" 
                    type="danger"
                    @click.stop="handleDeleteConfig(config)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <el-empty v-if="configList.length === 0" :description="t('config.empty')" />
            </div>
          </div>
        </el-col>

        <!-- 配置详情 -->
        <el-col :span="16">
          <div class="config-detail-card" v-if="currentConfig">
            <div class="detail-header">
              <h3 class="card-title">{{ currentConfig.name }}</h3>
              <el-button type="primary" @click="handleApplyConfig">
                {{ t('config.apply') }}
              </el-button>
            </div>

            <el-descriptions :column="2" border>
              <el-descriptions-item :label="t('config.version')">
                {{ currentConfig.version }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('config.model')">
                {{ currentConfig.product?.model }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('config.vid')">
                {{ currentConfig.product?.vid }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('config.pid')">
                {{ currentConfig.product?.pid }}
              </el-descriptions-item>
            </el-descriptions>

            <h4 class="section-title">{{ t('test.items.title') }}</h4>
            <div class="test-items-grid">
              <el-tag v-if="currentConfig.testItems?.usb" type="success">{{ t('test.items.usb') }}</el-tag>
              <el-tag v-if="currentConfig.testItems?.video" type="success">{{ t('test.items.video') }}</el-tag>
              <el-tag v-if="currentConfig.testItems?.audio" type="success">{{ t('test.items.audio') }}</el-tag>
              <el-tag v-if="currentConfig.testItems?.network" type="success">{{ t('test.items.network') }}</el-tag>
              <el-tag v-if="currentConfig.testItems?.pd" type="success">{{ t('test.items.pd') }}</el-tag>
              <el-tag v-if="currentConfig.testItems?.sd" type="success">{{ t('test.items.sd') }}</el-tag>
              <el-tag v-if="currentConfig.testItems?.firmware" type="success">{{ t('test.items.firmware') }}</el-tag>
            </div>
          </div>

          <el-empty v-else :description="t('config.selectHint')" />
        </el-col>
      </el-row>
    </div>

    <!-- 配置编辑器 -->
    <ParamEditor
      v-model="currentEditConfig"
      v-model:visible="editorVisible"
      @save="handleSaveConfig"
    />
  </PageContainer>
</template>

<style scoped>
.config-view {
  max-width: 1400px;
  margin: 0 auto;
}

.config-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}

.config-list-card,
.config-detail-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  height: calc(100vh - 220px);
  overflow-y: auto;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}

.config-item:hover {
  background-color: var(--bg-color);
}

.config-item--active {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: var(--primary-color);
}

.config-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-name {
  font-weight: 500;
  color: var(--text-primary);
}

.config-model {
  font-size: 12px;
  color: var(--text-secondary);
}

.config-item-actions {
  display: flex;
  gap: 4px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: var(--text-primary);
}

.test-items-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
