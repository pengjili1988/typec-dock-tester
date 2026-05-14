<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Lock, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const loginForm = ref({
  username: '',
  password: '',
});

const loading = ref(false);

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning(t('login.username') + ' / ' + t('login.password'));
    return;
  }

  loading.value = true;
  
  try {
    // TODO: 实现登录逻辑
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success(t('login.success'));
    router.push('/');
  } catch (error) {
    ElMessage.error(t('login.failed'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1>{{ t('app.name') }}</h1>
        <p>v1.0.0</p>
      </div>

      <el-form :model="loginForm" class="login-form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            :prefix-icon="User"
            :placeholder="t('login.username')"
            size="large"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            :prefix-icon="Lock"
            type="password"
            :placeholder="t('login.password')"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading"
            class="login-button"
            native-type="submit"
          >
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}
</style>
