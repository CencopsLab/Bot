import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { ChatHistoryProvider } from '@/context/ChatHistoryContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import NetworkStatusIndicator from '@/components/NetworkStatusIndicator';

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const scheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [splashImageLoaded, setSplashImageLoaded] = useState(false);

  useEffect(() => {
    if (!splashImageLoaded) return;

    void SplashScreen.hideAsync();
    const timeout = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timeout);
  }, [splashImageLoaded]);

  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ChatHistoryProvider>
            <StatusBar hidden={showSplash} style={scheme === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
            <NetworkStatusIndicator />
          </ChatHistoryProvider>
        </LanguageProvider>
      </SafeAreaProvider>
      {showSplash && (
        <Image
          source={require('./assets/splash21.png')}
          resizeMode="cover"
          onLoad={() => setSplashImageLoaded(true)}
          onError={(error) => {
            console.error('Unable to load the full-screen splash image.', error.nativeEvent);
            void SplashScreen.hideAsync();
            setShowSplash(false);
          }}
          style={styles.splashImage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashImage: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
});
