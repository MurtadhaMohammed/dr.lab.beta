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

// Safer way to get language from localStorage
const getSavedLanguage = () => {
  try {
    const langData = localStorage.getItem("lang");
    if (!langData) return "en"; // Default if no language is saved

    const parsed = JSON.parse(langData);
    return parsed?.state?.lang || "en"; // Fallback to 'en' if structure is unexpected
  } catch (e) {
    console.error("Error parsing language from localStorage:", e);
    return "en"; // Fallback to English if parsing fails
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: getSavedLanguage(), // Use the safely retrieved language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // Not needed for React as it escapes by default
  },
  react: {
    useSuspense: false, // If you're using Suspense
  },
});

export default i18n;
