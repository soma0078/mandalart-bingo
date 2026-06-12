import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors } from '@/constants/theme';
import { DEFAULT_THEME_COLOR, THEME_COLOR_OPTIONS, type ThemeColorSet } from '@/constants/themeColors';

const STORAGE_KEY_COLOR = '@theme_color';
const STORAGE_KEY_SCHEME = '@theme_scheme';

type AppTheme = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colorSet: ThemeColorSet;
  appTheme: AppTheme;
  setColorSet: (set: ThemeColorSet) => void;
  setAppTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorSet: DEFAULT_THEME_COLOR,
  appTheme: 'system',
  setColorSet: () => {},
  setAppTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorSet, setColorSetState] = useState<ThemeColorSet>(DEFAULT_THEME_COLOR);
  const [appTheme, setAppThemeState] = useState<AppTheme>('system');

  useEffect(() => {
    (async () => {
      const [savedColor, savedScheme] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_COLOR),
        AsyncStorage.getItem(STORAGE_KEY_SCHEME),
      ]);
      if (savedColor) {
        const found = THEME_COLOR_OPTIONS.find((c) => c.primary === savedColor);
        if (found) setColorSetState(found);
      }
      if (savedScheme) {
        const scheme = savedScheme as AppTheme;
        setAppThemeState(scheme);
        applyColorScheme(scheme);
      }
    })();
  }, []);

  const setColorSet = async (set: ThemeColorSet) => {
    setColorSetState(set);
    await AsyncStorage.setItem(STORAGE_KEY_COLOR, set.primary);
  };

  const setAppTheme = async (theme: AppTheme) => {
    setAppThemeState(theme);
    applyColorScheme(theme);
    await AsyncStorage.setItem(STORAGE_KEY_SCHEME, theme);
  };

  return (
    <ThemeContext.Provider value={{ colorSet, appTheme, setColorSet, setAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyColorScheme(theme: AppTheme) {
  const scheme: ColorSchemeName = theme === 'system' ? null : theme;
  Appearance.setColorScheme(scheme);
}

export function useTheme() {
  return useContext(ThemeContext);
}

// 현재 스킴에 맞는 전체 색상 + dynamic primary 반환
export function useThemeColors() {
  const { colorSet, appTheme } = useTheme();
  const systemScheme = useColorScheme();

  const effectiveScheme =
    appTheme === 'system' ? (systemScheme ?? 'light') : appTheme;

  const base = effectiveScheme === 'dark' ? DarkColors : LightColors;

  // 다크 모드에서 accentLight/accentBorder는 primary 기반으로 어둡게 파생
  const accentLight =
    effectiveScheme === 'dark'
      ? `${colorSet.primary}22`
      : colorSet.accentLight;
  const accentBorder =
    effectiveScheme === 'dark'
      ? `${colorSet.primary}55`
      : colorSet.accentBorder;

  return {
    ...base,
    primary: colorSet.primary,
    primaryEnd: colorSet.primaryEnd,
    accentLight,
    accentBorder,
  };
}
