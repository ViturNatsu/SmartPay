import axiosInstance, { handleAxiosError } from "../axios";

const CARDS_URL = "/api/v1/cards";

/**
 * Retrieves the virtual card details associated with a specific wallet ID.
 *
 * POST /api/v1/cards/{walletId}
 *
 * @param {number} walletId  - The ID of the wallet
 * @returns {Promise<{ virtualCardNumber, expiryDate, CVV }>}
 */
export async function getCardByWalletId(walletId) {
    try {
        const res = await axiosInstance.get(`${CARDS_URL}/${walletId}`);
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}