<<<<<<< HEAD
import axiosInstance, { handleAxiosError, setAccessToken, clearAccessToken } from "./axios";
=======
import axiosInstance, {
  handleAxiosError,
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
} from "./axios";
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)

const OTP_URL = "/api/v1/otp";
const AUTH_URL = "/api/v1/auth";
const PASSWORD_RESET_URL = "/api/v1/password-reset";
const KEEP_ALIVE = "/api/v1/auth/keep-alive"
const CUSTOMER_DETAILS_URL = "/api/v1/customer";

export async function login(payload) {
  try {
    const response = await axiosInstance.post(`${AUTH_URL}/login`, payload);
<<<<<<< HEAD

    // ✅ CHANGED: Do NOT store tokens here. The login step only triggers OTP.
    // Tokens must only be persisted after OTP is successfully verified,
    // which happens via setAuthFromTokens() in VerifyOtp.jsx.
    // Storing them here caused AuthContext's bootstrap to find a refresh_token
    // in sessionStorage and attempt a refresh before OTP was complete,
    // resulting in a double-login / double-verify loop.
=======
    const { accessToken, refreshToken } = response.data;

    if (accessToken) setAccessToken(accessToken);
    if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)

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
<<<<<<< HEAD

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
=======
    return await refreshAccessToken();
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
  } catch (err) {
    throw handleAxiosError(err);
  }
}

export async function getMyUser() {
<<<<<<< HEAD
=======
  // return Promise.resolve({
  //   id: 1,
  //   email: "placeholder@smartpay.local",
  //   role: "fake role"
  // });
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
  try {
    const res = await axiosInstance.get(`${CUSTOMER_DETAILS_URL}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

<<<<<<< HEAD
=======
// Use refresh token to get new access and refresh token)
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
