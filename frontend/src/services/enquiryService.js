import api from './api';

export const enquiryService = {
  // Get all enquiries
  getAll: async (params = {}) => {
    const response = await api.get('/enquiries', { params });
    return response.data;
  },

  // Get single enquiry
  getById: async (id) => {
    const response = await api.get(`/enquiries/${id}`);
    return response.data;
  },

  // Get enquiry data for student conversion (NEW!)
  getForConversion: async (id) => {
    const response = await api.get(`/enquiries/${id}/for-conversion`);
    return response.data;
  },

  // Create enquiry
  create: async (enquiryData) => {
    const response = await api.post('/enquiries', enquiryData);
    return response.data;
  },

  // Update enquiry
  update: async (id, enquiryData) => {
    const response = await api.put(`/enquiries/${id}`, enquiryData);
    return response.data;
  },

  // Delete enquiry
  delete: async (id) => {
    const response = await api.delete(`/enquiries/${id}`);
    return response.data;
  },

  // Update status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/enquiries/${id}/status`, { status });
    return response.data;
  },
};