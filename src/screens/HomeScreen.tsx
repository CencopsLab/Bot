import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import ScreenHeader from '@/components/ScreenHeader';
import Card from '@/components/Card';
import EmergencyButton from '@/components/EmergencyButton';
import PullToRefreshScrollView from '@/components/PullToRefreshScrollView';
import type { RootTabParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/LanguageContext';

type Nav = BottomTabNavigationProp<RootTabParamList>;

export default function HomeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <PullToRefreshScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader title="CyberRakshak" subtitle={t('home.subtitle')} />

        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <View style={[styles.heroStripe, { backgroundColor: theme.accent + '40' }]} />
          <View style={styles.heroBadge}>
            <Text style={[typography.overline, { color: '#fff' }]}>{t('home.badge')}</Text>
          </View>
          <Text style={[typography.h1, { color: '#fff', marginTop: 10 }]}>
            {t('home.title')}
          </Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.85)', marginTop: 8 }]}>
            {t('home.intro')}
          </Text>
        </View>

        <Text style={[typography.overline, { color: theme.primary, marginTop: 28 }]}> 
          {t('home.tools')}
        </Text>
        <Text style={[typography.h2, { color: theme.text, marginTop: 4, marginBottom: 12 }]}>
          {t('home.help')}
        </Text>

        <View style={styles.grid}>
          <Card
            icon="chatbubble-ellipses-outline"
            title={t('home.ask.title')}
            description={t('home.ask.description')}
            onPress={() => navigation.navigate('Chat')}
          />
          <Card
            icon="search-outline"
            title={t('home.scan.title')}
            description={t('home.scan.description')}
            onPress={() => navigation.navigate('Scan')}
          />
          <Card
            icon="location-outline"
            title={t('home.helpNearby.title')}
            description={t('home.helpNearby.description')}
            onPress={() => navigation.navigate('Help')}
          />
          <Card
            icon="call-outline"
            title={t('home.contacts.title')}
            description={t('home.contacts.description')}
            onPress={() => navigation.navigate('Help')}
          />
          <Card
            icon="open-outline"
            title={t('home.services.title')}
            description={t('home.services.description')}
            onPress={() => navigation.navigate('More', { screen: 'Services' })}
          />
          <Card
            icon="book-outline"
            title={t('home.handbooks.title')}
            description={t('home.handbooks.description')}
            onPress={() => navigation.navigate('More', { screen: 'Handbooks' })}
          />
        </View>
      </PullToRefreshScrollView>
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
  heroStripe: { position: 'absolute', right: -30, top: -40, width: 130, height: 220, transform: [{ rotate: '22deg' }] },
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
