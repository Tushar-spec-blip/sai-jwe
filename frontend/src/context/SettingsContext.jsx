import { createContext, useContext, useState } from 'react';
import { mockSettings } from '../data/mockData';

// Global Settings Context
// Allows any page to read the current settings and save updates reactively.

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('ssj_demo_settings');
      return stored ? { ...mockSettings, ...JSON.parse(stored) } : { ...mockSettings };
    } catch (e) {
      return { ...mockSettings };
    }
  });

  const updateSettings = (updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('ssj_demo_settings', JSON.stringify(next));
      } catch (e) {
        console.warn('localStorage write error for settings', e);
      }
      return next;
    });
  };

  const updateSetting = (key, value) => {
    updateSettings({ [key]: value });
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
