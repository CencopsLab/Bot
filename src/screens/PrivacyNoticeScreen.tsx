import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function PrivacyNoticeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back" style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[typography.h2, { color: theme.text }]}>Privacy notice</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <Text style={[typography.body, { color: theme.text, lineHeight: 24 }]}>
            CyberSaathi is provided as a citizen-facing cyber-safety companion on behalf of Chandigarh
            Police. This app does not collect or store personal data beyond what is strictly needed to
            process a chat message or a scan request you initiate.{'\n\n'}
            Chat messages you send are transmitted to the CyberSaathi backend to generate a response.
            Recent chat history is kept only on your device, for your convenience, and is never sent to
            our servers beyond the message needed for a reply.{'\n\n'}
            Files or links you submit to the Scanner are transmitted only for the purpose of that safety
            check and are not used for any other purpose by this app.{'\n\n'}
            Location access, if granted, is used only to center the map on the Locate Help Nearby screen
            and is never stored or transmitted.{'\n\n'}
            This app is a guidance tool and does not replace filing a formal complaint. For financial
            cybercrime, report at cybercrime.gov.in or call 1930.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 12, padding: 18 },
});
