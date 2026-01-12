import api from './api';

export const courseService = {
  // Get all courses
  getAll: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get active courses (for dropdowns)
  getActive: async () => {
    const response = await api.get('/courses/active/list');
    return response.data;
  },

  // Get single course
  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Create course
  create: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // Update course
  update: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  // Update seats
  updateSeats: async (id, filled) => {
    const response = await api.patch(`/courses/${id}/seats`, { filled });
    return response.data;
  },

  // Delete course
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};