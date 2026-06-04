import axiosInstance, { handleAxiosError } from "../axios";

const PAYEES_URL = "/api/v1/payees";

export async function getPayeesByUserId(userId) {
  try {
    const res = await axiosInstance.get(`${PAYEES_URL}/user/${userId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function addPayee(userId, recipientEmail) {
  try {
    const res = await axiosInstance.post(`${PAYEES_URL}/user/${userId}`, {
      recipientEmail,
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}
