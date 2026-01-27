import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true, // allows sending cookies
});

export function handleAxiosError(error) {
  if (error.response) {
    // Server responded with a status outside 2xx
    return {
      status: error.response.status,
      message: error.response.data?.message || "Request failed",
      data: error.response.data,
    };
  }

  if (error.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: "No response from server",
    };
  }

  // Something else happened
  return {
    status: -1,
    message: error.message || "Unexpected error",
  };
}

export default axiosInstance;
