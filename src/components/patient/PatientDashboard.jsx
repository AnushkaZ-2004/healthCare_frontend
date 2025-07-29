import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { formatDate, formatDateOnly } from '../../utils/helpers';
import Loading from '../common/Loading';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        upcomingAppointments: [],
        recentAppointments: [],
        medicalHistory: []
    });
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.userId) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Get patient info
            const patients = await patientService.getAllPatients();
            const currentPatient = patients.find(p => p.user.id === user.userId);

            if (currentPatient) {
                setPatientInfo(currentPatient);

                // Get appointments and medical history
                const [appointments, medicalHistory] = await Promise.all([
                    appointmentService.getAppointmentsByPatient(currentPatient.id),
                    patientService.getPatientMedicalHistory(currentPatient.id)
                ]);

                // Separate upcoming and recent appointments
                const now = new Date();
                const upcoming = appointments.filter(apt => {
                    const aptDate = new Date(apt.appointmentDateTime);
                    return aptDate > now && apt.status === 'SCHEDULED';
                }).sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));

                const recent = appointments.filter(apt => {
                    const aptDate = new Date(apt.appointmentDateTime);
                    return aptDate <= now || apt.status === 'COMPLETED';
                }).sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));

                setDashboardData({
                    upcomingAppointments: upcoming.slice(0, 5),
                    recentAppointments: recent.slice(0, 5),
                    medicalHistory: medicalHistory.slice(0, 3)
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) return <Loading />;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Patient Dashboard" />
                <div className="page-content">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h2>Welcome, {user?.firstName}!</h2>
                        <p>Manage your health appointments and medical history</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card appointments">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData.upcomingAppointments.length}</div>
                                <div className="stat-label">Upcoming Appointments</div>
                            </div>
                            <div className="stat-icon">📅</div>
                        </div>

                        <div className="stat-card completed">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData.recentAppointments.length}</div>
                                <div className="stat-label">Recent Visits</div>
                            </div>
                            <div className="stat-icon">🏥</div>
                        </div>

                        <div className="stat-card history">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData.medicalHistory.length}</div>
                                <div className="stat-label">Medical Records</div>
                            </div>
                            <div className="stat-icon">📋</div>
                        </div>

                        <div className="stat-card profile">
                            <div className="stat-content">
                                <div className="stat-number">{calculateAge(patientInfo?.dateOfBirth)}</div>
                                <div className="stat-label">Age</div>
                            </div>
                            <div className="stat-icon">👤</div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-row">
                            {/* Upcoming Appointments */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Upcoming Appointments</h3>
                                    <a href="/patient/book-appointment" className="btn btn-primary btn-sm">
                                        Book New
                                    </a>
                                </div>
                                <div className="appointments-list">
                                    {dashboardData.upcomingAppointments.length > 0 ? (
                                        dashboardData.upcomingAppointments.map((appointment) => (
                                            <div key={appointment.id} className="appointment-item">
                                                <div className="appointment-date">
                                                    {formatDateOnly(appointment.appointmentDateTime)}
                                                </div>
                                                <div className="appointment-details">
                                                    <div className="doctor-name">Dr. {appointment.doctorName}</div>
                                                    <div className="appointment-reason">{appointment.reason}</div>
                                                </div>
                                                <div className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                                    {appointment.status}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-data">
                                            No upcoming appointments
                                            <a href="/patient/book-appointment" className="book-link">Book an appointment</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Patient Profile */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">My Profile</h3>
                                </div>
                                <div className="patient-profile">
                                    {patientInfo && (
                                        <>
                                            <div className="profile-item">
                                                <strong>Patient ID:</strong> {patientInfo.patientId}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Date of Birth:</strong> {formatDateOnly(patientInfo.dateOfBirth)}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Gender:</strong> {patientInfo.gender || 'N/A'}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Blood Group:</strong> {patientInfo.bloodGroup || 'N/A'}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Phone:</strong> {patientInfo.user.phoneNumber || 'N/A'}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Email:</strong> {patientInfo.user.email}
                                            </div>
                                            {patientInfo.allergies && (
                                                <div className="profile-item">
                                                    <strong>Allergies:</strong> {patientInfo.allergies}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Medical History */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Medical History</h3>
                                <a href="/patient/medical-history" className="btn btn-secondary btn-sm">
                                    View All
                                </a>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Doctor</th>
                                            <th>Diagnosis</th>
                                            <th>Treatment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.medicalHistory.length > 0 ? (
                                            dashboardData.medicalHistory.map((record) => (
                                                <tr key={record.id}>
                                                    <td>{formatDateOnly(record.visitDate)}</td>
                                                    <td>Dr. {record.doctorName}</td>
                                                    <td>{record.diagnosis || 'N/A'}</td>
                                                    <td>{record.treatment || 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="no-data">No medical history available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Appointments */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Appointments</h3>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Doctor</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.recentAppointments.length > 0 ? (
                                            dashboardData.recentAppointments.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td>{formatDateOnly(appointment.appointmentDateTime)}</td>
                                                    <td>Dr. {appointment.doctorName}</td>
                                                    <td>{appointment.reason}</td>
                                                    <td>
                                                        <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                                            {appointment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="no-data">No recent appointments</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;