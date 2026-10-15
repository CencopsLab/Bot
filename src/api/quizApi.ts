import { apiClient, toApiError } from './client';
import type { Language } from '@/i18n/translations';
import type { ScamQuizAnswer, ScamQuizQuestion, ScamQuizType } from '@/types';

export async function fetchQuizQuestions(type: ScamQuizType, language: Language): Promise<ScamQuizQuestion[]> {
  try {
    const { data } = await apiClient.get<{ questions: ScamQuizQuestion[] }>('/api/quiz', {
      params: { type, language },
    });
    return data.questions;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function checkQuizAnswer(
  type: ScamQuizType,
  questionId: string,
  answerIndex: number,
  language: Language
): Promise<ScamQuizAnswer> {
  try {
    const { data } = await apiClient.post<ScamQuizAnswer>('/api/quiz/answer', {
      type,
      questionId,
      answerIndex,
      language,
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}
