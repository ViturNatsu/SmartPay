import axiosInstance, { handleAxiosError } from "../axios";

const PAYEE_URL = "/api/v1/payee";

export async function addPayee(payload) {
  try {
    const res = await axiosInstance.post(`${PAYEE_URL}`, payload)
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getPayees() {
  try {
    const res = await axiosInstance.get(`${PAYEE_URL}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function deletePayee(payeeId) {
  try {
    const res = await axiosInstance.delete(`${PAYEE_URL}/${payeeId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}