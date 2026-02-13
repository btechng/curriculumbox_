// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://curriculumbox-backend.onrender.com/api";

export default API_BASE_URL;

// Helper function for making authenticated requests
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return response;
};
