import axios from 'axios';

// Pointing to your live FastAPI local server
const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic Request Interceptor to attach JWT tokens out of localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexdesk_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
