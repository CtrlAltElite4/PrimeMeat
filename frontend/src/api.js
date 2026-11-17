import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // send the session cookie
  withXSRFToken: true, // attach X-XSRF-TOKEN from the XSRF-TOKEN cookie
  headers: { Accept: "application/json" },
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
        // Only real actions that need a login send people to /login
    const isSessionCheck = error.config?.url?.endsWith("/api/user");

    if (error.response?.status === 401 && !isSessionCheck) {
      window.dispatchEvent(new Event("auth:required"));
    }

    return Promise.reject(error);
  },
);
export default api;
