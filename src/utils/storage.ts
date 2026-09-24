import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '@/types';

const CHAT_HISTORY_KEY = 'cybersaathi:chat_history';
const SESSION_ID_KEY = 'cybersaathi:session_id';

export async function loadChatHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  try {
    // Keep local history bounded so storage never grows unbounded.
    const bounded = messages.slice(-200);
    await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(bounded));
  } catch {
    // Non-fatal: chat still works without persistence.
  }
}

export async function clearChatHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  } catch {
    // ignore
  }
}

export async function getOrCreateSessionId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const fresh = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(SESSION_ID_KEY, fresh);
    return fresh;
  } catch {
    return `session_${Date.now()}`;
  }
}
