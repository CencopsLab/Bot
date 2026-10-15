import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/env';

const API_BASE_URL_KEY = 'CyberRakshak:api_base_url';

let activeApiBaseUrl = API_BASE_URL;
let loadingApiBaseUrl: Promise<string> | undefined;

export function normalizeApiBaseUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  const normalized = withProtocol.replace(/\/+$/, '');

  try {
    const parsed = new URL(normalized);
    if (
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
      || !parsed.hostname
      || parsed.username
      || parsed.password
      || parsed.search
      || parsed.hash
    ) {
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export function getApiBaseUrl(): Promise<string> {
  if (!loadingApiBaseUrl) {
    loadingApiBaseUrl = AsyncStorage.getItem(API_BASE_URL_KEY).then((stored) => {
      if (stored !== null) {
        const normalized = normalizeApiBaseUrl(stored);
        if (!normalized) throw new Error('The saved backend address is invalid. Update it in More settings.');
        activeApiBaseUrl = normalized;
      }
      return activeApiBaseUrl;
    });
  }
  return loadingApiBaseUrl;
}

export async function saveApiBaseUrl(value: string): Promise<string> {
  const normalized = normalizeApiBaseUrl(value);
  if (!normalized) throw new Error('Invalid backend address.');

  await AsyncStorage.setItem(API_BASE_URL_KEY, normalized);
  activeApiBaseUrl = normalized;
  loadingApiBaseUrl = Promise.resolve(normalized);
  return normalized;
}
