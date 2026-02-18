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

      const { accessToken } = refreshResponse.data || {};
      if (accessToken) setAccessToken(accessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshErr) {
      refreshPromise = null;
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
