import { apiService } from './api';

export const patientService = {
    async getAllPatients() {
        return apiService.get('/api/patients');
    },

    async getActivePatients() {
        return apiService.get('/api/patients/active');
    },

    async getPatientById(id) {
        return apiService.get(`/api/patients/${id}`);
    },

    async createPatient(patientData) {
        return apiService.post('/api/patients', patientData);
    },

    async updatePatient(id, patientData) {
        return apiService.put(`/api/patients/${id}`, patientData);
    },

    async deletePatient(id) {
        return apiService.delete(`/api/patients/${id}`);
    },

    async getPatientMedicalHistory(patientId) {
        return apiService.get(`/api/medical-records/patient/${patientId}`);
    }
};