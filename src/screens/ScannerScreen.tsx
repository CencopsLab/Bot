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
import ResultCard from '@/components/ResultCard';
import { isLikelyValidUrl, normalizeUrl } from '@/utils/validators';
import { scanUrl, scanFile } from '@/api/scanApi';
import { ApiError } from '@/api/client';
import type { ScanResult } from '@/types';

type Tab = 'url' | 'file';

export default function ScannerScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);

  const [tab, setTab] = useState<Tab>('url');
  const [url, setUrl] = useState('');
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
      setPickedFile(picked.assets[0]);
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
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
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
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Safety scanner" subtitle="Check a link or selected file" />

        <View style={[styles.notice, { backgroundColor: theme.primary + '0C', borderColor: theme.primary + '35' }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
          <Text style={[typography.caption, { color: theme.textMuted, flex: 1, marginLeft: 10 }]}> 
            Scans are sent to your configured CyberSaathi backend. Avoid uploading files that contain
            private information.
          </Text>
        </View>

        <View style={[styles.tabs, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable
            onPress={() => {
              setTab('url');
              setResult(null);
              setError(null);
            }}
            style={[styles.tabButton, tab === 'url' && { backgroundColor: theme.primary }]}
          >
            <Text style={[typography.bodyBold, { color: tab === 'url' ? '#fff' : theme.textMuted }]}>
              Scan a URL
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setTab('file');
              setResult(null);
              setError(null);
            }}
            style={[styles.tabButton, tab === 'file' && { backgroundColor: theme.primary }]}
          >
            <Text style={[typography.bodyBold, { color: tab === 'file' ? '#fff' : theme.textMuted }]}>
              Scan a file / APK
            </Text>
          </Pressable>
        </View>

        {tab === 'url' ? (
          <View>
            <Text style={[typography.bodyBold, { color: theme.text, marginTop: 20 }]}>Web address</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              onBlur={() => setUrlTouched(true)}
              placeholder="https://example.com"
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
              accessibilityLabel="Enter a web address to scan"
            />
            {urlTouched && !urlIsValid ? (
              <Text style={{ color: theme.danger, marginTop: 6 }}>Enter a valid web address.</Text>
            ) : (
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>
                Check the address carefully. A scan is only one safety signal.
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
                <Text style={[typography.bodyBold, { color: '#fff' }]}>Start scan</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View>
            <Text style={[typography.bodyBold, { color: theme.text, marginTop: 20 }]}>Select a file</Text>
            <Pressable
              onPress={handlePickFile}
              style={[styles.filePicker, { borderColor: theme.border, backgroundColor: theme.surface }]}
            >
              <Ionicons name="document-attach-outline" size={22} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, marginLeft: 10, flex: 1 }]} numberOfLines={1}>
                {pickedFile ? pickedFile.name : 'Choose an APK or file to scan'}
              </Text>
            </Pressable>

            {isScanning ? (
              <View style={styles.progressRow}>
                <ActivityIndicator color={theme.primary} />
                <Text style={{ color: theme.textMuted, marginLeft: 8 }}>Uploading {uploadProgress}%</Text>
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
              <Text style={[typography.bodyBold, { color: '#fff' }]}>Start scan</Text>
            </Pressable>
          </View>
        )}

        {error ? (
          <View style={styles.errorRow}>
            <Text style={{ color: theme.danger, flex: 1 }}>{error}</Text>
            <Pressable onPress={tab === 'url' ? handleScanUrl : handleScanFile}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {result ? <ResultCard result={result} /> : null}

        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 20 }]}>
          Do not open or install a file solely because a scan says it is safe.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  notice: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 4 },
  tabs: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 4, marginTop: 16 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginTop: 8 },
  primaryButton: { marginTop: 20, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
});
