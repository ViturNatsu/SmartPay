import axiosInstance, { handleAxiosError } from "../axios";

const ACCOUNTS_URL = "/api/v1/accounts";

export async function getUserAccounts(userId) {
  try {
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/user/${userId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function createAccount(payload) {
  try {
    const res = await axiosInstance.post(`${ACCOUNTS_URL}`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function createAccountForUser(payload, id) {
  try {
    const res = await axiosInstance.post(`${ACCOUNTS_URL}/forUser/${id}`, payload);
    console.log(res.data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function deleteAccountById(id) {
  try {
    const res = await axiosInstance.delete(`${ACCOUNTS_URL}/${id}`);
  } catch (err) {
    throw handleAxiosError(err);
  }
}

