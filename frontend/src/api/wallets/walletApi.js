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
 * Submits a withdrawal from the user's wallet to a linked bank account.
 *
 * POST /api/v1/wallets/{userId}/withdraw
 *
 * @param {number} userId  - The ID of the wallet owner (must match the authenticated user)
 * @param {{ paymentMethodId: number, amount: number }} payload
 * @returns {Promise<{ wallet_id, balance, ... }>} Updated wallet object
 */
export async function withdrawFromWallet(userId, payload) {
  try {
    const res = await axiosInstance.post(`${WALLETS_URL}/${userId}/withdraw`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}