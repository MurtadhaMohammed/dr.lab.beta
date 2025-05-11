// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./dictionaries/eng.json";
import translationAR from "./dictionaries/ar.json";
import translationKu from "./dictionaries/ku.json";

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
  ku: {
    translation: translationKu,
  },
};

const langRow = JSON.parse(
  localStorage.getItem("lang") || "{state : {lang: 'en'}}"
);

i18n.use(initReactI18next).init({
  resources,
  lng: langRow?.state?.lang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
