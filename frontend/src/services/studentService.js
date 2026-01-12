import api from './api';

export const studentService = {
  // Get all students
  getAll: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get single student
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Create student
  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  // Update student
  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  // Update status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/students/${id}/status`, { status });
    return response.data;
  },

  // Delete student
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};