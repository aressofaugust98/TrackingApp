import { API_BASE_URL } from '../utils/apiConfig';

const API_URL = String(API_BASE_URL || '').replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getCategoriesByType = async (type) => {
  const response = await fetch(`${API_URL}/categories?type=${encodeURIComponent(type)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
};
