import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import ScreenHeader from '@/components/ScreenHeader';
import Card from '@/components/Card';
import EmergencyButton from '@/components/EmergencyButton';
import type { RootTabParamList } from '@/navigation/types';

type Nav = BottomTabNavigationProp<RootTabParamList>;

export default function HomeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader title="CyberSaathi" subtitle="Chandigarh cyber safety" />

        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <View style={styles.heroStripe} />
          <View style={styles.heroBadge}>
            <Text style={[typography.overline, { color: '#fff' }]}>Citizen cyber safety desk</Text>
          </View>
          <Text style={[typography.h1, { color: '#fff', marginTop: 10 }]}>
            A safer next step starts here.
          </Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.85)', marginTop: 8 }]}>
            Get guidance, check a suspicious link, or reach the right reporting service.
          </Text>
        </View>

        <Text style={[typography.overline, { color: theme.primary, marginTop: 28 }]}> 
          Your safety tools
        </Text>
        <Text style={[typography.h2, { color: theme.text, marginTop: 4, marginBottom: 12 }]}>
          How can we help?
        </Text>

        <View style={styles.grid}>
          <Card
            icon="chatbubble-ellipses-outline"
            title="Ask CyberSaathi"
            description="Get cyber-safety guidance"
            onPress={() => navigation.navigate('Chat')}
          />
          <Card
            icon="search-outline"
            title="Scan a link or file"
            description="Check a URL or upload an APK"
            onPress={() => navigation.navigate('Scan')}
          />
          <Card
            icon="location-outline"
            title="Find nearby help"
            description="Open the map and 1930"
            onPress={() => navigation.navigate('Help')}
          />
          <Card
            icon="open-outline"
            title="Official services"
            description="Report, check, or block"
            onPress={() => navigation.navigate('More', { screen: 'Services' })}
          />
          <Card
            icon="book-outline"
            title="Safety handbooks"
            description="Read practical cyber-safety guides"
            onPress={() => navigation.navigate('More', { screen: 'Handbooks' })}
          />
        </View>
      </ScrollView>
      <View style={[styles.emergencyDock, { backgroundColor: theme.background }]}> 
        <EmergencyButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  hero: { borderRadius: 20, padding: 20, overflow: 'hidden', marginTop: 2 },
  heroStripe: { position: 'absolute', right: -30, top: -40, width: 130, height: 220, backgroundColor: 'rgba(227,154,36,0.18)', transform: [{ rotate: '22deg' }] },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emergencyDock: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
});
