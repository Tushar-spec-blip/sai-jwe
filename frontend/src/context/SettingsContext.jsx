import { createContext, useContext, useState } from 'react';
import storageService from '../services/storageService';

// Global Settings Context
// Allows any page to read the current settings and save updates reactively.

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => storageService.getSettings());

  const updateSettings = (updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      storageService.saveSettings(next);
      return next;
    });
  };

  const updateSetting = (key, value) => {
    updateSettings({ [key]: value });
  };

  const refreshSettings = () => {
    setSettings(storageService.getSettings());
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
