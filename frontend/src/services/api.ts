import axios from 'axios';

// VITE_API_URL có thể được set dư '/api' (ví dụ http://localhost:3000/api)
// Trong khi các request lại dùng path bắt đầu bằng '/api/...', dẫn tới '/api/api/...'
const API_URL_RAW = import.meta.env.VITE_API_URL;
const API_URL = String(API_URL_RAW || '').replace(/\/+$/,'').replace(/\/api\/$/, '/').replace(/\/api$/, '');

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // backend đang dùng cookie `scholartech_session` thay cho accessToken header
  // (để tránh gửi Bearer không tồn tại gây 401)
  return config;
});

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('accessToken');
      const publicPaths = ['/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
