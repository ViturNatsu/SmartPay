import axiosInstance from "./axios";

const AUTH_URL = "/auth";

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
