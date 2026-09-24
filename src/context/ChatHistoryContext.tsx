import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { ChatMessage } from '@/types';
import { loadChatHistory, saveChatHistory, clearChatHistory, getOrCreateSessionId } from '@/utils/storage';

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'bot',
  text:
    'Hello. I can help with cyber-safety questions and suggest next steps. ' +
    'For financial cyber fraud, call 1930 promptly.',
  timestamp: Date.now(),
};

type ChatHistoryContextValue = {
  messages: ChatMessage[];
  sessionId: string | null;
  ready: boolean;
  addMessage: (message: ChatMessage) => void;
  resetHistory: () => Promise<void>;
};

const ChatHistoryContext = createContext<ChatHistoryContextValue | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [history, id] = await Promise.all([loadChatHistory(), getOrCreateSessionId()]);
      setMessages(history.length > 0 ? history : [GREETING]);
      setSessionId(id);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) {
      saveChatHistory(messages);
    }
  }, [messages, ready]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const resetHistory = useCallback(async () => {
    await clearChatHistory();
    setMessages([GREETING]);
  }, []);

  const value = useMemo(
    () => ({ messages, sessionId, ready, addMessage, resetHistory }),
    [messages, sessionId, ready, addMessage, resetHistory]
  );

  return <ChatHistoryContext.Provider value={value}>{children}</ChatHistoryContext.Provider>;
}

export function useChatHistory(): ChatHistoryContextValue {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  return ctx;
}
