import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '../assets/lang/en.json';
import hi from '../assets/lang/hi.json';

const LanguageContext = createContext();
export const LANGUAGE_STORAGE_KEY = 'cropx_language';
const LEGACY_LANGUAGE_KEY = 'lang';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = localStorage.getItem(LEGACY_LANGUAGE_KEY) || localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage === 'hi' ? 'hi' : 'en';
  });

  const translations = {
    en,
    hi,
  };

  const t = translations[language];

  const setLanguage = (nextLanguage) => {
    const normalizedLanguage = nextLanguage === 'hi' ? 'hi' : 'en';
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
    localStorage.setItem(LEGACY_LANGUAGE_KEY, normalizedLanguage);
    setLanguageState(normalizedLanguage);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    localStorage.setItem(LEGACY_LANGUAGE_KEY, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
