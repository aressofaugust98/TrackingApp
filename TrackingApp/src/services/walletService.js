import { fetchWithAuth } from '../utils/apiClient'

export const getAllWallets = async () => {
  const data = await fetchWithAuth('/wallets')

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.wallets)) {
    return data.wallets
  }

  return []
}

export const createWallet = async (payload) => {
  return fetchWithAuth('/wallets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const updateWallet = async (walletId, payload) => {
  return fetchWithAuth(`/wallets/${walletId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export const deleteWallet = async (walletId) => {
  return fetchWithAuth(`/wallets/${walletId}`, {
    method: 'DELETE',
  })
}
