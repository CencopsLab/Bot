import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { ScanResult } from '@/types';

const VERDICT_META: Record<ScanResult['verdict'], { label: string; icon: keyof typeof Ionicons.glyphMap; colorKey: 'success' | 'warning' | 'danger' | 'textMuted' }> = {
  safe: { label: 'Safe', icon: 'checkmark-circle', colorKey: 'success' },
  suspicious: { label: 'Suspicious', icon: 'alert-circle', colorKey: 'warning' },
  malicious: { label: 'Malicious', icon: 'warning', colorKey: 'danger' },
  unknown: { label: 'Unknown', icon: 'help-circle', colorKey: 'textMuted' },
};

export default function ResultCard({ result }: { result: ScanResult }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const meta = VERDICT_META[result.verdict];
  const color = theme[meta.colorKey];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: color }]}>
      <View style={styles.headerRow}>
        <Ionicons name={meta.icon} size={22} color={color} />
        <Text style={[typography.h3, { color, marginLeft: 8 }]}>{meta.label}</Text>
      </View>
      <Text style={[typography.body, { color: theme.text, marginTop: 8 }]} numberOfLines={2}>
        {result.scannedTarget}
      </Text>
      <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>{result.summary}</Text>
      {result.detectionRatio ? (
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 8 }]}>
          Detection ratio: {result.detectionRatio}
        </Text>
      ) : null}
      {result.threatName ? (
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
          Threat: {result.threatName}
        </Text>
      ) : null}
      <Text style={[typography.caption, { color: theme.textMuted, marginTop: 10 }]}>
        Powered by threat-intelligence scanning \u00b7 A scan is only one safety signal.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 16, marginTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
});
