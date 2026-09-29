require('dotenv/config');

/** @type {import('@expo/config-types').ExpoConfig} */
module.exports = {
  name: 'CyberRakshak',
  slug: 'cybersaathi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon2.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#145C63',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'in.gov.chdpolice.CyberRakshak',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon2.png',
      backgroundColor: '#145C63',
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'in.gov.chdpolice.CyberRakshak',
  },
  extra: {
    eas: {
      projectId: '1ada7567-46b9-4307-9d22-be177881de40',
    },
    apiBaseUrl: process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8000',
  },
  plugins: [],
};
