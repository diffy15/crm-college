import api from './api';

export const dashboardService = {
  // Get statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async () => {
    const response = await api.get('/dashboard/recent-activities');
    return response.data;
  },

  // Get course-wise data
  getCourseWiseData: async () => {
    const response = await api.get('/dashboard/course-wise-data');
    return response.data;
  },
};