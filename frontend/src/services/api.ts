import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🔌 API BaseURL:', api.defaults.baseURL);

// PRIMEIRO: Interceptor para adicionar o token em TODAS as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medpark_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// SEGUNDO: Interceptor para depuração
api.interceptors.request.use((config) => {
  console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido — redirecionar para login se não for rota de auth
      const url = error.config?.url || '';
      if (!url.includes('/auth/')) {
        console.warn('[AUTH] Token expirado ou inválido. Redirecionando para login...');
        localStorage.removeItem('medpark_token');
        localStorage.removeItem('medpark_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
