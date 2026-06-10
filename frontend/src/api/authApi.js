import axiosInstance, { handleAxiosError, setAccessToken, clearAccessToken } from "./axios";

const OTP_URL = "/api/v1/otp";
const AUTH_URL = "/api/v1/auth";
const PASSWORD_RESET_URL = "/api/v1/password-reset";
const KEEP_ALIVE = "/api/v1/auth/keep-alive"
const CUSTOMER_DETAILS_URL = "/api/v1/customer";

export async function login(payload) {
  try {
    // Clear any existing session tokens before starting a new login flow.
    // This prevents old session monitoring from interfering (e.g., expiring
    // and kicking the user off /verify while they look for the OTP).
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");

    const response = await axiosInstance.post(`${AUTH_URL}/login`, payload);
    return response.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function logout(reason) {
  try {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (refreshToken) {
      const body = reason ? { reason } : {};
      await axiosInstance.post(`${AUTH_URL}/logout`, body, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
    }
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");
  } catch (err) {
    clearAccessToken();
    sessionStorage.removeItem("refresh_token");

    // 401 means the session was already invalidated (e.g. logged out from
    // another tab). This is not an error — just clear local state quietly.
    const status = err?.response?.status;
    if (status === 401) {
      return;
    }

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
    case "reveal-card":
      return "REVEAL_CARD";
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