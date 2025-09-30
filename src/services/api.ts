import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'receita' | 'despesa';
  user_id: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'receita' | 'despesa';
  category_id: number;
  category?: Category;
  date: string;
  description: string;
}

export interface Meta {
  id: number;
  user_id: number;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  kind: string;
}

export interface Investment {
  id: number;
  name: string;
  description: string;
  monthly_rate: number;
  risk_level: string;
}

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<User> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  me: async (userId: number): Promise<User> => {
    const response = await api.get('/auth/me', {
      params: { user_id: userId }
    });
    return response.data;
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (userId: number): Promise<Category[]> => {
    const response = await api.get('/categories/', {
      params: { user_id: userId }
    });
    return response.data;
  },

  create: async (data: { name: string; type: 'receita' | 'despesa'; user_id: number }): Promise<Category> => {
    const response = await api.post('/categories/', data);
    return response.data;
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async (userId: number): Promise<Transaction[]> => {
    const response = await api.get('/transactions/', {
      params: { user_id: userId }
    });
    return response.data;
  },

  create: async (data: {
    user_id: number;
    amount: number;
    type: 'receita' | 'despesa';
    category_id: number;
    date: string;
    description: string;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions/', data);
    return response.data;
  },

  undo: async (transactionId: number) => {
    const response = await api.post(`/transactions/${transactionId}/undo`);
    return response.data;
  }
};

// Metas API
export const metasAPI = {
  getAll: async (userId: number): Promise<Meta[]> => {
    const response = await api.get('/metas/', {
      params: { user_id: userId }
    });
    return response.data;
  },

  create: async (data: {
    user_id: number;
    description: string;
    target_amount: number;
    deadline: string;
    kind: string;
  }): Promise<Meta> => {
    const response = await api.post('/metas/', data);
    return response.data;
  },

  deposit: async (metaId: number, amount: number) => {
    const response = await api.post(`/metas/${metaId}/deposit`, { amount });
    return response.data;
  },

  getProgress: async (metaId: number) => {
    const response = await api.get(`/metas/${metaId}/progress`);
    return response.data;
  }
};

// Investments API
export const investmentsAPI = {
  getAll: async (): Promise<Investment[]> => {
    const response = await api.get('/investments/');
    return response.data;
  }
};