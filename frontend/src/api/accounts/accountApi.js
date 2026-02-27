import axiosInstance, { handleAxiosError } from "../axios";

const ACCOUNTS_URL = "/api/v1/accounts";

export async function getUserAccounts(userId) {
  try {
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/user/${userId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function createAccount(payload) {
  try {
    const res = await axiosInstance.post(`${ACCOUNTS_URL}`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}


