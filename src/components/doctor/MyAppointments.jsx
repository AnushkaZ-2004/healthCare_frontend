import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { formatDate, formatDateOnly, formatTime } from '../../utils/helpers';
import Loading from '../common/Loading';

const MyAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [medicalRecordForm, setMedicalRecordForm] = useState({
        diagnosis: '',
        symptoms: '',
        treatment: '',
        prescription: '',
        testResults: '',
        notes: ''
    });

    useEffect(() => {
        if (user?.userId) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [appointments, filterStatus, filterDate]);

    const fetchData = async () => {
        try {
            // Get doctor info
            const doctors = await doctorService.getAllDoctors();
            const currentDoctor = doctors.find(d => d.user.id === user.userId);

            if (currentDoctor) {
                setDoctorInfo(currentDoctor);

                // Get appointments for this doctor
                const appointmentsData = await appointmentService.getAppointmentsByDoctor(currentDoctor.id);
                setAppointments(appointmentsData.sort((a, b) =>
                    new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime)
                ));
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...appointments];

        if (filterStatus) {
            filtered = filtered.filter(apt => apt.status === filterStatus);
        }

        if (filterDate) {
            filtered = filtered.filter(apt => {
                const aptDate = formatDateOnly(apt.appointmentDateTime);
                return aptDate === filterDate;
            });
        }

        setFilteredAppointments(filtered);
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
            fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error updating appointment status:', error);
            alert('Error updating appointment status. Please try again.');
        }
    };

    const handleAddMedicalRecord = (appointment) => {
        setSelectedAppointment(appointment);
        setMedicalRecordForm({
            diagnosis: '',
            symptoms: '',
            treatment: '',
            prescription: '',
            testResults: '',
            notes: ''
        });
        setShowMedicalRecordModal(true);
    };

    const handleMedicalRecordChange = (e) => {
        const { name, value } = e.target;
        setMedicalRecordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMedicalRecordSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAppointment || !doctorInfo) return;

        try {
            const recordData = {
                patientId: selectedAppointment.patientId,
                doctorId: doctorInfo.id,
                appointmentId: selectedAppointment.id,
                ...medicalRecordForm
            };

            await medicalRecordService.createMedicalRecord(recordData);

            // Update appointment status to completed
            await appointmentService.updateAppointmentStatus(selectedAppointment.id, 'COMPLETED');

            setShowMedicalRecordModal(false);
            fetchData(); // Refresh data
            alert('Medical record created successfully!');
        } catch (error) {
            console.error('Error creating medical record:', error);
            alert('Error creating medical record. Please try again.');
        }
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    if (loading) return <Loading />;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="My Appointments" />
                <div className="page-content">
                    {/* Filters */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Filter Appointments</h3>
                        </div>
                        <div className="filters-section">
                            <div className="filter-group">
                                <label>Status:</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="form-control filter-control"
                                >
                                    <option value="">All Status</option>
                                    {Object.values(APPOINTMENT_STATUS).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Date:</label>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="form-control filter-control"
                                />
                            </div>
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setFilterStatus('');
                                        setFilterDate('');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="stats-grid">
                        <div className="stat-card scheduled">
                            <div className="stat-content">
                                <div className="stat-number">
                                    {appointments.filter(apt => apt.status === 'SCHEDULED').length}
                                </div>
                                <div className="stat-label">Scheduled</div>
                            </div>
                            <div className="stat-icon">📅</div>
                        </div>
                        <div className="stat-card completed">
                            <div className="stat-content">
                                <div className="stat-number">
                                    {appointments.filter(apt => apt.status === 'COMPLETED').length}
                                </div>
                                <div className="stat-label">Completed</div>
                            </div>
                            <div className="stat-icon">✅</div>
                        </div>
                        <div className="stat-card today">
                            <div className="stat-content">
                                <div className="stat-number">
                                    {appointments.filter(apt =>
                                        formatDateOnly(apt.appointmentDateTime) === getTodayDate()
                                    ).length}
                                </div>
                                <div className="stat-label">Today</div>
                            </div>
                            <div className="stat-icon">🗓️</div>
                        </div>
                    </div>

                    {/* Appointments List */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Appointments ({filteredAppointments.length})
                            </h3>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Patient</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>
                                                <div className="appointment-datetime">
                                                    <div className="apt-date">{formatDateOnly(appointment.appointmentDateTime)}</div>
                                                    <div className="apt-time">{formatTime(appointment.appointmentDateTime)}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="patient-info">
                                                    <div className="patient-name">{appointment.patientName}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="reason-cell">
                                                    {appointment.reason}
                                                </div>
                                            </td>
                                            <td>
                                                <select
                                                    value={appointment.status}
                                                    onChange={(e) => handleStatusUpdate(appointment.id, e.target.value)}
                                                    className={`status-select status-${appointment.status.toLowerCase()}`}
                                                >
                                                    {Object.values(APPOINTMENT_STATUS).map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {appointment.status === 'SCHEDULED' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleAddMedicalRecord(appointment)}
                                                        >
                                                            Add Record
                                                        </button>
                                                    )}
                                                    {appointment.status === 'COMPLETED' && (
                                                        <span className="completed-badge">✅ Completed</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAppointments.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="no-data">
                                                No appointments found matching your filters
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Medical Record Modal */}
                    {showMedicalRecordModal && selectedAppointment && (
                        <Modal
                            title={`Add Medical Record - ${selectedAppointment.patientName}`}
                            onClose={() => setShowMedicalRecordModal(false)}
                        >
                            <form onSubmit={handleMedicalRecordSubmit}>
                                <div className="appointment-info-header">
                                    <p><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDateTime)}</p>
                                    <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
                                </div>

                                <div className="form-group">
                                    <label>Symptoms</label>
                                    <textarea
                                        name="symptoms"
                                        value={medicalRecordForm.symptoms}
                                        onChange={handleMedicalRecordChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Patient's reported symptoms"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Diagnosis</label>
                                    <textarea
                                        name="diagnosis"
                                        value={medicalRecordForm.diagnosis}
                                        onChange={handleMedicalRecordChange}
                                        className="form-control"
                                        rows="2"
                                        placeholder="Medical diagnosis"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Treatment</label>
                                    <textarea
                                        name="treatment"
                                        value={medicalRecordForm.treatment}
                                        onChange={handleMedicalRecordChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Treatment plan and recommendations"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Prescription</label>
                                    <textarea
                                        name="prescription"
                                        value={medicalRecordForm.prescription}
                                        onChange={handleMedicalRecordChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Medications prescribed"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Test Results</label>
                                    <textarea
                                        name="testResults"
                                        value={medicalRecordForm.testResults}
                                        onChange={handleMedicalRecordChange}
                                        className="form-control"
                                        rows="2"
                                        placeholder="Lab results, vital signs, etc."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Additional Notes</label>
                                    <textarea
                                        name="notes"
                                        value={medicalRecordForm.notes}
                                        onChange={handleMedicalRecordChange}
                                        className="form-control"
                                        rows="2"
                                        placeholder="Additional observations or notes"
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowMedicalRecordModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save Medical Record
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

export default MyAppointments;