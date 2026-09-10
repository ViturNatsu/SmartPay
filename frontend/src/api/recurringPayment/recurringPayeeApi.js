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

export async function pauseRecurringPayee(payeeId) {
  try {
    const res = await axiosInstance.put(
      `${RECURRING_PAYEE_URL}/pause/${payeeId}`,
    );

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function resumeRecurringPayee(payeeId, nextPaymentDate) {
  try {
    const { data } = await axiosInstance.put(
      `${RECURRING_PAYEE_URL}/resume/${payeeId}`,
      nextPaymentDate ? { nextPaymentDate } : {},
    );
    return data;
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

export async function updateRecurringPayee(payeeId, payload) {
  try {
    const res = await axiosInstance.put(
      `${RECURRING_PAYEE_URL}/${payeeId}`,
      payload,
    );

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function updateRecurringPayeeAmount(payeeId, amount) {
  try {
    const res = await axiosInstance.patch(
      `${RECURRING_PAYEE_URL}/${payeeId}/amount`,
      { amount },
    );

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function cancelRecurringPayee(payeeId) {
  try {
    const res = await axiosInstance.put(
      `${RECURRING_PAYEE_URL}/cancel/${payeeId}`,
    );

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}