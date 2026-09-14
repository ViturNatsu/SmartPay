import axiosInstance, { handleAxiosError } from "../axios";

const NOTIFICATIONS_URL = "/api/v1/notifications";

export async function getNotifications() {
  try {
    const res = await axiosInstance.get(NOTIFICATIONS_URL);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function dismissNotification(id) {
  try {
    const res = await axiosInstance.patch(`${NOTIFICATIONS_URL}/${id}/dismiss`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function markNotificationAsRead(id) {
  try {
    const res = await axiosInstance.patch(`${NOTIFICATIONS_URL}/${id}/read`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}
