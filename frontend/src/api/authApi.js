import axiosInstance,{handleAxiosError} from "./axios";

const AUTH_URL = "/auth";
const OTP_URL = "/api/v1/otp"
const PASSWORD_RESET_URL = "/api/v1/password-reset"
const LOGIN_URL = "/api/v1/auth/login"
const REGISTER_URL = "/api/v1/auth/register"

//use authApi to make axios calls to the server and use AuthProvider to process the response
export async function login(payload) {
  try {
    const response = await axiosInstance.post(`${LOGIN_URL}`, payload);
    
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function logout() {
  try {
    await axiosInstance.post(`${AUTH_URL}/logout`);
    sessionStorage.removeItem("session_token");
    document.cookie = "access_token=; path=/; max-age=0;"; 
  } catch {
    throw handleAxiosError(err);
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

export async function sendVerifyCode(payload) {
  try {
    const {email, code, type} = payload;
    let res = await axiosInstance.post(`${OTP_URL}/verify`, payload);
    switch(type){
      case "login":
            let { sessionToken } = response.data;
            sessionStorage.setItem("session_token", sessionToken);
            break;
        case "register":
            break;
        case "forgot-password":
            break;
    }
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

export async function register(payload) {
  try {
    let res = await axiosInstance.post(`${REGISTER_URL}`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}