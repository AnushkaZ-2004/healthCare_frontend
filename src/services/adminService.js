import { apiService } from './api';

export const adminService = {
    async getDashboardData() {
        return apiService.get('/api/admin/dashboard');
    },

    async getUserStats() {
        return apiService.get('/api/admin/users/stats');
    },

    async getAppointmentStats() {
        return apiService.get('/api/admin/appointments/stats');
    },

    async createAdmin(adminData) {
        return apiService.post('/api/admin/create-admin', adminData);
    }
};