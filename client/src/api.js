import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ||   ' http://localhost:3000/api',
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
