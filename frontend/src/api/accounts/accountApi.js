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

export async function getInactiveUserAccounts(userId, institutionNumber){
  // optional filtering on institutionNumber
  const params = {};
  if(institutionNumber !== undefined){
    params.institution = institutionNumber;
  }
  try{
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/inactive/user/${userId}`,{params})
    return res.data;
  }catch (err) {
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

export async function getAllAccounts() {
  try {
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/all`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getAccountById(accountId) {
  try {
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/${accountId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function updateAccountUsers(accountId, userIds) {
  try {
    const res = await axiosInstance.put(`${ACCOUNTS_URL}/admin/${accountId}/users`, userIds);
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

