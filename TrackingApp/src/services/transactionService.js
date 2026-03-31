import { getApiUrl } from '../utils/apiConfig';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

const buildError = async (response, fallbackMessage) => {
  let details = '';

  try {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const errorData = await response.json();
      details = errorData?.message || errorData?.error || JSON.stringify(errorData);
    } else {
      details = await response.text();
    }
  } catch {
    details = '';
  }

  const suffix = details ? `: ${details}` : '';
  return new Error(`${fallbackMessage} (${response.status} ${response.statusText})${suffix}`);
};

export const getTransactionById = async (id) => {
  const response = await fetch(getApiUrl(`/transactions/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to fetch transaction');
  }

  return await response.json();
};

export const updateTransaction = async (id, data) => {
  const response = await fetch(getApiUrl(`/transactions/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to update transaction');
  }

  return await response.json();
};

export const deleteTransaction = async (id) => {
  const response = await fetch(getApiUrl(`/transactions/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to delete transaction');
  }

  return await response.json();
};

export const getTransactions = async (startDate, endDate) => {
  const response = await fetch(
    getApiUrl(`/transactions?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw await buildError(response, 'Failed to fetch transactions');
  }

  return await response.json();
};

export const createTransaction = async (data) => {
  const response = await fetch(getApiUrl('/transactions'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to create transaction');
  }

  return await response.json();
};

export const createTransfer = async (data) => {
  const response = await fetch(getApiUrl('/transactions/transfer'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to create transfer');
  }

  return await response.json();
};
