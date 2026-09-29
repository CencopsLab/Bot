import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_OPTIONS, type Language, translate } from './translations';

const LANGUAGE_KEY = 'CyberRakshak:language';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, variables?: Record<string, string | number>) => string;
  languageOptions: typeof LANGUAGE_OPTIONS;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'hi' || stored === 'pa') setLanguageState(stored);
    });
  }, []);

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
  }, []);

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>) => translate(language, key, variables),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languageOptions: LANGUAGE_OPTIONS }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
