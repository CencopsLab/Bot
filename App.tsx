import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { ChatHistoryProvider } from '@/context/ChatHistoryContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import NetworkStatusIndicator from '@/components/NetworkStatusIndicator';

export default function App() {
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ChatHistoryProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
          <NetworkStatusIndicator />
        </ChatHistoryProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
