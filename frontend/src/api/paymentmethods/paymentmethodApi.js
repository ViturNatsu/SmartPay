import axiosInstance, { handleAxiosError } from "../axios";

const PAYMENT_METHODS_URL = "/api/v1/paymentmethods";

export async function createPaymentMethod(payload) {
    try {
        const res = await axiosInstance.post(`${PAYMENT_METHODS_URL}`, payload);
        console.log(res);
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function batchCreatePaymentMethod(payloadArray) {
    try {
        const responses = await Promise.all(
            payloadArray.map(payload => axiosInstance.post(`${PAYMENT_METHODS_URL}`, payload))
        );
        return responses.map(res => res.data);
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function getPaymentMethodsForUserWithId(id, page) {

    try {
        const res = await axiosInstance.get(`${PAYMENT_METHODS_URL}/user/${id}/${page}`);
        console.log(res);
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}

//To make payment method inactive instead of deleting it
export async function updatePaymentMethodStatus(paymentMethodId, activeStatus) {
  try {
    const res = await axiosInstance.put(`${PAYMENT_METHODS_URL}/${paymentMethodId}/status`, {
      active: activeStatus
    });
    console.log(res);
    return res.data;
  } catch (err) {
    throw new Error(
      err.res?.data?.message || "Failed to update payment method"
    );
  }
};