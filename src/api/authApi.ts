import type { AuthResponse, LoginRequest } from "../types/Auth";
import axiosInstance from "./axios";

const AUTH_URL = "/auth";

//use authApi to make axios calls to the server and use AuthProvider to process the response

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return await new Promise(()=>"Placeholder");
}

export async function logout(): Promise<void> {
  
}
