const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const isAbsoluteApiUrl = /^https?:\/\//i.test(String(RAW_API_BASE_URL));
const useApiProxy = isAbsoluteApiUrl;

export const API_BASE_URL = useApiProxy ? '/api' : RAW_API_BASE_URL;

export const getApiUrl = (endpoint = '') => {
  const baseUrl = String(API_BASE_URL).replace(/\/+$/, '');
  const normalizedEndpoint = String(endpoint).replace(/^\/+/, '');

  if (!normalizedEndpoint) {
    return baseUrl;
  }

  return `${baseUrl}/${normalizedEndpoint}`;
};
