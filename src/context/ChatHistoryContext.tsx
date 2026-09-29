import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { ChatMessage } from '@/types';
import {
  saveChatHistory,
  clearChatHistory,
  clearChatSession,
  getOrCreateSessionId,
} from '@/utils/storage';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';

function createGreeting(language: Language): ChatMessage {
  const greeting = language === 'hi'
    ? 'नमस्ते। मैं साइबर सुरक्षा सवालों में मदद कर सकता हूँ और अगले कदम सुझा सकता हूँ। वित्तीय साइबर धोखाधड़ी के लिए तुरंत 1930 पर कॉल करें।'
    : language === 'pa'
      ? 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਮੈਂ ਸਾਇਬਰ ਸੁਰੱਖਿਆ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ ਅਤੇ ਅਗਲੇ ਕਦਮ ਦੱਸ ਸਕਦਾ ਹਾਂ। ਵਿੱਤੀ ਸਾਇਬਰ ਧੋਖਾਧੜੀ ਲਈ ਤੁਰੰਤ 1930 ਤੇ ਕਾਲ ਕਰੋ।'
      : 'Hello. I can help with cyber-safety questions and suggest next steps. For financial cyber fraud, call 1930 promptly.';
  return {
  id: 'greeting',
  role: 'bot',
  text: greeting,
  timestamp: Date.now(),
  };
}

type ChatHistoryContextValue = {
  messages: ChatMessage[];
  sessionId: string | null;
  ready: boolean;
  addMessage: (message: ChatMessage) => void;
  resetHistory: () => Promise<void>;
};

const ChatHistoryContext = createContext<ChatHistoryContextValue | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([createGreeting('en')]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await Promise.all([clearChatHistory(), clearChatSession()]);
      const id = await getOrCreateSessionId();
      setMessages([createGreeting(language)]);
      setSessionId(id);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    setMessages((previous) =>
      previous.map((message, index) =>
        index === 0 && message.id === 'greeting'
          ? { ...message, text: createGreeting(language).text }
          : message
      )
    );
  }, [language]);

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
    await clearChatSession();
    const freshSessionId = await getOrCreateSessionId();
    setMessages([createGreeting(language)]);
    setSessionId(freshSessionId);
  }, [language]);

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
