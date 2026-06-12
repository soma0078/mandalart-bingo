import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
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

// Colors 객체에 동적 primary 색상을 오버라이드해서 반환
export function useThemeColors() {
  const { colorSet } = useTheme();
  return {
    ...Colors,
    primary: colorSet.primary,
    primaryEnd: colorSet.primaryEnd,
    accentLight: colorSet.accentLight,
    accentBorder: colorSet.accentBorder,
  };
}
