import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View, useColorScheme } from 'react-native';
import * as Network from 'expo-network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme } from '@/theme/colors';
import { useLanguage } from '@/i18n/LanguageContext';

export default function NetworkStatusIndicator() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let active = true;
    const updateStatus = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (active) setIsOnline(state.isInternetReachable ?? state.isConnected ?? false);
      } catch {
        if (active) setIsOnline(false);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 10000);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') updateStatus();
    });

    return () => {
      active = false;
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, []);

  return (
    <View pointerEvents="none" style={[styles.status, { top: insets.top + 4 }]}>
      <View style={[styles.dot, { backgroundColor: isOnline ? theme.success : theme.danger }]} />
      <Text style={[styles.label, { color: theme.text }]}>{t(isOnline ? 'network.online' : 'network.offline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    position: 'absolute',
    right: 16,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 10, fontWeight: '700' },
});