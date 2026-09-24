import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

export const API_BASE_URL: string = extra.apiBaseUrl || 'http://10.0.2.2:8000';

export const EMERGENCY_NUMBER = '1930';
