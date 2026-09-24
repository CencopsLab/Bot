import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { SERVICE_LINKS } from '@/data/services';

export default function ServicesScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation();

  const openService = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      // openBrowserAsync rarely throws, but fail quietly rather than crash.
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back" style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
            <Text style={[typography.h2, { color: theme.text }]}>Integrated services</Text>
          </View>
          <View style={[styles.notice, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[typography.caption, { color: theme.textMuted }]}>These links open official external services.</Text>
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>CyberSaathi does not submit a report on your behalf.</Text>
          </View>

        {SERVICE_LINKS.map((service) => (
          <View key={service.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '24' }] }>
              <Ionicons name={service.icon as any} size={22} color={theme.primary} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={[typography.bodyBold, { color: theme.text }]}>{service.title}</Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 5 }]}> 
                {service.description}
              </Text>
            </View>
            <Pressable
              onPress={() => openService(service.url)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${service.title}`}
              style={[styles.openButton, { backgroundColor: theme.primary + '12' }]}
            >
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Open official portal</Text>
              <Ionicons name="arrow-up-outline" size={16} color={theme.primary} style={{ transform: [{ rotate: '45deg' }] }} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  notice: { borderWidth: 1, borderRadius: 14, padding: 13, marginTop: 14, marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardCopy: { marginTop: 14 },
  openButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, marginTop: 13 },
});
