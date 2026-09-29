import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { ChatMessage } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import Markdown from 'react-native-markdown-display';

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const isUser = message.role === 'user';

  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.row, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: theme.primary, borderBottomRightRadius: 4 }
            : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderBottomLeftRadius: 4 },
        ]}
      >
        {isUser ? (
          <Text style={[typography.body, { color: '#fff' }]}>{message.text}</Text>
        ) : (
          <Markdown
            style={{
              body: { ...typography.body, color: theme.text },
              heading1: { ...typography.h2, color: theme.text, marginTop: 0, marginBottom: 8 },
              heading2: { ...typography.h3, color: theme.text, marginTop: 6, marginBottom: 6 },
              strong: { fontWeight: '700', color: theme.text },
              em: { fontStyle: 'italic', color: theme.text },
              bullet_list: { marginTop: 4, marginBottom: 4 },
              ordered_list: { marginTop: 4, marginBottom: 4 },
              list_item: { marginBottom: 3 },
              code_inline: { color: theme.primary, backgroundColor: theme.primary + '12', borderRadius: 4 },
              fence: { color: theme.text, backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10 },
              paragraph: { marginTop: 0, marginBottom: 8 },
            }}
          >
            {message.text}
          </Markdown>
        )}
        <Text
          style={[
            typography.caption,
            { color: isUser ? 'rgba(255,255,255,0.75)' : theme.textMuted, marginTop: 6, alignSelf: 'flex-end' },
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}

export function TypingIndicator() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { t } = useLanguage();
  return (
    <View style={[styles.row, { justifyContent: 'flex-start' }]}>
      <View style={[styles.bubble, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
        <Text style={[typography.body, { color: theme.textMuted }]}>{t('chat.typing')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 6 },
  bubble: { maxWidth: '84%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
});
