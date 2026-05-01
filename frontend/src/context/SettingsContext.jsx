import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';

const SETTINGS_NOTIFICATIONS_KEY = 'cropx_notifications';

const SettingsContext = createContext(null);

const getInitialNotifications = () => {
  const stored = localStorage.getItem(SETTINGS_NOTIFICATIONS_KEY);
  if (!stored) {
    return {
      weather: true,
      market: true,
      pest: true,
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      weather: Boolean(parsed?.weather),
      market: Boolean(parsed?.market),
      pest: Boolean(parsed?.pest),
    };
  } catch {
    return {
      weather: true,
      market: true,
      pest: true,
    };
  }
};

export const SettingsProvider = ({ children }) => {
  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(getInitialNotifications);

  useEffect(() => {
    localStorage.setItem(SETTINGS_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const updateNotification = (type, value) => {
    setNotifications((prev) => ({ ...prev, [type]: Boolean(value) }));
  };

  const clearAppCache = () => {
    localStorage.removeItem('cropx_weather_cache');
    localStorage.removeItem('cropx_market_cache');
    localStorage.removeItem('cropx_pest_cache');
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      notifications,
      updateNotification,
      clearAppCache,
      appVersion: 'v1.0.0',
      syncStatus: 'Synced',
    }),
    [language, setLanguage, notifications]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
