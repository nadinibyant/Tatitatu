import axios from 'axios';

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: token ? `Bearer ${token}` : '',
  },
  withCredentials: false, 
});

api.interceptors.response.use(
  (response) => {
    return response; 
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error); 
  }
);

export default api;