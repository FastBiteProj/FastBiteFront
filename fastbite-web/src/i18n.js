import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './i18n/locales/en.json';
import translationRU from './i18n/locales/ru.json';
import translationAZ from './i18n/locales/az.json';

const resources = {
  en: {
    translation: translationEN
  },
  ru: {
    translation: translationRU
  },
  az: {
    translation: translationAZ
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // язык по умолчанию
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;