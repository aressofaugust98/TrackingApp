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

  if (response.status === 204) {
    return null;
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
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

  if (response.status === 204) {
    return null;
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return await response.json();
};

const formatDateToYMD = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveTransactionArray = (payload) => {
  const isTransactionObject = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    const hasId = value.id != null;
    const hasAmount = value.amount != null;
    const hasType = typeof value.type === 'string';
    const hasDate = Boolean(value.createdAt || value.date || value.transactionDate || value.timestamp);

    return (hasId && hasAmount && hasType) || (hasAmount && hasType && hasDate);
  };

  if (Array.isArray(payload)) {
    return payload;
  }

  if (isTransactionObject(payload)) {
    return [payload];
  }

  const directCandidates = [
    payload?.transactions,
    payload?.data,
    payload?.content,
    payload?.items,
    payload?.results,
    payload?.result,
    payload?.rows,
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (isTransactionObject(candidate)) {
      return [candidate];
    }
  }

  const nestedCandidates = [
    payload?.data?.transactions,
    payload?.data?.content,
    payload?.data?.items,
    payload?.data?.results,
    payload?.result?.transactions,
    payload?.result?.content,
    payload?.result?.items,
    payload?.result?.results,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (isTransactionObject(candidate)) {
      return [candidate];
    }
  }

  return [];
};

const dedupeTransactions = (transactions = []) => {
  const map = new Map();

  transactions.forEach((transaction, index) => {
    const key = transaction?.id != null
      ? String(transaction.id)
      : `${transaction?.type || ''}|${transaction?.createdAt || ''}|${transaction?.amount || ''}|${transaction?.note || ''}|${index}`;
    map.set(key, transaction);
  });

  return Array.from(map.values());
};

const fetchTransactionsWithParams = async (params) => {
  const response = await fetch(getApiUrl(`/transactions?${params.toString()}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to fetch transactions');
  }

  const responseData = await response.json();
  return {
    responseData,
    transactions: resolveTransactionArray(responseData),
  };
};

export const getTransactions = async (startDate, endDate, type = null) => {
  const params = new URLSearchParams({
    startDate: formatDateToYMD(startDate),
    endDate: formatDateToYMD(endDate),
  });

  if (type) {
    params.append('type', type);
    const { responseData, transactions } = await fetchTransactionsWithParams(params);
    console.log('GET Transactions Response:', responseData);
    return transactions;
  }

  const types = ['EXPENSE', 'INCOME', 'TRANSFER'];
  const results = await Promise.all(
    types.map(async (currentType) => {
      const typedParams = new URLSearchParams(params);
      typedParams.append('type', currentType);
      const { responseData, transactions } = await fetchTransactionsWithParams(typedParams);
      console.log(`GET Transactions Response (${currentType}):`, responseData);
      return transactions;
    })
  );

  return dedupeTransactions(results.flat());
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
