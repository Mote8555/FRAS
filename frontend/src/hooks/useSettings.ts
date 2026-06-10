import { useState, useEffect } from 'react';
import type { FrasSettings } from '../lib/types';
import { DEFAULT_SETTINGS } from '../lib/types';

const STORAGE_KEY = 'fras_settings';

export function useSettings() {
  const [settings, setSettings] = useState<FrasSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
}
