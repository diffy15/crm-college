import api from './api';

export const feeService = {
  // Get all fees
  getAll: async (params = {}) => {
    const response = await api.get('/fees', { params });
    return response.data;
  },

  // Get fee by ID
  getById: async (id) => {
    const response = await api.get(`/fees/${id}`);
    return response.data;
  },

  // Get fees by student
  getByStudent: async (studentId) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return response.data;
  },

  // Get pending fees
  getPending: async () => {
    const response = await api.get('/fees/pending/all');
    return response.data;
  },

  // Get fee stats
  getStats: async () => {
    const response = await api.get('/fees/stats/dashboard');
    return response.data;
  },

  // Create fee record
  create: async (feeData) => {
    const response = await api.post('/fees', feeData);
    return response.data;
  },

  // Update fee
  update: async (id, feeData) => {
    const response = await api.put(`/fees/${id}`, feeData);
    return response.data;
  },

  // Delete fee
  delete: async (id) => {
    const response = await api.delete(`/fees/${id}`);
    return response.data;
  },
};