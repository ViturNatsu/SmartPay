import axiosInstance, { handleAxiosError } from "../axios";

const WALLETS_URL = "/api/v1/wallets";

export async function getWalletByUserId(userId) {
  try {
    const res = await axiosInstance.get(`${WALLETS_URL}/${userId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

/**
 * Updates the wallet-level daily spending limit.
 *
 * POST /api/v1/wallets/{userId}/limits/daily
 *
 * @param {number} userId
 * @param {{ dailySpendingLimit: number | null }} payload
 * @returns {Promise<Object>} Updated wallet object
 */
export async function updateDailySpendingLimit(userId, payload) {
  try {
    const res = await axiosInstance.post(
      `${WALLETS_URL}/${userId}/limits/daily`,
      payload
    );
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

/**
 * Updates the wallet-level per-transaction spending limit.
 *
 * POST /api/v1/wallets/{userId}/limits/per-transaction
 *
 * @param {number} userId
 * @param {{ perTransactionLimit: number | null }} payload
 * @returns {Promise<Object>} Updated wallet object
 */
export async function updatePerTransactionLimit(userId, payload) {
  try {
    const res = await axiosInstance.post(
      `${WALLETS_URL}/${userId}/limits/per-transaction`,
      payload
    );
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function loadWallet(paymentMethodId, amount) {
  try {
    const res = await axiosInstance.post(`${WALLETS_URL}/load`, {
      paymentMethodId,
      amount,
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function withdrawFromWallet(userId, payload) {
  try {
    const res = await axiosInstance.post(`${WALLETS_URL}/${userId}/withdraw`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getWalletTransactions(userId, limit = 10) {
  try {
    const res = await axiosInstance.get(`${WALLETS_URL}/${userId}/transactions`, {
      params: { limit },
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function sendMoney(senderUserId, recipientUserId, amount, memo) {
  try {
    const res = await axiosInstance.post(`${WALLETS_URL}/${senderUserId}/transfer`, {
      recipientUserId,
      amount,
      memo: memo || null,
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}
