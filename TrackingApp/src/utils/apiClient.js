import { getApiUrl } from './apiConfig';

const buildUrl = (endpoint = '') => {
  return getApiUrl(endpoint);
};

const parseJsonSafely = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const url = buildUrl(endpoint);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const cache = typeof options.cache === 'undefined' ? 'no-store' : options.cache;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    cache,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    throw new Error('Unauthorized. Please log in again.');
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
};
