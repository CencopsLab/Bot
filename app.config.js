require('dotenv/config');

/** @type {import('@expo/config-types').ExpoConfig} */
module.exports = {
  name: 'CyberSaathi',
  slug: 'cybersaathi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon2.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1646C8',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'in.gov.chdpolice.cybersaathi',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon2.png',
      backgroundColor: '#1646C8',
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    // Add your Google Maps API key below for real device / release builds.
    // Expo Go will render maps with a "for development" watermark without it.
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    },
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'in.gov.chdpolice.cybersaathi',
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    },
  },
  
  "expo": {
    "extra": {
      "eas": {
        "projectId": "1ada7567-46b9-4307-9d22-be177881de40"
      }
    }
  },

  extra: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://10.0.2.2:8000',
  },
  plugins: [],
};
