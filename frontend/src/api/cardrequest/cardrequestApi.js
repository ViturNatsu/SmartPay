import axiosInstance, { handleAxiosError } from "../axios";

const CARD_REQUEST_ADMIN_BASE_URL = "/api/v1/card-request/admin";

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