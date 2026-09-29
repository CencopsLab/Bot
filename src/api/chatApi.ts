import { apiClient, toApiError } from './client';

export type ChatApiResponse = {
  reply: string;
};

// Backend contract: POST {API_BASE_URL}/api/chat  { message, session_id } -> { reply: string }
// This app never calls Groq / VirusTotal directly — everything goes through your backend.
export async function sendChatMessage(message: string, sessionId: string, language: 'en' | 'hi' | 'pa'): Promise<string> {
  try {
    const { data } = await apiClient.post<ChatApiResponse | { text?: string; response?: string }>(
      '/api/chat',
      { message, session_id: sessionId, language }
    );
    // Tolerate a couple of reasonable backend response shapes.
    const anyData = data as any;
    return anyData.reply ?? anyData.text ?? anyData.response ?? '';
  } catch (error) {
    throw toApiError(error);
  }
}
