import { createI18n } from 'vue-i18n';
import zhCn from './zh-CN.json';
import viVn from './vi-VN.json';

export type Locale = 'zh-CN' | 'vi-VN';

export const SUPPORTED_LOCALES: { value: Locale; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'vi-VN', label: 'Tiếng Việt' },
];

export const DEFAULT_LOCALE: Locale = 'zh-CN';

const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCn,
    'vi-VN': viVn,
  },
  datetimeFormats: {
    'zh-CN': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    'vi-VN': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
});

export default i18n;

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale;
  document.documentElement.setAttribute('lang', locale);
  localStorage.setItem('locale', locale);
}

export function getLocale(): Locale {
  return i18n.global.locale.value as Locale;
}

// Element Plus locale imports
import zhCnElement from 'element-plus/es/locale/lang/zh-cn';
import viVnElement from 'element-plus/es/locale/lang/vi';

export const $elementLocaleZhCn = zhCnElement;
export const $elementLocaleVi = viVnElement;
