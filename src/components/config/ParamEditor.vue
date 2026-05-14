<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TestConfig } from '@/types/config';

interface Props {
  modelValue: Partial<TestConfig>;
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<TestConfig>): void;
  (e: 'update:visible', value: boolean): void;
  (e: 'save', value: Partial<TestConfig>): void;
}>();

const { t } = useI18n();

// 表单数据
const formData = reactive<Partial<TestConfig>>({
  version: '1.0.0',
  name: '',
  description: '',
  product: {
    model: '',
    vid: '',
    pid: '',
  },
  testItems: {
    usb: true,
    video: true,
    audio: true,
    network: true,
    pd: true,
    sd: true,
    firmware: true,
  },
  usb: {
    enabled: true,
    protocols: ['USB3.0'],
    speedThresholds: { readMin: 200, writeMin: 100 },
    voltageRange: { min: 4.75, max: 5.25 },
    ovpThreshold: 5.8,
    vidPidCheck: { expectedVid: '', expectedPid: '' },
    timeout: 30000,
    retries: 3,
  },
});

// 监听传入值变化
watch(
  () => props.modelValue,
  (val) => {
    Object.assign(formData, val);
  },
  { immediate: true, deep: true }
);

// 保存表单
const handleSave = () => {
  emit('save', { ...formData });
  emit('update:visible', false);
};

// 取消
const handleCancel = () => {
  emit('update:visible', false);
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="t('config.title')"
    width="600px"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form :model="formData" label-width="120px" class="param-form">
      <!-- 基本信息 -->
      <el-divider content-position="left">{{ t('config.product') }}</el-divider>
      
      <el-form-item :label="t('config.model')">
        <el-input v-model="formData.name" :placeholder="t('config.model')" />
      </el-form-item>

      <el-form-item :label="t('config.vid')">
        <el-input v-model="formData.product!.vid" placeholder="0x1234" />
      </el-form-item>

      <el-form-item :label="t('config.pid')">
        <el-input v-model="formData.product!.pid" placeholder="0x5678" />
      </el-form-item>

      <!-- 测试开关 -->
      <el-divider content-position="left">{{ t('config.featureFlags.mes') }}</el-divider>

      <el-form-item :label="t('test.items.usb')">
        <el-switch v-model="formData.testItems!.usb" />
      </el-form-item>

      <el-form-item :label="t('test.items.video')">
        <el-switch v-model="formData.testItems!.video" />
      </el-form-item>

      <el-form-item :label="t('test.items.audio')">
        <el-switch v-model="formData.testItems!.audio" />
      </el-form-item>

      <el-form-item :label="t('test.items.network')">
        <el-switch v-model="formData.testItems!.network" />
      </el-form-item>

      <el-form-item :label="t('test.items.pd')">
        <el-switch v-model="formData.testItems!.pd" />
      </el-form-item>

      <el-form-item :label="t('test.items.sd')">
        <el-switch v-model="formData.testItems!.sd" />
      </el-form-item>

      <el-form-item :label="t('test.items.firmware')">
        <el-switch v-model="formData.testItems!.firmware" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.param-form {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
