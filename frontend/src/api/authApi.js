import axiosInstance, { handleAxiosError, setAccessToken, clearAccessToken } from "./axios";

const OTP_URL = "/api/v1/otp";
const AUTH_URL = "/api/v1/auth";
const PASSWORD_RESET_URL = "/api/v1/password-reset";
const KEEP_ALIVE = "/api/v1/auth/keep-alive"
const CUSTOMER_DETAILS_URL = "/api/v1/customer";

export async function login(payload) {
  try {
    const response = await axiosInstance.post(`${AUTH_URL}/login`, payload);
    return response.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function logout() {
  try {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (refreshToken) {
      await axiosInstance.post(`${AUTH_URL}/logout`);
    }
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");
  } catch (err) {
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");
    throw handleAxiosError(err);
  }
}

export async function requestResetCode(payload) {
  try {
    const res = await axiosInstance.post(`${OTP_URL}`, {
      email: payload.email,
      type: apiType(payload.type),
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function sendVerifyCode(payload) {
  try {
    const res = await axiosInstance.post(`${OTP_URL}/verify`, {
      email: payload.email,
      code: payload.code,
      type: apiType(payload.type),
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

const apiType = (type) => {
  switch (type) {
    case "login":
      return "LOGIN";
    case "register":
      return "REGISTER";
    case "forgot-password":
      return "FORGOT_PASSWORD";
    default:
      return type;
  }
};

export async function resetPassword(payload) {
  try {
    const res = await axiosInstance.put(`${PASSWORD_RESET_URL}/change-password`, payload);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function register(payload) {
  try {
    const res = await axiosInstance.post(`${AUTH_URL}/register`, payload);
    const { accessToken, refreshToken } = res.data;

    if (accessToken) setAccessToken(accessToken);
    if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function refreshTokens() {
  try {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const res = await axiosInstance.post(
      `${AUTH_URL}/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    const { accessToken, refreshToken: newRefreshToken } = res.data;

    if (accessToken) setAccessToken(accessToken);
    if (newRefreshToken) sessionStorage.setItem("refresh_token", newRefreshToken);

    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getMyUser() {
  try {
    const res = await axiosInstance.get(`${CUSTOMER_DETAILS_URL}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function keepAlive(refreshToken) {
  try {
    const res = await axiosInstance.post(`${KEEP_ALIVE}`, {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}