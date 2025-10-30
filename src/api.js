import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  // You can add default headers here if needed
});

export default api;
