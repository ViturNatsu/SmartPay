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