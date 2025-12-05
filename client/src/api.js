import axios from 'axios';

const api = axios.create({
 baseURL: '/api',  // Set base URL from environment variable or default to localhost
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log to debug
console.log('API Base URL:', api.defaults.baseURL);

//attach the token for each request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

