import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const ADMIN_TOKEN_KEY = "adminToken";
export const CURRENCY = "$";

const api = axios.create({ baseURL: API_URL });

// Attach the admin JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.token = token;
  return config;
});

// Log out automatically when the token is rejected
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if ([401, 403].includes(error?.response?.status)) {
      window.dispatchEvent(new Event("admin-logout"));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
