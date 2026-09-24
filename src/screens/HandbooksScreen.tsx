import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { HANDBOOKS } from '@/data/handbooks';
import type { MoreStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

export default function HandbooksScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back" style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[typography.h2, { color: theme.text }]}>Safety handbooks</Text>
        </View>
        <Text style={[styles.sectionLabel, { color: theme.primary }]}>OFFLINE CITIZEN GUIDES</Text>
        <Text style={[typography.caption, { color: theme.textMuted, marginBottom: 16 }]}> 
          Read practical cyber-safety guidance and open the official PDF when one is available.
        </Text>

        {HANDBOOKS.map((handbook) => (
          <Pressable
            key={handbook.id}
            onPress={() => navigation.navigate('HandbookDetail', { id: handbook.id })}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.primary + '14' }]}>
              <Ionicons name="book-outline" size={21} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: theme.text }]}>{handbook.title}</Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
                {handbook.summary}
              </Text>
              <Text style={[typography.caption, { color: theme.primary, marginTop: 8, fontWeight: '700' }]}>
                {handbook.pdfUrl ? 'PDF available · View guide' : 'Offline guide · Read now'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
});
