import axios from 'axios';
import * as mockData from '../data/mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para habilitar mocks quando o backend estiver fora do ar
const USE_MOCKS = true; 

console.log('🔌 API BaseURL:', api.defaults.baseURL);
if (USE_MOCKS) console.log('🧪 Mock Mode: ENABLED');

// Interceptor para Mocks (Simula o backend)
api.interceptors.request.use(async (config) => {
  if (!USE_MOCKS) return config;

  // Simulação de delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  const url = config.url || '';

  // Mock Login
  if (url.includes('/auth/login')) {
    return {
      ...config,
      adapter: async () => ({
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 'mock-user-id',
            fullName: 'Admin Local (Mock)',
            email: 'admin@medpark.com',
            role: 'ADMIN',
            mustChangePassword: false
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      })
    } as any;
  }

  // Mock Próximo Número de Vaga — deve vir ANTES do mock genérico de /vacancies
  // Simula a mesma lógica do backend (MAX numérico, resistente a gaps)
  if (url.includes('/vacancies/next-number')) {
      // Gate vem na URL string (ex: /vacancies/next-number?gate=E), NÃO em config.params
      const urlSearchParams = new URLSearchParams(url.split('?')[1] || '');
      const gateFromUrl = urlSearchParams.get('gate')?.toUpperCase()
          // Fallback: tenta config.params caso a rota seja chamada de outra forma
          || (config.params as any)?.gate?.toUpperCase()
          || 'A';

      const prefix = gateFromUrl === 'E' ? 'E-' : 'A-';
      // Portaria A → 90 vagas base | Portaria E → 200 vagas base (independentes)
      const defaultStart = gateFromUrl === 'E' ? 200 : 90;

      const listKey = gateFromUrl === 'E' ? 'gate_e_vacancies' : 'gate_a_vacancies';
      const savedList = localStorage.getItem(listKey);
      let maxNum = defaultStart;

      if (savedList) {
          try {
              const list = JSON.parse(savedList);
              if (Array.isArray(list)) {
                  list.forEach((v: any) => {
                      if (v && v.number) {
                          const numStr = v.number.replace(prefix, '');
                          const num = parseInt(numStr, 10);
                          if (!isNaN(num) && num > maxNum) {
                              maxNum = num;
                          }
                      }
                  });
              }
          } catch (e) {
              console.error('Failed to parse gate vacancies for next-number', e);
          }
      }

      const nextNum = maxNum + 1;
      const nextNumber = `${prefix}${String(nextNum).padStart(3, '0')}`;

      return {
          ...config,
          adapter: async () => ({
              data: { nextNumber },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
          })
      } as any;
  }

  // Mock POST nova vaga — atualiza o contador da sessão e adiciona na lista
  if (config.method === 'post' && url === '/vacancies') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const g = (body?.gate || 'A').toUpperCase();
      const prefix = g === 'A' ? 'A-' : 'E-';
      const numPart = parseInt((body?.number || '').replace(prefix, ''), 10);
      
      const newVacancy = {
          id: !isNaN(numPart) ? numPart : Date.now(),
          number: body?.number,
          type: body?.type,
          locality: body?.locality,
          status: 'LIVRE'
      };

      // Adiciona na lista do pátio para refletir no mapa
      const listKey = g === 'A' ? 'gate_a_vacancies' : 'gate_e_vacancies';
      const savedListOptions = localStorage.getItem(listKey);
      if (savedListOptions) {
          try {
              const currentList = JSON.parse(savedListOptions);
              currentList.push(newVacancy);
              localStorage.setItem(listKey, JSON.stringify(currentList));
          } catch (e) {
              console.error('Failed to parse gate vacancies', e);
          }
      }

      return {
          ...config,
          adapter: async () => ({
              data: { ...newVacancy, currentStatus: 'LIVRE' },
              status: 201,
              statusText: 'Created',
              headers: {},
              config
          })
      } as any;
  }

  // Mock Vagas (listagem)
  if (url.includes('/vacancies')) {
      return {
          ...config,
          adapter: async () => ({
              data: [
                  ...Array.from({ length: 90 }, (_, i) => ({ id: `A-${i+1}`, gate: 'A', number: `A-${(i+1).toString().padStart(3, '0')}`, currentStatus: i < 10 ? 'OCUPADA' : 'LIVRE' })),
                  ...Array.from({ length: 200 }, (_, i) => ({ id: `E-${i+1}`, gate: 'E', number: `E-${(i+1).toString().padStart(3, '0')}`, currentStatus: i < 5 ? 'OCUPADA' : 'LIVRE' }))
              ],
              status: 200,
              statusText: 'OK',
              headers: {},
              config
          })
      } as any;
  }

  // Mock History
  if (url.includes('/access/history')) {
      return {
          ...config,
          adapter: async () => ({
              // GestaoPatio reads response.data.data → nested object
              // Dashboard reads response.data?.logs ?? response.data → also works
              data: { data: mockData.historyData, logs: mockData.historyData, total: mockData.historyData.length },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
          })
      } as any;
  }

  return config;
});

// Interceptor para depuração de requisições
api.interceptors.request.use((config) => {
  console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medpark_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

