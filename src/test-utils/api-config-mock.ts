export const API_BASE_URL = 'http://localhost:3001/api';

export function createApiUrl(path: string): URL {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return new URL(`${API_BASE_URL}${normalizedPath}`);
}
