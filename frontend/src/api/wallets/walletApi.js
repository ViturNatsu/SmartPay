import axiosInstance, { handleAxiosError } from "../axios";
import { getRailLabel } from "../../utils/transactionRailUtils";

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

export async function getWalletTransactions(userId, page = 0, limit = 25, favourite = null, search = "") 
{
  const params = {
    page,
    limit,
  };

  if (favourite !== null) {
    params.favourite = favourite;
  }

  if (search.trim() !== "") {
    params.search = search.trim();
  }

  const res = await axiosInstance.get(
    `${WALLETS_URL}/${userId}/transactions`,
    { params }
  );

  return res.data;
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


/**
 * Updates the favourite status of a wallet transaction.
 *
 * PATCH /api/v1/wallets/{userId}/transactions/favourite/{transactionId}
 *
 * @param {number} userId
 * @param {string} transactionId
 * @param {boolean} isFavourite
 * @returns {Promise<Object>} Updated WalletTransactionDTO
 */
export async function updateTransactionFavourite(userId, transactionId, isFavourite) {
  try {
    const res = await axiosInstance.patch(
      `${WALLETS_URL}/${userId}/transactions/favourite/${transactionId}`,
      null,
      {
        params: {
          isFavourite,
        },
      }
    );

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}
