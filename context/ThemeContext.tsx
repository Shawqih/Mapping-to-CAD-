import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppSettings, loadSettings, saveSettings } from '../lib/storage';

export interface Palette {
  bg: string;
  bgElevated: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
  isDark: boolean;
}

const LIGHT: Palette = {
  bg: '#F4F6F5',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8E4',
  text: '#0F1B14',
  textMuted: '#5B6B62',
  primary: '#0E7C66',
  primaryDark: '#0A5C4B',
  accent: '#D97706',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  overlay: 'rgba(15,27,20,0.55)',
  isDark: false,
};

const DARK: Palette = {
  bg: '#0B1512',
  bgElevated: '#122019',
  card: '#152420',
  border: '#213B31',
  text: '#EAF3EE',
  textMuted: '#8FA79B',
  primary: '#22C79A',
  primaryDark: '#0E7C66',
  accent: '#F59E0B',
  danger: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  overlay: 'rgba(0,0,0,0.65)',
  isDark: true,
};

interface ThemeContextValue {
  palette: Palette;
  mode: AppSettings['themeMode'];
  setMode: (m: AppSettings['themeMode']) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  palette: LIGHT,
  mode: 'system',
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<AppSettings['themeMode']>('system');

  useEffect(() => {
    loadSettings().then((s) => setModeState(s.themeMode));
  }, []);

  const setMode = (m: AppSettings['themeMode']) => {
    setModeState(m);
    loadSettings().then((s) => saveSettings({ ...s, themeMode: m }));
  };

  const resolvedDark = mode === 'system' ? scheme === 'dark' : mode === 'dark';
  const palette = useMemo(() => (resolvedDark ? DARK : LIGHT), [resolvedDark]);

  return <ThemeContext.Provider value={{ palette, mode, setMode }}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  return useContext(ThemeContext);
}
