import { apiService } from './api';

export const doctorService = {
    async getAllDoctors() {
        return apiService.get('/api/doctors');
    },

    async getActiveDoctors() {
        return apiService.get('/api/doctors/active');
    },

    async getAvailableDoctors() {
        return apiService.get('/api/doctors/available');
    },

    async getDoctorById(id) {
        return apiService.get(`/api/doctors/${id}`);
    },

    async getDoctorsBySpecialization(specialization) {
        return apiService.get(`/api/doctors/specialization/${specialization}`);
    },

    async createDoctor(doctorData) {
        return apiService.post('/api/doctors', doctorData);
    },

    async updateDoctor(id, doctorData) {
        return apiService.put(`/api/doctors/${id}`, doctorData);
    },

    async deleteDoctor(id) {
        return apiService.delete(`/api/doctors/${id}`);
    }
};