import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { ChatMessage } from '@/types';

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
        <Text style={[typography.body, { color: isUser ? '#fff' : theme.text }]}>{message.text}</Text>
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
  return (
    <View style={[styles.row, { justifyContent: 'flex-start' }]}>
      <View style={[styles.bubble, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
        <Text style={[typography.body, { color: theme.textMuted }]}>CyberSaathi is typing…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 6 },
  bubble: { maxWidth: '84%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
});
