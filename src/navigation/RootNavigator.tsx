import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { getTheme } from '@/theme/colors';
import type { RootTabParamList, MoreStackParamList } from './types';

import HomeScreen from '@/screens/HomeScreen';
import ChatScreen from '@/screens/ChatScreen';
import ScannerScreen from '@/screens/ScannerScreen';
import LocatorScreen from '@/screens/LocatorScreen';
import MoreScreen from '@/screens/MoreScreen';
import ServicesScreen from '@/screens/ServicesScreen';
import HandbooksScreen from '@/screens/HandbooksScreen';
import HandbookDetailScreen from '@/screens/HandbookDetailScreen';
import PrivacyNoticeScreen from '@/screens/PrivacyNoticeScreen';
import { useLanguage } from '@/i18n/LanguageContext';

const Tab = createBottomTabNavigator<RootTabParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreHome" component={MoreScreen} />
      <MoreStack.Screen name="Services" component={ServicesScreen} />
      <MoreStack.Screen name="Handbooks" component={HandbooksScreen} />
      <MoreStack.Screen name="HandbookDetail" component={HandbookDetailScreen} />
      <MoreStack.Screen name="PrivacyNotice" component={PrivacyNoticeScreen} />
    </MoreStack.Navigator>
  );
}

const TAB_ICON: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Chat: 'chatbubble-ellipses',
  Scan: 'shield-checkmark',
  Help: 'location',
  More: 'grid',
};

export default function RootNavigator() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { t } = useLanguage();

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            height: 68,
            paddingTop: 8,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
          tabBarLabel: t(`nav.${route.name.toLowerCase()}`),
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? TAB_ICON[route.name] : (`${TAB_ICON[route.name]}-outline` as any)}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Scan" component={ScannerScreen} />
        <Tab.Screen name="Help" component={LocatorScreen} options={{ title: 'Help' }} />
        <Tab.Screen name="More" component={MoreStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
