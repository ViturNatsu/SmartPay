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