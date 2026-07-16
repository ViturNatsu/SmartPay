import axiosInstance, { handleAxiosError } from "../axios";

const CARD_REQUEST_ADMIN_BASE_URL = "/api/v1/card-request/admin";
const CARD_REQUEST_USER_BASE_URL = "/api/v1/card-request/user";

export async function getAllCardRequests() {
    try {
        const res = await axiosInstance.get(CARD_REQUEST_ADMIN_BASE_URL);
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function getPendingCardRequests() {
    try {
        const res = await axiosInstance.get(`${CARD_REQUEST_ADMIN_BASE_URL}/pending`);
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function getCardRequestByRequestId(requestId) {
    try {
        const res = await axiosInstance.get(`${CARD_REQUEST_ADMIN_BASE_URL}/${requestId}`);
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function approveCardRequest(requestId) {
    try {
        const res = await axiosInstance.put(`${CARD_REQUEST_ADMIN_BASE_URL}/${requestId}/approve`);
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function denyCardRequest(requestId, denyReason) {
    try {
        const res = await axiosInstance.put(
            `${CARD_REQUEST_ADMIN_BASE_URL}/${requestId}/deny`,
            {
                denyReason: denyReason,
            }
        );
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function requestNewCardOtp() {
    try {
        return await axiosInstance.post(`${CARD_REQUEST_USER_BASE_URL}/new-card/otp`);
    } catch (err) {
        throw handleAxiosError(err);
    }
}

export async function createNewCardRequest(accessCode, confirmationStatus) {
    try {
        const res = await axiosInstance.post(`${CARD_REQUEST_USER_BASE_URL}/new-card`, {
            "access-code": accessCode,
            confirmed: confirmationStatus,
        });
        return res.data;
    } catch (err) {
        throw handleAxiosError(err);
    }
}