import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // send the session cookie
  withXSRFToken: true, // attach X-XSRF-TOKEN from the XSRF-TOKEN cookie
  headers: { Accept: "application/json" },
});

export default api;
