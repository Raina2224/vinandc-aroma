import axios from "axios";

// Use explicit env var when provided, otherwise default to local backend
const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API = `${BASE}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("vc_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
