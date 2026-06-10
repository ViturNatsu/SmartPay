import axiosInstance, { handleAxiosError } from "../axios";

const PAYEE_URL = "/api/v1/payee";

export async function getPayees() {
  try {
    const res = await axiosInstance.get(PAYEE_URL);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function addPayee(payeeName, recipientIdentifier) {
  try {
    const res = await axiosInstance.post(PAYEE_URL, {
      payeeName,
      recipientIdentifier,
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}
