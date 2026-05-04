import { buildApiUrl } from '../config/api';

async function parseResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data?.result ?? data;
}

export async function apiRequest(path, options = {}) {
  const { token, headers, ...rest } = options;

  const response = await fetch(buildApiUrl(path), {
    ...rest,
    headers: {
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return parseResponse(response);
}
