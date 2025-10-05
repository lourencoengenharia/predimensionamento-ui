_# Path: predimensionamento-ui/src/services/api.js_

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export default api;

