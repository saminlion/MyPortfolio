import { createI18n } from 'vue-i18n';
import ko from './locales/ko.json';
import en from './locales/en.json';
import jp from './locales/jp.json';

const i18n = createI18n({
  locale: 'en', // Default language
  fallbackLocale: 'en', // Fallback language
  messages: {
    ko,
    en,
    jp
  }
});

export default i18n;