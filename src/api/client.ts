import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/env';

// Single, centralized HTTP client. Swap base URL / headers / auth here only.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10 * 60 * 1000,
});

// Placeholder for future API-key / bearer-token auth.
// Uncomment and wire up once your backend requires it.
// apiClient.interceptors.request.use((config) => {
//   config.headers = config.headers ?? {};
//   config.headers.Authorization = `Bearer ${YOUR_API_TOKEN}`;
//   return config;
// });

export class ApiError extends Error {
  isTimeout: boolean;
  isNetwork: boolean;
  status?: number;

  constructor(message: string, opts: { isTimeout?: boolean; isNetwork?: boolean; status?: number } = {}) {
    super(message);
    this.name = 'ApiError';
    this.isTimeout = !!opts.isTimeout;
    this.isNetwork = !!opts.isNetwork;
    this.status = opts.status;
  }
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    if (err.code === 'ECONNABORTED') {
      return new ApiError('The request timed out. Please try again.', { isTimeout: true });
    }
    if (!err.response) {
      return new ApiError('No internet connection or the server is unreachable.', { isNetwork: true });
    }
    if (err.response.status === 413) {
      return new ApiError('File is larger than the 150 MB upload limit.', { status: 413 });
    }
    return new ApiError(`Server error (${err.response.status}). Please try again.`, {
      status: err.response.status,
    });
  }
  return new ApiError('Something went wrong. Please try again.');
}
