import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5172",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  // Get token from sessionStorage (per-tab storage)
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
