import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true, 
});

let inMemoryAccessToken = null;

export function setAccessToken(token) {
  inMemoryAccessToken = token;
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
}

export function getAccessToken() {
  return inMemoryAccessToken;
}

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

<<<<<<< HEAD
=======
export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const storedRefresh = sessionStorage.getItem("refresh_token");
  if (!storedRefresh) {
    clearAccessToken();
    throw new Error("Missing refresh token");
  }

  refreshPromise = axiosInstance
    .post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: { Authorization: `Bearer ${storedRefresh}` },
      }
    )
    .then((refreshResponse) => {
      const { accessToken, refreshToken } = refreshResponse.data || {};
      if (!accessToken) throw new Error("No access token returned");

      setAccessToken(accessToken);
      if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);

      return { accessToken, refreshToken };
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response || !originalRequest) throw error;

    if (error.response.status !== 401) throw error;

    if (originalRequest._retry) throw error;
    originalRequest._retry = true;

    const url = originalRequest.url || "";
    if (url.includes("/api/v1/auth/refresh") || url.includes("/api/v1/auth/logout")) {
      clearAccessToken();
      throw error;
    }

    const refreshToken = sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      clearAccessToken();
      throw error; 
    }

    try {
<<<<<<< HEAD
      if (!refreshPromise) {
        const storedRefresh = sessionStorage.getItem("refresh_token");
        if (!storedRefresh) {
          clearAccessToken();
          throw error;
        }
        refreshPromise = axiosInstance.post(
          "/api/v1/auth/refresh",
          {},
          {
            headers: { Authorization: `Bearer ${storedRefresh}` },
          }
        );
      }

      const refreshResponse = await refreshPromise;
      refreshPromise = null;

      const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data || {};
      if (accessToken) setAccessToken(accessToken);
      if (newRefreshToken) sessionStorage.setItem("refresh_token", newRefreshToken);

=======
      const { accessToken } = await refreshAccessToken();
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshErr) {
<<<<<<< HEAD
      refreshPromise = null;
=======
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
      clearAccessToken();
      sessionStorage.removeItem("refresh_token");
      throw refreshErr;
    }
  }
);

export function handleAxiosError(error) {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || "Request failed",
      data: error.response.data,
    };
  }

  if (error.request) {
    return { status: 0, message: "No response from server" };
  }

  return { status: -1, message: error.message || "Unexpected error" };
}

export default axiosInstance;
