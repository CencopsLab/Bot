import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import ScreenHeader from '@/components/ScreenHeader';
import PullToRefreshScrollView from '@/components/PullToRefreshScrollView';
import ResultCard from '@/components/ResultCard';
import { isLikelyValidUrl, normalizeUrl } from '@/utils/validators';
import { scanUrl, scanFile, scanText, type TextScanType } from '@/api/scanApi';
import { ApiError } from '@/api/client';
import type { ScanResult } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

type Tab = 'url' | 'file' | TextScanType;

const SCAN_MODES: { id: Tab; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'url', labelKey: 'scanner.urlTab', icon: 'globe-outline' },
  { id: 'file', labelKey: 'scanner.fileTab', icon: 'document-text-outline' },
  { id: 'email', labelKey: 'scanner.emailTab', icon: 'mail-outline' },
  { id: 'sms', labelKey: 'scanner.smsTab', icon: 'chatbubble-ellipses-outline' },
  { id: 'mobile', labelKey: 'scanner.mobileTab', icon: 'phone-portrait-outline' },
];
const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024;

const TEXT_SCAN_CONFIG: Record<TextScanType, { labelKey: string; titleKey: string; placeholderKey: string; keyboardType: 'default' | 'email-address' | 'phone-pad' }> = {
  email: { labelKey: 'scanner.emailTab', titleKey: 'scanner.text.email.title', placeholderKey: 'scanner.text.email.placeholder', keyboardType: 'email-address' },
  sms: { labelKey: 'scanner.smsTab', titleKey: 'scanner.smsHeaderLabel', placeholderKey: 'scanner.smsHeaderPlaceholder', keyboardType: 'default' },
  mobile: { labelKey: 'scanner.mobileTab', titleKey: 'scanner.text.mobile.title', placeholderKey: 'scanner.text.mobile.placeholder', keyboardType: 'phone-pad' },
};

export default function ScannerScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('url');
  const [url, setUrl] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [mobileValue, setMobileValue] = useState('');
  const [smsHeader, setSmsHeader] = useState('');
  const [urlTouched, setUrlTouched] = useState(false);
  const [pickedFile, setPickedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const urlIsValid = isLikelyValidUrl(url);

  const handlePickFile = async () => {
    setError(null);
    setResult(null);
    const picked = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.android.package-archive', // .apk
        'application/pdf',
        'application/zip',
        'image/*',
        '*/*',
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (!picked.canceled && picked.assets?.length) {
      const asset = picked.assets[0];
      if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
        setPickedFile(null);
        setError(t('scanner.fileTooLarge', { size: 150 }));
        return;
      }
      setError(null);
      setPickedFile(asset);
    }
  };

  const handleScanUrl = async () => {
    setUrlTouched(true);
    setError(null);
    setResult(null);
    if (!urlIsValid) return;

    setIsScanning(true);
    try {
      const res = await scanUrl(normalizeUrl(url));
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('chat.genericError'));
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanFile = async () => {
    setError(null);
    setResult(null);
    if (!pickedFile) return;

    setIsScanning(true);
    setUploadProgress(0);
    try {
      const res = await scanFile(
        { uri: pickedFile.uri, name: pickedFile.name, mimeType: pickedFile.mimeType },
        setUploadProgress
      );
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('chat.genericError'));
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanText = async () => {
    if (tab === 'url' || tab === 'file') return;
    setError(null);
    setResult(null);
    const value = tab === 'sms' ? smsHeader.trim() : tab === 'email' ? emailValue.trim() : mobileValue.trim();
    if (!value) {
      setError(tab === 'sms' ? t('scanner.enterSmsHeader') : tab === 'mobile' ? t('scanner.enterMobile') : t('scanner.enterContent'));
      return;
    }

    setIsScanning(true);
    try {
      setResult(await scanText(tab, value));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('chat.genericError'));
    } finally {
      setIsScanning(false);
    }
  };

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab);
    setResult(null);
    setError(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <PullToRefreshScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={t('scanner.title')} subtitle={t('scanner.subtitle')} />

        <View style={[styles.trustStrip, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '28' }]}>
          <View style={[styles.trustIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </View>
          <Text style={[typography.caption, { color: theme.textMuted, flex: 1 }]}> 
            {t('scanner.notice')}
          </Text>
        </View>

        <View style={styles.scannerWorkspace}>
          <View style={styles.modeHeader}>
            <View>
              <Text style={[typography.overline, { color: theme.primary }]}>{t('scanner.modeTitle')}</Text>
              <Text style={[typography.h2, { color: theme.text, marginTop: 4 }]}>{t('scanner.modeTitle')}</Text>
            </View>
            <Ionicons name="swap-horizontal-outline" size={21} color={theme.textMuted} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeOptions}>
              {SCAN_MODES.map((mode) => {
                const selected = tab === mode.id;
                return (
                  <Pressable
                    key={mode.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => selectTab(mode.id)}
                    style={[
                      styles.tabButton,
                      { backgroundColor: selected ? theme.primary : theme.surface, borderColor: selected ? theme.primary : theme.border },
                    ]}
                  >
                    <Ionicons name={mode.icon} size={18} color={selected ? '#fff' : theme.textMuted} />
                    <Text style={[typography.bodyBold, styles.tabLabel, { color: selected ? '#fff' : theme.text }]}>
                      {t(mode.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
          </ScrollView>
          <View style={[styles.scanPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.panelAccent} />
            {tab === 'url' ? (
          <View>
            <Text style={[typography.bodyBold, { color: theme.text, marginTop: 4 }]}>{t('scanner.webAddress')}</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              onBlur={() => setUrlTouched(true)}
              placeholder={t('scanner.urlPlaceholder')}
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: urlTouched && !urlIsValid ? theme.danger : theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
              accessibilityLabel={t('scanner.webAddress')}
            />
            {urlTouched && !urlIsValid ? (
              <Text style={{ color: theme.danger, marginTop: 6 }}>{t('scanner.invalidUrl')}</Text>
            ) : (
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>
                {t('scanner.urlHint')}
              </Text>
            )}
            <Pressable
              onPress={handleScanUrl}
              disabled={isScanning}
              style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: isScanning ? 0.7 : 1 }]}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[typography.bodyBold, { color: '#fff' }]}>{t('scanner.start')}</Text>
              )}
            </Pressable>
          </View>
          ) : tab === 'file' ? (
          <View>
            <Text style={[typography.bodyBold, { color: theme.text, marginTop: 4 }]}>{t('scanner.selectFile')}</Text>
            <Pressable
              onPress={handlePickFile}
              style={[styles.filePicker, { borderColor: theme.border, backgroundColor: theme.surface }]}
            >
              <Ionicons name="document-attach-outline" size={22} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, marginLeft: 10, flex: 1 }]} numberOfLines={1}>
                {pickedFile ? pickedFile.name : t('scanner.chooseFile')}
              </Text>
            </Pressable>

            {isScanning ? (
              <View style={styles.progressRow}>
                <ActivityIndicator color={theme.primary} />
                <Text style={{ color: theme.textMuted, marginLeft: 8 }}>{t('scanner.uploading', { percent: uploadProgress })}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleScanFile}
              disabled={!pickedFile || isScanning}
              style={[
                styles.primaryButton,
                { backgroundColor: !pickedFile || isScanning ? theme.border : theme.primary },
              ]}
            >
              <Text style={[typography.bodyBold, { color: '#fff' }]}>{t('scanner.start')}</Text>
            </Pressable>
          </View>
          ) : (
          <View>
            {tab === 'sms' ? (
              <>
                <Text style={[typography.bodyBold, { color: theme.text, marginTop: 4 }]}>{t('scanner.smsHeaderLabel')}</Text>
                <TextInput
                  value={smsHeader}
                  onChangeText={setSmsHeader}
                  placeholder={t(TEXT_SCAN_CONFIG.sms.placeholderKey)}
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={64}
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
                  accessibilityLabel={t('scanner.smsHeaderLabel')}
                />
                <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>
                  {t('scanner.smsHeaderHint')}
                </Text>
              </>
            ) : (
              <>
                <Text style={[typography.bodyBold, { color: theme.text, marginTop: 4 }]}>
                  {t(TEXT_SCAN_CONFIG[tab].titleKey)}
                </Text>
                <TextInput
                  value={tab === 'email' ? emailValue : mobileValue}
                  onChangeText={tab === 'email' ? setEmailValue : setMobileValue}
                  placeholder={t(TEXT_SCAN_CONFIG[tab].placeholderKey)}
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={TEXT_SCAN_CONFIG[tab].keyboardType}
                  multiline={false}
                  style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
                  accessibilityLabel={`Enter ${tab} content to check`}
                />
              </>
            )}
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}> 
              {t(tab === 'sms' ? 'scanner.smsPreliminary' : 'scanner.preliminary')}
            </Text>
            <Pressable
              onPress={handleScanText}
              disabled={isScanning}
              style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: isScanning ? 0.7 : 1 }]}
            >
              {isScanning ? <ActivityIndicator color="#fff" /> : <Text style={[typography.bodyBold, { color: '#fff' }]}>{t('scanner.check', { type: t(TEXT_SCAN_CONFIG[tab].labelKey) })}</Text>}
            </Pressable>
          </View>
            )}
          </View>
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <Text style={{ color: theme.danger, flex: 1 }}>{error}</Text>
            <Pressable onPress={tab === 'url' ? handleScanUrl : tab === 'file' ? handleScanFile : handleScanText}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>{t('common.tryAgain')}</Text>
            </Pressable>
          </View>
        ) : null}

        {result ? <ResultCard result={result} /> : null}

        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 20 }]}>
          {t('scanner.footer')}
        </Text>
      </PullToRefreshScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, width: '100%', maxWidth: 1100, alignSelf: 'center' },
  trustStrip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 10, marginTop: 2 },
  trustIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  scannerWorkspace: { marginTop: 26 },
  modeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modeOptions: { gap: 10, paddingRight: 20, paddingBottom: 4 },
  tabButton: { width: 112, minHeight: 74, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 11, alignItems: 'flex-start', justifyContent: 'space-between' },
  tabLabel: { flexShrink: 1 },
  scanPanel: { marginTop: 14, borderWidth: 1, borderRadius: 20, padding: 18, overflow: 'hidden' },
  panelAccent: { height: 3, width: 48, borderRadius: 3, backgroundColor: '#2C8C83', marginBottom: 13 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, marginTop: 8 },
  textArea: { minHeight: 54, textAlignVertical: 'top' },
  primaryButton: { marginTop: 20, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingHorizontal: 4 },
});
