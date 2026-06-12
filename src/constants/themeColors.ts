export interface ThemeColorSet {
  primary: string;
  primaryEnd: string;
  accentLight: string;
  accentBorder: string;
  name: string;
}

export const THEME_COLOR_OPTIONS: ThemeColorSet[] = [
  { primary: '#FF5F6D', primaryEnd: '#FF8953', accentLight: '#FFF0EC', accentBorder: '#FFD0C8', name: '코랄' },
  { primary: '#FF8953', primaryEnd: '#FFB347', accentLight: '#FFF5EC', accentBorder: '#FFD9B0', name: '오렌지' },
  { primary: '#F59E0B', primaryEnd: '#FCD34D', accentLight: '#FFFBEB', accentBorder: '#FDE68A', name: '앰버' },
  { primary: '#10B981', primaryEnd: '#34D399', accentLight: '#ECFDF5', accentBorder: '#A7F3D0', name: '에메랄드' },
  { primary: '#3B82F6', primaryEnd: '#60A5FA', accentLight: '#EFF6FF', accentBorder: '#BFDBFE', name: '블루' },
  { primary: '#8B5CF6', primaryEnd: '#A78BFA', accentLight: '#F5F3FF', accentBorder: '#DDD6FE', name: '퍼플' },
  { primary: '#EC4899', primaryEnd: '#F472B6', accentLight: '#FDF2F8', accentBorder: '#FBCFE8', name: '핑크' },
  { primary: '#6B7280', primaryEnd: '#9CA3AF', accentLight: '#F9FAFB', accentBorder: '#E5E7EB', name: '그레이' },
];

export const DEFAULT_THEME_COLOR = THEME_COLOR_OPTIONS[0];
