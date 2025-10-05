// src/services/api.js
import axios from 'axios';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof window !== 'undefined' && window.__API_BASE) ||
  'http://localhost:5000'; // fallback para dev local

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export default api;



