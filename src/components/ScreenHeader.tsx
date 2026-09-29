import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Image } from 'react-native';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useLanguage } from '@/i18n/LanguageContext';

type Props = {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
};

export default function ScreenHeader({ title, subtitle, rightAction }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { t } = useLanguage();

  return (
    <View style={styles.row}>
      <View style={[styles.logoWrap]} accessibilityLabel={t('header.shield')}>
        <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.kicker, { color: theme.primary }]}>{t('header.police')}</Text>
        <Text style={[typography.h3, { color: theme.text, marginTop: 1 }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>{subtitle}</Text>
        ) : null}
      </View>
      {rightAction ? <View style={styles.action}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  logoImage: { width: 48, height: 48, borderRadius: 14 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  action: { marginLeft: 12 },
});
