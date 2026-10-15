import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/env';
import { getApiBaseUrl } from '@/config/apiBaseUrl';

// Single, centralized HTTP client. Swap base URL / headers / auth here only.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10 * 60 * 1000,
});

apiClient.interceptors.request.use(async (config) => {
  config.baseURL = await getApiBaseUrl();
  return config;
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
  rateLimit?: { scope: string; limit: number; windowMs: number };

  constructor(message: string, opts: {
    isTimeout?: boolean;
    isNetwork?: boolean;
    status?: number;
    rateLimit?: { scope: string; limit: number; windowMs: number };
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.isTimeout = !!opts.isTimeout;
    this.isNetwork = !!opts.isNetwork;
    this.status = opts.status;
    this.rateLimit = opts.rateLimit;
  }
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    if (err.code === 'ECONNABORTED') {
      return new ApiError('The request timed out. Please try again.', { isTimeout: true });
    }
    if (!err.response) {
      const baseUrl = typeof err.config?.baseURL === 'string' ? err.config.baseURL : API_BASE_URL;
      return new ApiError(`Cannot reach the backend at ${baseUrl}. Check the APK's API URL and that the server is reachable from this device.`, { isNetwork: true });
    }
    if (err.response.status === 413) {
      return new ApiError('File is larger than the 150 MB upload limit.', { status: 413 });
    }
    if (err.response.status === 429) {
      const body = err.response.data && typeof err.response.data === 'object'
        ? err.response.data as Record<string, unknown>
        : {};
      const rateLimit = body.code === 'RATE_LIMITED'
        && typeof body.scope === 'string'
        && typeof body.limit === 'number'
        && Number.isSafeInteger(body.limit)
        && typeof body.windowMs === 'number'
        && Number.isSafeInteger(body.windowMs)
        && body.windowMs > 0
        ? { scope: body.scope, limit: body.limit, windowMs: body.windowMs }
        : undefined;
      const message = typeof body.error === 'string'
        ? body.error
        : 'Too many requests. Please wait a little and try again.';
      return new ApiError(message, { status: 429, rateLimit });
    }
    return new ApiError(`Server error (${err.response.status}). Please try again.`, {
      status: err.response.status,
    });
  }
  return new ApiError('Something went wrong. Please try again.');
}
