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