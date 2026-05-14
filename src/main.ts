import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import viVn from 'element-plus/es/locale/lang/vi';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import i18n from './locales';
import './assets/styles/global.css';

// 创建Vue应用
const app = createApp(App);

// 安装Pinia状态管理
app.use(createPinia());

// 安装Vue Router
app.use(router);

// 安装Element Plus
app.use(ElementPlus, {
  locale: i18n.global.locale.value === 'vi-VN' ? viVn : zhCn,
});

// 安装i18n国际化
app.use(i18n);

// 挂载应用
app.mount('#app');

// 全局错误处理
app.config.errorHandler = (err, _vm, info) => {
  console.error('Vue Error:', err);
  console.error('Info:', info);
};

// 警告处理
app.config.warnHandler = (msg, _vm, trace) => {
  console.warn('Vue Warning:', msg);
  console.warn('Trace:', trace);
};
