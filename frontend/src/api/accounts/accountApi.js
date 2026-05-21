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


export async function getFilteredUserAccounts(userId, filterParam) {
  console.log(filterParam)
  if(filterParam == null){
    console.log("Invalid call to filtered request with no filter params");
    return;
  }
  let params = {}
  Object.entries(filterParam).forEach(([key, val])=>{
    if(val != null) params[key] = val;
  })

  try {
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/user/${userId}`, {params});
    console.log(res.data)
    return res.data;

  } catch (err) {
    console.log("Caught in getFilteredUserAccounts" + err);
    throw handleAxiosError(err);
  }
}

export async function createAccount(payload) {
  try {
    const res = await axiosInstance.post(`${ACCOUNTS_URL}/admin`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function createAccountForUser(payload, id) {
  try {
    const res = await axiosInstance.post(`${ACCOUNTS_URL}/admin/forUser/${id}`, payload);
    console.log(res.data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getAllAccounts() {
  try {
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/admin/all`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getAccountById(accountId) {
  try {
    const res = await axiosInstance.get(`${ACCOUNTS_URL}/admin/${accountId}`);
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
    const res = await axiosInstance.delete(`${ACCOUNTS_URL}/admin/${id}`);
  } catch (err) {
    throw handleAxiosError(err);
  }
}

