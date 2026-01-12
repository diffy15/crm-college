import api from './api';

export const communicationService = {
  // Get all communications
  getAll: async (params = {}) => {
    const response = await api.get('/communications', { params });
    return response.data;
  },

  // Get communications by enquiry
  getByEnquiry: async (enquiryId) => {
    const response = await api.get(`/communications/enquiry/${enquiryId}`);
    return response.data;
  },

  // Get communications by student
  getByStudent: async (studentId) => {
    const response = await api.get(`/communications/student/${studentId}`);
    return response.data;
  },

  // Get today's follow-ups
  getTodaysFollowups: async () => {
    const response = await api.get('/communications/followups/today');
    return response.data;
  },

  // Create communication
  create: async (communicationData) => {
    const response = await api.post('/communications', communicationData);
    return response.data;
  },

  // Update communication
  update: async (id, communicationData) => {
    const response = await api.put(`/communications/${id}`, communicationData);
    return response.data;
  },

  // Mark follow-up as complete
  markComplete: async (id) => {
    const response = await api.patch(`/communications/${id}/complete`);
    return response.data;
  },

  // Delete communication
  delete: async (id) => {
    const response = await api.delete(`/communications/${id}`);
    return response.data;
  },
};