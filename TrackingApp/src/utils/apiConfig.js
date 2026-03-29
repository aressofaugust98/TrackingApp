export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getApiUrl = (endpoint = '') => {
  const baseUrl = String(API_BASE_URL).replace(/\/+$/, '');
  const normalizedEndpoint = String(endpoint).replace(/^\/+/, '');

  if (!normalizedEndpoint) {
    return baseUrl;
  }

  return `${baseUrl}/${normalizedEndpoint}`;
};
