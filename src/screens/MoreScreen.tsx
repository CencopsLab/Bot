import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import ScreenHeader from '@/components/ScreenHeader';
import Card from '@/components/Card';
import type { MoreStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

const LANGUAGES = ['English', 'Hindi', 'Punjabi'] as const;

export default function MoreScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Nav>();
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>('English');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="More from CyberSaathi" subtitle="Services, guides, and app information" />

        <View style={styles.grid}>
          <Card
            icon="open-outline"
            title="Official services"
            description="Official reporting and phone services"
            onPress={() => navigation.navigate('Services')}
          />
          <Card
            icon="book-outline"
            title="Safety handbooks"
            description="Offline cyber-safety reading"
            onPress={() => navigation.navigate('Handbooks')}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View style={styles.langHeaderRow}>
            <Ionicons name="globe-outline" size={20} color={theme.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[typography.bodyBold, { color: theme.text }]}>Language</Text>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                English is active; Hindi and Punjabi are placeholders.
              </Text>
            </View>
          </View>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => {
              const selected = lang === language;
              return (
                <Pressable
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch language to ${lang}`}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: selected ? theme.primary : theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: selected ? '#fff' : theme.text, fontWeight: '600' }}>{lang}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[typography.bodyBold, { color: theme.text }]}>
            This app is guidance, not a complaint portal
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>
            Use cybercrime.gov.in or call 1930 to report a financial cybercrime. For urgent danger,
            contact local emergency services.
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('PrivacyNotice')}
          style={[styles.privacyRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="lock-closed-outline" size={20} color={theme.primary} />
          <Text style={[typography.bodyBold, { color: theme.text, marginLeft: 10, flex: 1 }]}>
            Privacy notice
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>
      </ScrollView>
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
