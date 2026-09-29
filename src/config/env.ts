import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

export const API_BASE_URL: string = String(extra.apiBaseUrl || '').replace(/\/$/, '') || 'http://10.0.2.2:8000';

export const EMERGENCY_NUMBER = '1930';
