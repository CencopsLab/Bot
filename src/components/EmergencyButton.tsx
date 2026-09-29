import React from 'react';
import { Pressable, Text, StyleSheet, Linking, Alert, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { EMERGENCY_NUMBER } from '@/config/env';
import { useLanguage } from '@/i18n/LanguageContext';

export default function EmergencyButton({ label }: { label?: string }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { t } = useLanguage();
  const buttonLabel = label ?? t('common.call', { number: EMERGENCY_NUMBER });

  const handlePress = async () => {
    const url = `tel:${EMERGENCY_NUMBER}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert(t('alert.unableDial'), t('alert.callManually', { number: EMERGENCY_NUMBER }));
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('common.call', { number: EMERGENCY_NUMBER })}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.emergency, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 8 }} />
      <Text style={[typography.bodyBold, { color: '#fff' }]}>{buttonLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#6E211D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
});
