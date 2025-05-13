import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const { token } = JSON.parse(user);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string, role: 'participant' | 'facilitator') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const workshopsAPI = {
  getAll: async () => {
    const response = await api.get('/workshops');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/workshops/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description: string; facilitator: string }) => {
    const response = await api.post('/workshops', data);
    return response.data;
  },
  update: async (id: string, data: { name?: string; description?: string; facilitator?: string; status?: string }) => {
    const response = await api.put(`/workshops/${id}`, data);
    return response.data;
  },
};

export const participantsAPI = {
  getByWorkshop: async (workshopId: string) => {
    const response = await api.get(`/workshop-participants/${workshopId}`);
    return response.data;
  },
  add: async (workshopId: string, data: { userId: string; name: string; email: string }) => {
    const response = await api.post(`/workshop-participants/${workshopId}`, data);
    return response.data;
  },
  remove: async (workshopId: string, participantId: string) => {
    const response = await api.delete(`/workshop-participants/${workshopId}/participant/${participantId}`);
    return response.data;
  },
};

export const painPointsAPI = {
  getByWorkshop: async (workshopId: string) => {
    const response = await api.get(`/workshop-painpoints/${workshopId}`);
    return response.data;
  },
  add: async (workshopId: string, data: { title: string; description: string; submittedBy: string }) => {
    const response = await api.post(`/workshop-painpoints/${workshopId}`, data);
    return response.data;
  },
  update: async (workshopId: string, painPointId: string, data: { title?: string; description?: string; category?: string }) => {
    const response = await api.put(`/workshop-painpoints/${workshopId}/painpoint/${painPointId}`, data);
    return response.data;
  },
  delete: async (workshopId: string, painPointId: string) => {
    const response = await api.delete(`/workshop-painpoints/${workshopId}/painpoint/${painPointId}`);
    return response.data;
  },
};

export const useCasesAPI = {
  getByWorkshop: async (workshopId: string) => {
    const response = await api.get(`/workshop-usecases/${workshopId}`);
    return response.data;
  },
  getById: async (workshopId: string, useCaseId: string) => {
    const response = await api.get(`/workshop-usecases/${workshopId}/usecase/${useCaseId}`);
    return response.data;
  },
  create: async (workshopId: string, data: {
    title: string;
    problemStatement: string;
    currentProcess: string;
    desiredOutcome: string;
    metrics: string;
    painPoints: string[];
  }) => {
    const response = await api.post(`/workshop-usecases/${workshopId}`, data);
    return response.data;
  },
  update: async (workshopId: string, useCaseId: string, data: {
    title?: string;
    problemStatement?: string;
    currentProcess?: string;
    desiredOutcome?: string;
    metrics?: string;
    painPoints?: string[];
    scores?: {
      businessImpact?: number;
      implementationFeasibility?: number;
      timeToValue?: number;
    };
  }) => {
    const response = await api.put(`/workshop-usecases/${workshopId}/usecase/${useCaseId}`, data);
    return response.data;
  },
  score: async (workshopId: string, useCaseId: string, scores: {
    businessImpact: number;
    implementationFeasibility: number;
    timeToValue: number;
  }) => {
    const response = await api.post(`/workshop-usecases/${workshopId}/usecase/${useCaseId}/score`, scores);
    return response.data;
  },
};

export const actionPlansAPI = {
  getByWorkshop: async (workshopId: string) => {
    const response = await api.get(`/workshop-actionplans/${workshopId}`);
    return response.data;
  },
  getById: async (workshopId: string, actionPlanId: string) => {
    const response = await api.get(`/workshop-actionplans/${workshopId}/actionplan/${actionPlanId}`);
    return response.data;
  },
  create: async (workshopId: string, useCaseId: string, data: {
    title: string;
    description: string;
    tasks: { description: string; assignee: string; dueDate: string }[];
    owner: string;
  }) => {
    const response = await api.post(`/workshop-actionplans/${workshopId}`, { ...data, useCaseId });
    return response.data;
  },
  update: async (workshopId: string, actionPlanId: string, data: {
    title?: string;
    description?: string;
    tasks?: Array<{
      id?: string;
      description: string;
      owner: string;
      dueDate: string;
      status?: 'not_started' | 'in_progress' | 'completed';
    }>;
    owner?: string;
    status?: 'not_started' | 'in_progress' | 'completed';
  }) => {
    const response = await api.put(`/workshop-actionplans/${workshopId}/actionplan/${actionPlanId}`, data);
    return response.data;
  },
};

export const reportsAPI = {
  generateWorkshopReport: async (workshopId: string) => {
    const response = await api.get(`/reports/workshop/${workshopId}`);
    return response.data;
  },
};

export default api;
