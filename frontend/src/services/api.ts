import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT automatically to authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ghub_token");
    const resetToken = config.url?.endsWith("/reset-password")
      ? sessionStorage.getItem("ghub_password_reset_token")
      : null;

    if (resetToken) {
      config.headers.Authorization = `Bearer ${resetToken}`;
    } else if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
