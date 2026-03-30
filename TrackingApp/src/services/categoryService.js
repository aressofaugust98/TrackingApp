import { fetchWithAuth } from '../utils/apiClient';

export const getAllCategories = async () => {
  const data = await fetchWithAuth('/categories');

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.categories)) {
    return data.categories;
  }

  return [];
};
