import { getApiUrl } from '../utils/apiConfig';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

export const getReportSummary = async (startDate, endDate) => {
  const response = await fetch(
    getApiUrl(`/reports/summary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch report summary');
  }

  return await response.json();
};

export const getReportByCategory = async (type, startDate, endDate) => {
  const response = await fetch(
    getApiUrl(`/reports/by-category?type=${encodeURIComponent(type)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch report by category');
  }

  return await response.json();
};

export const getReportByWallet = async (type, startDate, endDate) => {
  const response = await fetch(
    getApiUrl(`/reports/by-wallet?type=${encodeURIComponent(type)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch report by wallet');
  }

  return await response.json();
};
