import { apiService } from './api';

export const appointmentService = {
    async getAllAppointments() {
        return apiService.get('/api/appointments');
    },

    async getTodaysAppointments() {
        return apiService.get('/api/appointments/today');
    },

    async getAppointmentsByPatient(patientId) {
        return apiService.get(`/api/appointments/patient/${patientId}`);
    },

    async getAppointmentsByDoctor(doctorId) {
        return apiService.get(`/api/appointments/doctor/${doctorId}`);
    },

    async getAppointmentsByStatus(status) {
        return apiService.get(`/api/appointments/status/${status}`);
    },

    async getAppointmentsByDateRange(startDate, endDate) {
        return apiService.get(`/api/appointments/date-range?startDate=${startDate}&endDate=${endDate}`);
    },

    async createAppointment(appointmentData) {
        return apiService.post('/api/appointments', appointmentData);
    },

    async updateAppointment(id, appointmentData) {
        return apiService.put(`/api/appointments/${id}`, appointmentData);
    },

    async updateAppointmentStatus(id, status) {
        return apiService.put(`/api/appointments/${id}/status?status=${status}`);
    },

    async deleteAppointment(id) {
        return apiService.delete(`/api/appointments/${id}`);
    }
};