import { apiService } from './api';

export const medicalRecordService = {
    async getAllMedicalRecords() {
        return apiService.get('/api/medical-records');
    },

    async getMedicalRecordById(id) {
        return apiService.get(`/api/medical-records/${id}`);
    },

    async getMedicalRecordsByPatient(patientId) {
        return apiService.get(`/api/medical-records/patient/${patientId}`);
    },

    async getMedicalRecordsByDoctor(doctorId) {
        return apiService.get(`/api/medical-records/doctor/${doctorId}`);
    },

    async getMedicalRecordByAppointment(appointmentId) {
        return apiService.get(`/api/medical-records/appointment/${appointmentId}`);
    },

    async searchByDiagnosis(diagnosis) {
        return apiService.get(`/api/medical-records/search?diagnosis=${diagnosis}`);
    },

    async createMedicalRecord(recordData) {
        return apiService.post('/api/medical-records', recordData);
    },

    async updateMedicalRecord(id, recordData) {
        return apiService.put(`/api/medical-records/${id}`, recordData);
    },

    async deleteMedicalRecord(id) {
        return apiService.delete(`/api/medical-records/${id}`);
    }
};