import { apiClient, toApiError } from './client';
import type { ImportantContact } from '@/types';

export async function fetchImportantContacts(): Promise<ImportantContact[]> {
  try {
    const { data } = await apiClient.get<ImportantContact[]>('/api/contacts');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}