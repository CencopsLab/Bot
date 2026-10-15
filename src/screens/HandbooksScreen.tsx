import React, { useEffect, useState } from 'react';
import { Alert, Modal, View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import PullToRefreshScrollView from '@/components/PullToRefreshScrollView';
import type { MoreStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { downloadHandbookPdf, listHandbookPdfs, previewHandbookPdf, type HandbookPdf } from '@/utils/handbookPdfs';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

const OFFLINE_GUIDES = ['phishing', 'sim-swap', 'social-engineering', 'safe-apps'] as const;

export default function HandbooksScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Nav>();
  const { language: appLanguage, languageOptions, t } = useLanguage();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [handbookLanguage, setHandbookLanguage] = useState(appLanguage);
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const handbookPdfs = listHandbookPdfs(handbookLanguage);

  useEffect(() => {
    setHandbookLanguage(appLanguage);
  }, [appLanguage]);

  const runPdfAction = async (handbook: HandbookPdf, action: 'preview' | 'download') => {
    try {
      if (action === 'preview') await previewHandbookPdf(handbook.id, handbook.language);
      else await downloadHandbookPdf(handbook.id, handbook.language);
    } catch {
      Alert.alert(t('alert.downloadUnavailable'), t('alert.downloadRetry'));
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
      <PullToRefreshScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel={t('common.back')} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[typography.h2, { color: theme.text, flex: 1 }]}>{t('handbooks.title')}</Text>
          <Pressable
            onPress={() => setLanguageMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`${t('more.language')}: ${languageOptions.find((option) => option.code === handbookLanguage)?.label}`}
            style={[styles.languageButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Text style={[typography.caption, { color: theme.text, fontWeight: '700' }]}>
              {languageOptions.find((option) => option.code === handbookLanguage)?.label}
            </Text>
            <Ionicons name="chevron-down" size={15} color={theme.textMuted} />
          </Pressable>
        </View>

        {handbookPdfs.length > 0 ? (
          <Text style={[typography.h3, styles.pdfHeading, { color: theme.text }]}>{t('handbooks.pdfSection')}</Text>
        ) : null}
        {handbookPdfs.length === 0 ? (
          <Text style={[typography.caption, styles.emptyState, { color: theme.textMuted }]}>{t('handbooks.pdfEmpty')}</Text>
        ) : handbookPdfs.map((handbook) => (
          <View
            key={`${handbook.language}/${handbook.id}`}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.primary + '14' }]}>
              <Ionicons name="book-outline" size={21} color={theme.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[typography.bodyBold, { color: theme.text }]} numberOfLines={2}>
                {handbook.title}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]} numberOfLines={2}>
                {t('handbooks.pdfLanguage', { language: languageOptions.find((option) => option.code === handbook.language)?.label || handbook.language })}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable
                onPress={() => runPdfAction(handbook, 'preview')}
                accessibilityRole="button"
                accessibilityLabel={`${t('common.viewPdf')}: ${handbook.title}`}
                style={({ pressed }) => [styles.iconButton, { backgroundColor: theme.primary + '12', opacity: pressed ? 0.65 : 1 }]}
              >
                <Ionicons name="eye-outline" size={19} color={theme.primary} />
              </Pressable>
              <Pressable
                onPress={() => runPdfAction(handbook, 'download')}
                accessibilityRole="button"
                accessibilityLabel={`${t('common.download')}: ${handbook.title}`}
                style={({ pressed }) => [styles.iconButton, { backgroundColor: theme.primary + '12', opacity: pressed ? 0.65 : 1 }]}
              >
                <Ionicons name="download-outline" size={19} color={theme.primary} />
              </Pressable>
            </View>
          </View>
        ))}
      </PullToRefreshScrollView>
      <Modal visible={languageMenuOpen} transparent animationType="fade" onRequestClose={() => setLanguageMenuOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setLanguageMenuOpen(false)} />
          <View style={[styles.languageMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {languageOptions.map((option) => (
              <Pressable
                key={option.code}
                onPress={() => {
                  setHandbookLanguage(option.code);
                  setLanguageMenuOpen(false);
                }}
                accessibilityRole="button"
                style={styles.languageOption}
              >
                <Text style={[typography.body, { color: theme.text, flex: 1 }]}>{option.label}</Text>
                {option.code === handbookLanguage ? <Ionicons name="checkmark" size={18} color={theme.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  intro: { marginTop: 10, marginBottom: 14 },
  guideCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  guideHeader: { flexDirection: 'row', alignItems: 'center' },
  guideContent: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#879099', marginTop: 12, paddingTop: 12 },
  pdfHeading: { marginTop: 14, marginBottom: 10 },
  languageButton: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 8, marginLeft: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardText: { flex: 1, minWidth: 0 },
  actions: { marginLeft: 8, gap: 6 },
  iconButton: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emptyState: { marginTop: 20, textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: '#0006', alignItems: 'flex-end', paddingTop: 68, paddingHorizontal: 20 },
  languageMenu: { width: 170, borderWidth: 1, borderRadius: 8, paddingVertical: 4, elevation: 8 },
  languageOption: { minHeight: 46, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
});
