export const LightColors = {
  primary: '#FF5F6D',
  primaryEnd: '#FF8953',
  bg: '#EEF0FF',
  border: '#E5E7EB',
  cellDone: '#FF8953',
  cellUndone: '#E8ECF0',
  inputBg: '#F9FAFB',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  white: '#FFFFFF',
  accentBorder: '#FFD0C8',
  accentLight: '#FFF0EC',
} as const;

export const DarkColors = {
  primary: '#FF5F6D',
  primaryEnd: '#FF8953',
  bg: '#0F0F18',
  border: '#2D2D3F',
  cellDone: '#FF8953',
  cellUndone: '#2D2D3F',
  inputBg: '#1A1A2E',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  textPrimary: '#F1F2F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  white: '#1C1C2E',
  accentBorder: '#FFD0C8',
  accentLight: '#FFF0EC',
} as const;

// 기본값(라이트)으로 내보내기 — 하위 호환성 유지
export const Colors = LightColors;

export const FontSize = {
  display: 28,
  title: 22,
  heading: 18,
  body: 15,
  caption: 12,
  label: 11,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  full: 999,
} as const;
