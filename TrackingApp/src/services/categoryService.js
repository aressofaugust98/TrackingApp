const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const getAllCategories = async () => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let responseBody = '';

    try {
      responseBody = await response.text();
    } catch {
      responseBody = 'Unable to read error response body';
    }

    throw new Error(
      `Failed to fetch categories (${response.status} ${response.statusText}) from ${API_URL}/categories. Response: ${responseBody || 'No response body'}`
    );
  }

  return await response.json();
};
