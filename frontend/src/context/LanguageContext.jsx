/**
 * SUVIDHA 2026 - Language Context
 * 
 * Manages language state and translations across the application
 * Supports English (EN) and Hindi (HI)
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, STORAGE_KEYS } from '../utils/constants';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';

const LanguageContext = createContext(null);

const translations = {
  [LANGUAGES.EN]: enTranslations,
  [LANGUAGES.HI]: hiTranslations
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || LANGUAGES.EN;
  });

  const [translations, setTranslations] = useState(
    language === LANGUAGES.HI ? hiTranslations : enTranslations
  );

  useEffect(() => {
    // Update translations when language changes
    setTranslations(
      language === LANGUAGES.HI ? hiTranslations : enTranslations
    );
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === LANGUAGES.EN || lang === LANGUAGES.HI) {
      setLanguage(lang);
    }
  };

  const t = (key) => {
    // Support nested keys like "auth.login"
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return value || key;
  };

  const value = {
    language,
    translations,
    changeLanguage,
    t,
    isEnglish: language === LANGUAGES.EN,
    isHindi: language === LANGUAGES.HI
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
