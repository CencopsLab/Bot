import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { ScanResult } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

const VERDICT_META: Record<ScanResult['verdict'], { key: string; icon: keyof typeof Ionicons.glyphMap; colorKey: 'success' | 'warning' | 'danger' | 'textMuted' }> = {
  safe: { key: 'result.safe', icon: 'checkmark-circle', colorKey: 'success' },
  likely_safe: { key: 'result.likelySafe', icon: 'checkmark-circle-outline', colorKey: 'warning' },
  suspicious: { key: 'result.suspicious', icon: 'alert-circle', colorKey: 'warning' },
  malicious: { key: 'result.malicious', icon: 'warning', colorKey: 'danger' },
  unknown: { key: 'result.unknown', icon: 'help-circle', colorKey: 'textMuted' },
};

export default function ResultCard({ result }: { result: ScanResult }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { t } = useLanguage();
  const meta = VERDICT_META[result.verdict];
  const color = theme[meta.colorKey];
  const guidance = result.guidance;
  const evaluatedChecks = result.checks?.filter((check) => check.status === 'pass' || check.status === 'warning') ?? [];
  const warningCount = evaluatedChecks.filter((check) => check.status === 'warning').length;
  const warningShare = evaluatedChecks.length > 0 ? Math.round((warningCount / evaluatedChecks.length) * 100) : null;
  const meterColor = warningCount > 0 ? theme.warning : theme.success;
  const urlAssessment = result.urlAssessment;
  const aiRiskColor = urlAssessment?.recommendation === 'avoid'
    ? theme.danger
    : urlAssessment?.recommendation === 'caution'
      ? theme.warning
      : urlAssessment?.recommendation === 'no_obvious_risk'
        ? theme.success
        : theme.textMuted;
  const aiRecommendationKey = urlAssessment?.recommendation === 'avoid'
    ? 'result.urlAvoid'
    : urlAssessment?.recommendation === 'caution'
      ? 'result.urlCaution'
      : urlAssessment?.recommendation === 'no_obvious_risk'
        ? 'result.urlNoObviousRisk'
        : 'result.urlAiUnavailable';
  const headerDetails = result.headerDetails;
  const headerRows = headerDetails ? [
    { label: t('result.smsOriginalHeader'), value: headerDetails.originalHeader },
    ...(headerDetails.serviceProviderCode ? [{ label: t('result.smsServiceProvider'), value: `${headerDetails.serviceProvider || t('result.notFound')} (${headerDetails.serviceProviderCode})` }] : []),
    ...(headerDetails.serviceAreaCode ? [{ label: t('result.smsServiceArea'), value: `${headerDetails.serviceArea || t('result.notFound')} (${headerDetails.serviceAreaCode})` }] : []),
    { label: t('result.smsHeader'), value: headerDetails.header || t('result.notFound') },
    { label: t('result.smsPrincipalEntity'), value: headerDetails.principalEntityName || t('result.notFound') },
    ...(headerDetails.categoryCode ? [{ label: t('result.smsCategory'), value: `${headerDetails.category || t('result.notFound')} (${headerDetails.categoryCode})` }] : []),
  ] : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: color }]}>
      <View style={styles.headerRow}>
        <Ionicons name={meta.icon} size={22} color={color} />
        <Text style={[typography.h3, { color, marginLeft: 8 }]}>{t(meta.key)}</Text>
      </View>
      {urlAssessment && !guidance ? (
        <View style={[styles.signalSection, { borderTopColor: theme.border }]}>
          <View style={styles.signalHeading}>
            <View style={styles.urlAiCopy}>
              <Text style={[typography.bodyBold, { color: theme.text }]}>{t('result.urlAiRisk')}</Text>
              <Text style={[typography.caption, { color: aiRiskColor, marginTop: 3, fontWeight: '700' }]}>
                {t(aiRecommendationKey)}
              </Text>
            </View>
            <Text style={[styles.signalPercent, { color: aiRiskColor }]}>
              {urlAssessment.riskScore === null ? '--' : `${urlAssessment.riskScore}/100`}
            </Text>
          </View>
          <View style={[styles.meterTrack, { backgroundColor: theme.border }]}>
            {urlAssessment.riskScore !== null ? (
              <View style={[styles.meterFill, { width: `${urlAssessment.riskScore}%`, backgroundColor: aiRiskColor }]} />
            ) : null}
          </View>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>
            {urlAssessment.status === 'available' ? t('result.urlAiDisclaimer') : urlAssessment.reason}
          </Text>
        </View>
      ) : (
        <View style={[styles.signalSection, { borderTopColor: theme.border }]}>
        <View style={styles.signalHeading}>
          <View>
            <Text style={[typography.bodyBold, { color: theme.text }]}>{t('result.warningSignals')}</Text>
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
              {warningShare === null
                ? t('result.notScored')
                : t('result.signalCount', { warnings: warningCount, total: evaluatedChecks.length })}
            </Text>
          </View>
          <Text style={[styles.signalPercent, { color: warningShare === null ? theme.textMuted : meterColor }]}>
            {warningShare === null ? '--' : `${warningShare}%`}
          </Text>
        </View>
        <View style={[styles.meterTrack, { backgroundColor: theme.border }]}>
          {warningShare !== null ? <View style={[styles.meterFill, { width: `${warningShare}%`, backgroundColor: meterColor }]} /> : null}
        </View>
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>{t('result.signalShareNote')}</Text>
        </View>
      )}
      {guidance ? (
        <View style={[styles.guidanceSection, { borderTopColor: theme.border }]}>
          <Text style={[typography.h3, { color: theme.text }]}>{' CyberRakshak Check'}</Text>
          <Text style={[typography.bodyBold, { color: theme.text, marginTop: 14 }]}>{'🔍 What you sent:'}</Text>
          <Text style={[typography.body, { color: theme.textMuted, marginTop: 5 }]} numberOfLines={3}>
            {'• '}{result.scannedTarget}
          </Text>
          <Text style={[typography.bodyBold, { color: theme.text, marginTop: 14 }]}>{'📋 What we found:'}</Text>
          {guidance.findings.map((finding) => (
            <Text key={finding} style={[typography.body, { color: theme.textMuted, marginTop: 5 }]}>{'• '}{finding}</Text>
          ))}
          <Text style={[typography.bodyBold, { color: theme.text, marginTop: 14 }]}>{'💡 What this means:'}</Text>
          <Text style={[typography.body, { color: theme.textMuted, marginTop: 5 }]}>{guidance.meaning}</Text>
          <Text style={[typography.bodyBold, { color: theme.text, marginTop: 14 }]}>{'✅ What to do:'}</Text>
          {guidance.actions.map((action) => (
            <Text key={action} style={[typography.body, { color: theme.textMuted, marginTop: 5 }]}>{'• '}{action}</Text>
          ))}
        </View>
      ) : null}
      {headerRows ? (
        <View style={styles.headerDetails}>
          {headerRows.map((row) => (
            <View key={row.label} style={styles.headerDetailRow}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>{row.label}</Text>
              <Text style={[typography.caption, styles.headerDetailValue, { color: theme.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[typography.body, { color: theme.text, marginTop: 8 }]} numberOfLines={2}>
          {result.scannedTarget}
        </Text>
      )}
      <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>{result.summary}</Text>
      {result.detectionRatio ? (
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 8 }]}>
          {t('result.detection', { value: result.detectionRatio })}
        </Text>
      ) : null}
      {result.threatName ? (
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
          {t('result.threat', { value: result.threatName })}
        </Text>
      ) : null}
      {result.permissions?.length && !guidance ? (
        <View style={styles.permissionsSection}>
          <Text style={[typography.bodyBold, { color: theme.text }]}>{t('result.permissions')}</Text>
          {result.permissions.map((permission) => (
            <Text key={permission} style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
              {permission}
            </Text>
          ))}
        </View>
      ) : null}
      {result.checks?.length && !guidance ? (
        <View style={styles.checksSection}>
          <Text style={[typography.bodyBold, { color: theme.text }]}>{t('result.analysisChecks')}</Text>
          {result.checks.map((check) => {
            const checkColor = check.status === 'pass'
              ? theme.success
              : check.status === 'warning'
                ? theme.warning
                : theme.textMuted;
            const icon = check.status === 'pass'
              ? 'checkmark-circle-outline'
              : check.status === 'warning'
                ? 'alert-circle-outline'
                : 'information-circle-outline';

            return (
              <View key={check.name} style={styles.checkRow}>
                <Ionicons name={icon} size={17} color={checkColor} />
                <View style={styles.checkCopy}>
                  <Text style={[typography.caption, { color: theme.text, fontWeight: '700' }]}>{check.name}</Text>
                  <Text style={[typography.caption, { color: theme.textMuted }]}>{check.detail}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      <Text style={[typography.caption, { color: theme.textMuted, marginTop: 10 }]}>
        {t('result.disclaimer')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 16, marginTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  signalSection: { borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  guidanceSection: { borderTopWidth: 1, marginTop: 14, paddingTop: 14 },
  signalHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  urlAiCopy: { flex: 1, paddingRight: 8 },
  signalPercent: { fontSize: 25, fontWeight: '800', lineHeight: 30 },
  meterTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 10 },
  meterFill: { height: '100%', borderRadius: 4 },
  permissionsSection: { marginTop: 14 },
  headerDetails: { marginTop: 12, gap: 8 },
  headerDetailRow: { gap: 2 },
  headerDetailValue: { fontWeight: '700' },
  checksSection: { marginTop: 14, gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  checkCopy: { flex: 1, gap: 2 },
});
