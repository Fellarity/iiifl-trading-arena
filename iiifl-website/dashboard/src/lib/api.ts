import axios from 'axios';

// Use computer's IP for mobile testing
const api = axios.create({
  baseURL: 'http://192.168.1.8:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
