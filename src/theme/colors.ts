// Central color tokens for a calm, civic, high-contrast interface.
// export const palette = {
//   navy: '#0833f3',
//   navyDark: '#0B353A',
//   white: '#FFFFFF',
//   amber: '#D88A3A',
//   teal: '#2C8C83',
//   emergencyRed: '#e04646',
//   success: '#287A57',
//   warning: '#B9742A',
//   danger: '#C44D4D',
//   textLight: '#17282B',
//   textMutedLight: '#647477',
//   textDark: '#EEF4F2',
//   textMutedDark: '#9DAEAB',
//   bgLight: '#F5F8F6',
//   bgDark: '#0D1718',
//   surfaceLight: '#FFFFFF',
//   surfaceDark: '#162122',
//   borderLight: '#D6E3DF',
//   borderDark: '#2A3A3A',
// };
export const palette = {
  navy: '#112E51',
  navyDark: '#0B1F38',
  white: '#FFFFFF',
  amber: '#FFBE2E',
  teal: '#00A6A0',
  emergencyRed: '#D83933',
  success: '#2E8540',
  warning: '#FDB81E',
  danger: '#CD2026',
  textLight: '#1B1B1B',
  textMutedLight: '#5B616B',
  textDark: '#F1F1F1',
  textMutedDark: '#A9AEB1',
  bgLight: '#F1F1F1',
  bgDark: '#141B21',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#143147',
  borderLight: '#D6D7D9',
  borderDark: '#3D4551',
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
