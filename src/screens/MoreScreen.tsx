import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme, TextInput } from 'react-native';
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
import { apiClient, toApiError } from '@/api/client';
import { getApiBaseUrl, normalizeApiBaseUrl, saveApiBaseUrl } from '@/config/apiBaseUrl';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

export default function MoreScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Nav>();
  const { language, setLanguage, languageOptions, t } = useLanguage();
  const [backendExpanded, setBackendExpanded] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [backendSaving, setBackendSaving] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ message: string; connected: boolean | null } | null>(null);

  useEffect(() => {
    if (!backendExpanded) return;
    let active = true;
    getApiBaseUrl()
      .then((url) => {
        if (active) setBackendUrl(url);
      })
      .catch((error: unknown) => {
        if (active) {
          setBackendStatus({
            message: error instanceof Error ? error.message : t('more.backendUnavailable'),
            connected: false,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [backendExpanded, t]);

  const saveAndTestBackend = async () => {
    const normalized = normalizeApiBaseUrl(backendUrl);
    if (!normalized) {
      setBackendStatus({ message: t('more.backendInvalid'), connected: false });
      return;
    }

    setBackendSaving(true);
    setBackendStatus(null);
    let addressSaved = false;
    try {
      const savedUrl = await saveApiBaseUrl(normalized);
      addressSaved = true;
      setBackendUrl(savedUrl);
      await apiClient.get('/health', { timeout: 15000 });
      setBackendStatus({ message: t('more.backendConnected'), connected: true });
    } catch (error) {
      const detail = addressSaved
        ? toApiError(error).message
        : error instanceof Error ? error.message : t('more.backendUnavailable');
      setBackendStatus({
        message: addressSaved
          ? `${t('more.backendSaved')} ${t('more.backendUnreachable')} ${detail}`
          : detail,
        connected: false,
      });
    } finally {
      setBackendSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
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

        <View style={[styles.backendCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable
            onPress={() => setBackendExpanded((expanded) => !expanded)}
            accessibilityRole="button"
            accessibilityState={{ expanded: backendExpanded }}
            style={styles.backendToggle}
          >
            <Ionicons name="settings-outline" size={17} color={theme.textMuted} />
            <Text style={[typography.caption, { color: theme.textMuted, marginLeft: 8, flex: 1 }]}>
              {t('more.backendTitle')}
            </Text>
            <Ionicons
              name={backendExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.textMuted}
            />
          </Pressable>
          {backendExpanded && (
            <View style={styles.backendForm}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                {t('more.backendHint')}
              </Text>
              <TextInput
                value={backendUrl}
                onChangeText={setBackendUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder={t('more.backendPlaceholder')}
                placeholderTextColor={theme.textMuted}
                accessibilityLabel={t('more.backendTitle')}
                style={[
                  styles.backendInput,
                  { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                ]}
              />
              <Pressable
                onPress={() => void saveAndTestBackend()}
                disabled={backendSaving}
                accessibilityRole="button"
                style={[styles.backendSaveButton, { backgroundColor: theme.primary, opacity: backendSaving ? 0.65 : 1 }]}
              >
                <Text style={styles.backendSaveText}>
                  {backendSaving ? t('more.backendChecking') : t('more.backendSave')}
                </Text>
              </Pressable>
              {backendStatus && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[
                    typography.caption,
                    styles.backendStatus,
                    { color: backendStatus.connected ? theme.success : theme.danger },
                  ]}
                >
                  {backendStatus.message}
                </Text>
              )}
            </View>
          )}
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
  backendCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginTop: 8, marginBottom: 12 },
  backendToggle: { minHeight: 42, flexDirection: 'row', alignItems: 'center' },
  backendForm: { paddingTop: 4, paddingBottom: 12 },
  backendInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  backendSaveButton: { alignItems: 'center', borderRadius: 10, paddingVertical: 11, marginTop: 10 },
  backendSaveText: { color: '#fff', fontWeight: '700' },
  backendStatus: { marginTop: 9 },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
});
