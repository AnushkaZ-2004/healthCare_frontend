import { apiService } from './api';

export const authService = {
    async login(credentials) {
        try {
            const response = await apiService.post('/api/auth/login', credentials);
            return response;
        } catch (error) {
            throw new Error('Login failed');
        }
    },

    async logout() {
        try {
            await apiService.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};