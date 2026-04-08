const AI_BASE_URL = 'https://examining-camcorder-extract-file.trycloudflare.com';
const CHAT_API_URL = `${AI_BASE_URL}/chat`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const sendChatMessage = async (messageText) => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token, message: messageText }),
  });

  if (!response.ok) {
    throw new Error('Failed to send chat message');
  }

  const data = await response.json();
  return data.reply;
};

export const getChatHistory = async (userId, limit = 50) => {
  const normalizedUserId = Number.parseInt(userId, 10);
  const normalizedLimit = Number.parseInt(limit, 10);

  if (!Number.isInteger(normalizedUserId)) {
    throw new Error('Invalid user_id parameter');
  }

  const safeLimit = Number.isInteger(normalizedLimit) ? normalizedLimit : 50;
  const endpoint = `${AI_BASE_URL}/history/${normalizedUserId}?limit=${safeLimit}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }

  return await response.json();
};