import { apiService } from './api';

export const userService = {
    async getAllUsers() {
        return apiService.get('/api/users');
    },

    async getUserById(id) {
        return apiService.get(`/api/users/${id}`);
    },

    async getUsersByRole(role) {
        return apiService.get(`/api/users/role/${role}`);
    },

    async createUser(userData) {
        return apiService.post('/api/users', userData);
    },

    async updateUser(id, userData) {
        return apiService.put(`/api/users/${id}`, userData);
    },

    async deactivateUser(id) {
        return apiService.put(`/api/users/${id}/deactivate`);
    },

    async deleteUser(id) {
        return apiService.delete(`/api/users/${id}`);
    }
};