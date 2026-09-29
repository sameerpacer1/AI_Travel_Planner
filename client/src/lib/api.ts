import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ success: boolean; error?: ApiErrorResponse }>;
    if (err.response?.data?.error?.message) {
      return err.response.data.error.message;
    }
    if (err.response?.status === 401) {
      return 'Please sign in to continue';
    }
    if (err.response?.status === 403) {
      return 'You do not have permission to perform this action';
    }
    if (err.response?.status === 404) {
      return 'Requested resource was not found';
    }
    return err.message || 'Network error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
