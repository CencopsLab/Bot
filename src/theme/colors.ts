// Central color tokens. Bright civic blue with restrained national accents.
export const palette = {
  navy: '#1646C8',
  navyDark: '#0B2B78',
  white: '#FFFFFF',
  amber: '#E39A24',
  teal: '#147D72',
  emergencyRed: '#B53A32',
  success: '#19734A',
  warning: '#B97815',
  danger: '#B53A32',
  textLight: '#172331',
  textMutedLight: '#5F6C78',
  textDark: '#EDEFF3',
  textMutedDark: '#9AA3AF',
  bgLight: '#F3F7FC',
  bgDark: '#0E1116',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#171B22',
  borderLight: '#D8E2F0',
  borderDark: '#2A2F38',
};

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  accent: string;
  emergency: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  card: string;
};

export function getTheme(scheme: 'light' | 'dark'): ThemeColors {
  const isDark = scheme === 'dark';
  return {
    primary: palette.navy,
    primaryDark: palette.navyDark,
    accent: palette.amber,
    emergency: palette.emergencyRed,
    background: isDark ? palette.bgDark : palette.bgLight,
    surface: isDark ? palette.surfaceDark : palette.surfaceLight,
    text: isDark ? palette.textDark : palette.textLight,
    textMuted: isDark ? palette.textMutedDark : palette.textMutedLight,
    border: isDark ? palette.borderDark : palette.borderLight,
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
    card: isDark ? palette.surfaceDark : palette.surfaceLight,
  };
}
