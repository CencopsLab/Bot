import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import PullToRefreshScrollView from '@/components/PullToRefreshScrollView';
import { useLanguage } from '@/i18n/LanguageContext';

export default function PrivacyNoticeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <PullToRefreshScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel={t('common.back')} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[typography.h2, { color: theme.text }]}>{t('privacy.title')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <Text style={[typography.body, { color: theme.text, lineHeight: 24 }]}>
            {t('privacy.body')}
          </Text>
          <Text style={[typography.body, { color: theme.text, lineHeight: 24, marginTop: 16 }]}> 
            {t('privacy.urlAiNotice')}
          </Text>
        </View>
      </PullToRefreshScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 12, padding: 18 },
});
