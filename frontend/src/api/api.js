import axios from "axios";

// This MUST point to your Render backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://contracthub-zwiu.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
