import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Modal from '../common/Modal';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { formatDate, formatDateOnly, formatTime } from '../../utils/helpers';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentDateTime: '',
        reason: '',
        status: 'SCHEDULED',
        notes: '',
        prescription: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appointmentsData, patientsData, doctorsData] = await Promise.all([
                appointmentService.getAllAppointments(),
                patientService.getActivePatients(),
                doctorService.getAvailableDoctors()
            ]);

            setAppointments(appointmentsData);
            setPatients(patientsData);
            setDoctors(doctorsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAppointment) {
                await appointmentService.updateAppointment(editingAppointment.id, formData);
            } else {
                await appointmentService.createAppointment(formData);
            }
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving appointment:', error);
            alert('Error saving appointment. Please try again.');
        }
    };

    const handleEdit = (appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            appointmentDateTime: appointment.appointmentDateTime.slice(0, 16), // Format for datetime-local input
            reason: appointment.reason || '',
            status: appointment.status,
            notes: appointment.notes || '',
            prescription: appointment.prescription || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this appointment?')) {
            try {
                await appointmentService.deleteAppointment(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting appointment:', error);
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await appointmentService.updateAppointmentStatus(id, newStatus);
            fetchData();
        } catch (error) {
            console.error('Error updating appointment status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            patientId: '',
            doctorId: '',
            appointmentDateTime: '',
            reason: '',
            status: 'SCHEDULED',
            notes: '',
            prescription: ''
        });
        setEditingAppointment(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getFilteredAppointments = () => {
        if (!filterStatus) return appointments;
        return appointments.filter(apt => apt.status === filterStatus);
    };

    const getMinDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Appointment Management" />
                <div className="page-content">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">All Appointments</h3>
                            <div className="header-actions">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="form-control filter-select"
                                >
                                    <option value="">All Status</option>
                                    {Object.values(APPOINTMENT_STATUS).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <button className="btn btn-primary" onClick={openAddModal}>
                                    Schedule Appointment
                                </button>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredAppointments().map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>
                                                <div>{formatDateOnly(appointment.appointmentDateTime)}</div>
                                                <div className="text-muted">{formatTime(appointment.appointmentDateTime)}</div>
                                            </td>
                                            <td>{appointment.patientName}</td>
                                            <td>Dr. {appointment.doctorName}</td>
                                            <td>{appointment.reason}</td>
                                            <td>
                                                <select
                                                    value={appointment.status}
                                                    onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                                    className={`status-select status-${appointment.status.toLowerCase()}`}
                                                >
                                                    {Object.values(APPOINTMENT_STATUS).map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(appointment)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(appointment.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Appointment Form Modal */}
                    {showModal && (
                        <Modal
                            title={editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                            onClose={() => setShowModal(false)}
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Patient</label>
                                        <select
                                            name="patientId"
                                            value={formData.patientId}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        >
                                            <option value="">Select Patient</option>
                                            {patients.map(patient => (
                                                <option key={patient.id} value={patient.id}>
                                                    {patient.user.firstName} {patient.user.lastName} ({patient.patientId})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Doctor</label>
                                        <select
                                            name="doctorId"
                                            value={formData.doctorId}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        >
                                            <option value="">Select Doctor</option>
                                            {doctors.map(doctor => (
                                                <option key={doctor.id} value={doctor.id}>
                                                    Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Appointment Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="appointmentDateTime"
                                            value={formData.appointmentDateTime}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            min={getMinDateTime()}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        >
                                            {Object.values(APPOINTMENT_STATUS).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Reason for Visit</label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Describe the reason for this appointment"
                                        required
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="2"
                                        placeholder="Additional notes (optional)"
                                    ></textarea>
                                </div>

                                {formData.status === 'COMPLETED' && (
                                    <div className="form-group">
                                        <label>Prescription</label>
                                        <textarea
                                            name="prescription"
                                            value={formData.prescription}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            rows="3"
                                            placeholder="Prescription details"
                                        ></textarea>
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingAppointment ? 'Update' : 'Schedule'} Appointment
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentManagement;