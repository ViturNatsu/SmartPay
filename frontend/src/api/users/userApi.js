import axiosInstance, { handleAxiosError } from "../axios";

const USERS_URL = "/api/v1/users";

export async function getAllUsers() {
  try {
    const res = await axiosInstance.get(`${USERS_URL}/admin/users`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}