import { getApiUrl } from '../utils/apiConfig';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

const buildError = (status, statusText, errorBody) => {
  const serverMessage =
    errorBody?.message ||
    errorBody?.error ||
    errorBody?.detail ||
    'Unknown API error';

  return new Error(`Request failed (${status} ${statusText}): ${serverMessage}`);
};

export const signUp = async (userData) => {
  const response = await fetch(getApiUrl('/auth/sign-up'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw buildError(response.status, response.statusText, data);
  }

  return data;
};

export const logIn = async (credentials) => {
  const response = await fetch(getApiUrl('/auth/log-in'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw buildError(response.status, response.statusText, data);
  }

  return data;
};

export const logOut = async (token) => {
  const response = await fetch(getApiUrl('/auth/log-out'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw buildError(response.status, response.statusText, data);
  }

  return data;
};
