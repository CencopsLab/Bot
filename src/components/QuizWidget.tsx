import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/LanguageContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function QuizWidget() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Navigation>();
  const { t } = useLanguage();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('quiz.open')}
      onPress={() => navigation.navigate('Quiz')}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.86 : 1 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.primary }]}>
        <Ionicons name="sparkles" size={20} color="#fff" />
      </View>
      <View style={styles.copy}>
        <Text style={[typography.bodyBold, { color: theme.text }]}>{t('quiz.title')}</Text>
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>{t('quiz.subtitle')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 18,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 5,
  },
  icon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginHorizontal: 12 },
});
