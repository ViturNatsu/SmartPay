import axiosInstance,{handleAxiosError} from "./axios";

const AUTH_URL = "/auth";
const PASSWORD_RESET_URL = "/api/v1/password-reset"

//use authApi to make axios calls to the server and use AuthProvider to process the response
export async function login(payload) {


  try {
    const response = await axiosInstance.post(`${AUTH_URL}/login`, payload);

  } catch (err) {

  }
}

export async function logout() {
  try {
    await axiosInstance.post(`${AUTH_URL}/logout`);
  } catch {
    // Swallow errors; client state will be reset anyway
  }
}

export async function requestResetCode(payload) {
  try {
    let res = await axiosInstance.post(`${PASSWORD_RESET_URL}/code`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function sendResetCode(payload) {
  try {
    let res = await axiosInstance.post(`${PASSWORD_RESET_URL}`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function resetPassword(payload) {
  try {
    let res = await axiosInstance.put(`${PASSWORD_RESET_URL}/reset`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}
