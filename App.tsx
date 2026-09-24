import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { ChatHistoryProvider } from '@/context/ChatHistoryContext';

export default function App() {
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ChatHistoryProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
      </ChatHistoryProvider>
    </SafeAreaProvider>
  );
}
