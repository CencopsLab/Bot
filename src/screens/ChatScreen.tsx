import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import ScreenHeader from '@/components/ScreenHeader';
import Disclaimer from '@/components/Disclaimer';
import ChatBubble, { TypingIndicator } from '@/components/ChatBubble';
import { useChatHistory } from '@/context/ChatHistoryContext';
import { sendChatMessage } from '@/api/chatApi';
import { ApiError } from '@/api/client';
import type { ChatMessage } from '@/types';

export default function ChatScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { messages, sessionId, addMessage } = useChatHistory();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    setIsSending(true);

    try {
      const reply = await sendChatMessage(text, sessionId ?? 'unknown-session');
      addMessage({
        id: `b_${Date.now()}`,
        role: 'bot',
        text: reply || "I couldn't generate a response. Please try rephrasing your question.",
        timestamp: Date.now(),
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [input, isSending, sessionId, addMessage]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.headerPad}>
          <ScreenHeader title="CyberSaathi" subtitle="Cyber-safety assistance" />
          <Text style={[styles.sectionLabel, { color: theme.primary }]}>PRIVATE GUIDANCE CHAT</Text>
          <Disclaimer text="This is an AI assistant, not a substitute for filing an FIR." />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
        />

        {error ? (
          <View style={styles.errorRow}>
            <Text style={{ color: theme.danger, flex: 1 }}>{error}</Text>
            <Pressable onPress={handleSend} accessibilityRole="button" accessibilityLabel="Retry sending message">
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={[styles.inputRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about a suspicious message…"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text }]}
            multiline
            accessibilityLabel="Type your cyber-safety question"
          />
          {/* Placeholder mic icon — voice input is non-functional in v1 */}
          <Pressable accessibilityLabel="Voice input (coming soon)" style={styles.iconButton} disabled>
            <Ionicons name="mic-outline" size={20} color={theme.textMuted} />
          </Pressable>
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isSending}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={[
              styles.sendButton,
              { backgroundColor: !input.trim() || isSending ? theme.border : theme.primary },
            ]}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerPad: { paddingHorizontal: 20, paddingTop: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 12, flexGrow: 1 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: { flex: 1, maxHeight: 100, paddingVertical: 8, fontSize: 15 },
  iconButton: { padding: 6 },
  sendButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
