import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import PullToRefreshScrollView from '@/components/PullToRefreshScrollView';
import ScreenHeader from '@/components/ScreenHeader';
import Card from '@/components/Card';
import type { MoreStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/LanguageContext';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

export default function MoreScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Nav>();
  const { language, setLanguage, languageOptions, t } = useLanguage();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <PullToRefreshScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={t('more.title')} subtitle={t('more.subtitle')} />

        <View style={styles.grid}>
          <Card
            icon="open-outline"
            title={t('more.services.title')}
            description={t('more.services.description')}
            onPress={() => navigation.navigate('Services')}
          />
          <Card
            icon="book-outline"
            title={t('more.handbooks.title')}
            description={t('more.handbooks.description')}
            onPress={() => navigation.navigate('Handbooks')}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View style={styles.langHeaderRow}>
            <Ionicons name="globe-outline" size={20} color={theme.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[typography.bodyBold, { color: theme.text }]}>{t('more.language')}</Text>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                {t('more.languageHint')}
              </Text>
            </View>
          </View>
          <View style={styles.langRow}>
            {languageOptions.map((option) => {
              const selected = option.code === language;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => setLanguage(option.code)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('more.language')}: ${option.label}`}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: selected ? theme.primary : theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: selected ? '#fff' : theme.text, fontWeight: '600' }}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[typography.bodyBold, { color: theme.text }]}>
            {t('more.guidanceTitle')}
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>
            {t('more.guidance')}
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('PrivacyNotice')}
          style={[styles.privacyRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="lock-closed-outline" size={20} color={theme.primary} />
          <Text style={[typography.bodyBold, { color: theme.text, marginLeft: 10, flex: 1 }]}>
            {t('more.privacy')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>
      </PullToRefreshScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 4, marginBottom: 12 },
  langHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  langChip: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
});
