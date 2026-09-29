import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import PullToRefreshScrollView from '@/components/PullToRefreshScrollView';
import { HANDBOOKS } from '@/data/handbooks';
import type { MoreStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/LanguageContext';

type Route = RouteProp<MoreStackParamList, 'HandbookDetail'>;

export default function HandbookDetailScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { t } = useLanguage();

  const handbook = HANDBOOKS.find((h) => h.id === route.params.id);

  const viewPdf = async () => {
    if (!handbook?.pdfUrl) return;
    await WebBrowser.openBrowserAsync(handbook.pdfUrl);
  };

  const downloadPdf = async () => {
    if (!handbook?.pdfUrl || !FileSystem.documentDirectory) return;
    try {
      const fileName = `${handbook.id}.pdf`;
      const target = `${FileSystem.documentDirectory}${fileName}`;
      const result = await FileSystem.downloadAsync(handbook.pdfUrl, target);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', dialogTitle: t('common.download') });
      } else {
        Alert.alert(t('alert.pdfDownloaded'), t('alert.pdfLocation'));
      }
    } catch {
      Alert.alert(t('alert.downloadUnavailable'), t('alert.downloadRetry'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <PullToRefreshScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel={t('common.back')} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[typography.h2, { color: theme.text, flex: 1 }]} numberOfLines={2}>
            {handbook ? t(`handbook.${handbook.id}.title`) : t('handbooks.title')}
          </Text>
        </View>

        {handbook ? (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            {handbook.pdfUrl ? (
              <View style={styles.actions}>
                <Pressable onPress={viewPdf} style={[styles.actionButton, { backgroundColor: theme.primary }]}>
                  <Ionicons name="eye-outline" size={17} color="#fff" />
                  <Text style={styles.actionText}>{t('common.viewPdf')}</Text>
                </Pressable>
                <Pressable onPress={downloadPdf} style={[styles.actionButton, { backgroundColor: theme.primary + '12' }]}>
                  <Ionicons name="download-outline" size={17} color={theme.primary} />
                  <Text style={[styles.actionText, { color: theme.primary }]}>{t('common.download')}</Text>
                </Pressable>
              </View>
            ) : null}
            <Text style={[typography.body, { color: theme.text, lineHeight: 24 }]}>{t(`handbook.${handbook.id}.content`)}</Text>
          </View>
        ) : (
          <Text style={{ color: theme.textMuted }}>{t('handbooks.missing')}</Text>
        )}
      </PullToRefreshScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 18 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11, paddingVertical: 11 },
  actionText: { color: '#fff', fontWeight: '700' },
});
