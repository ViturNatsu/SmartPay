import axiosInstance, { handleAxiosError } from "../axios";

const RECURRING_PAYEE_URL = "/api/v1/payee/recurring";

export async function addRecurringPayee(payload) {
  try {
    const res = await axiosInstance.post(RECURRING_PAYEE_URL, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getRecurringPayees() {
  try {
    const res = await axiosInstance.get(RECURRING_PAYEE_URL);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function deleteRecurringPayee(payeeId) {
  try {
    const res = await axiosInstance.delete(
      `${RECURRING_PAYEE_URL}/${payeeId}`,
    );

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}