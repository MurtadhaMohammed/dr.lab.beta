// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './dictionaries/eng.json';
import translationAR from './dictionaries/ar.json';

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
