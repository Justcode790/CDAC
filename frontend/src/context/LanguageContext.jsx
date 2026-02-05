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
import bnTranslations from '../locales/bn.json';
import teTranslations from '../locales/te.json';
import mrTranslations from '../locales/mr.json';
import taTranslations from '../locales/ta.json';
import guTranslations from '../locales/gu.json';
import knTranslations from '../locales/kn.json';
import mlTranslations from '../locales/ml.json';
import paTranslations from '../locales/pa.json';

const LanguageContext = createContext(null);

const translationsMap = {
  [LANGUAGES.EN]: enTranslations,
  [LANGUAGES.HI]: hiTranslations,
  [LANGUAGES.BN]: bnTranslations,
  [LANGUAGES.TE]: teTranslations,
  [LANGUAGES.MR]: mrTranslations,
  [LANGUAGES.TA]: taTranslations,
  [LANGUAGES.GU]: guTranslations,
  [LANGUAGES.KN]: knTranslations,
  [LANGUAGES.ML]: mlTranslations,
  [LANGUAGES.PA]: paTranslations
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || LANGUAGES.EN;
  });

  const [translations, setTranslations] = useState(
    translationsMap[language] || enTranslations
  );

  useEffect(() => {
    // Update translations when language changes
    setTranslations(translationsMap[language] || enTranslations);
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (Object.values(LANGUAGES).includes(lang)) {
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
