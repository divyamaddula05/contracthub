import axios from "axios";

// Base URL from environment (MUST be defined in .env)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // set true only if using cookies
});

// Attach token automatically to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle global response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: handle unauthorized (token expired)
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized - redirect to login");
      // optional: logout logic
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;