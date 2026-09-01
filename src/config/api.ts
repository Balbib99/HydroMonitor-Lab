const viteEnv = import.meta.env;

const defaultApiBaseUrl = (viteEnv?.DEV ?? true)
  ? 'http://localhost:3001/api'
  : '/api';

export const API_BASE_URL = (
  viteEnv?.VITE_API_BASE_URL ?? defaultApiBaseUrl
).replace(/\/$/, '');

export function createApiUrl(path: string): URL {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return new URL(`${API_BASE_URL}${normalizedPath}`, getCurrentOrigin());
}

function getCurrentOrigin(): string {
  return globalThis.location?.origin ?? 'http://localhost';
}
