import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : '/api',
  withCredentials: true,
});

export default API;
