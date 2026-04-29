import axios from "axios";
import { getCredentials, saveCredentials } from "./storage.js";

const API_URL = process.env.INSIGHTA_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {
    "X-API-Version": "1",
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  try {
    const creds = getCredentials();
    if (creds?.accessToken) { 
        config.headers.Authorization = `Bearer ${creds.accessToken}`;
    }
  } catch (e) {
    // Silent fail for unauthenticated requests
  }
  return config;
});

// Response Interceptor: Handle 401 & Auto-Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const creds = getCredentials();
      
      if (creds?.refreshToken) { // Match camelCase from backend
        try {
            const res = await axios.post(`${API_URL}/auth/refresh`, {
                refresh_token: creds.refreshToken 
            });
            
            // The backend returns { status, accessToken, refreshToken }
            const newTokens = {
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
                user: creds.user // Keep the user info stored previously
            };

            saveCredentials(newTokens); 
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
          console.error("Session expired. Please run 'insighta login' again.");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;