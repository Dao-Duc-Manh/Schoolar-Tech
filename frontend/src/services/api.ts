import axios from 'axios';

// Khi dev: Vite proxy /api → http://localhost:3000/api
// Khi production: set VITE_API_URL=https://your-backend.com
const API_BASE = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/+$/, '')
  : '';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // gửi cookie scholartech_session
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gửi token từ sessionStorage vào header nếu có (fallback khi cookie không hoạt động)
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi toàn cục
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('accessToken');
      const publicPaths = ['/login', '/register', '/verify-2fa', '/2fa-auth'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
