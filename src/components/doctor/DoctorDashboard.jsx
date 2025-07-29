import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { formatTime, formatDateOnly } from '../../utils/helpers';
import Loading from '../common/Loading';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        todaysAppointments: [],
        upcomingAppointments: [],
        totalPatients: 0,
        completedAppointments: 0
    });
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.userId) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // First, get doctor info
            const doctors = await doctorService.getAllDoctors();
            const currentDoctor = doctors.find(d => d.user.id === user.userId);

            if (currentDoctor) {
                setDoctorInfo(currentDoctor);

                // Get appointments
                const [todaysAppts, allAppts] = await Promise.all([
                    appointmentService.getTodaysAppointments(),
                    appointmentService.getAppointmentsByDoctor(currentDoctor.id)
                ]);

                // Filter today's appointments for this doctor
                const doctorTodayAppts = todaysAppts.filter(apt => apt.doctorId === currentDoctor.id);

                // Get upcoming appointments (next 7 days)
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const upcomingAppts = allAppts.filter(apt => {
                    const aptDate = new Date(apt.appointmentDateTime);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return aptDate > today && aptDate <= nextWeek && apt.status === 'SCHEDULED';
                });

                // Count completed appointments
                const completedCount = allAppts.filter(apt => apt.status === 'COMPLETED').length;

                // Count unique patients
                const uniquePatients = new Set(allAppts.map(apt => apt.patientId)).size;

                setDashboardData({
                    todaysAppointments: doctorTodayAppts,
                    upcomingAppointments: upcomingAppts.slice(0, 5),
                    totalPatients: uniquePatients,
                    completedAppointments: completedCount
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Doctor Dashboard" />
                <div className="page-content">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h2>Welcome back, Dr. {user?.firstName}!</h2>
                        <p>Here's your medical practice overview</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card appointments">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData.todaysAppointments.length}</div>
                                <div className="stat-label">Today's Appointments</div>
                            </div>
                            <div className="stat-icon">📅</div>
                        </div>

                        <div className="stat-card patients">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData.totalPatients}</div>
                                <div className="stat-label">Total Patients</div>
                            </div>
                            <div className="stat-icon">👥</div>
                        </div>

                        <div className="stat-card completed">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData.completedAppointments}</div>
                                <div className="stat-label">Completed Visits</div>
                            </div>
                            <div className="stat-icon">✅</div>
                        </div>

                        <div className="stat-card profile">
                            <div className="stat-content">
                                <div className="stat-number">{doctorInfo?.experience || 0}</div>
                                <div className="stat-label">Years Experience</div>
                            </div>
                            <div className="stat-icon">🏥</div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-row">
                            {/* Today's Schedule */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Today's Schedule</h3>
                                    <span className="badge">{dashboardData.todaysAppointments.length}</span>
                                </div>
                                <div className="appointments-list">
                                    {dashboardData.todaysAppointments.length > 0 ? (
                                        dashboardData.todaysAppointments.map((appointment) => (
                                            <div key={appointment.id} className="appointment-item">
                                                <div className="appointment-time">
                                                    {formatTime(appointment.appointmentDateTime)}
                                                </div>
                                                <div className="appointment-details">
                                                    <div className="patient-name">{appointment.patientName}</div>
                                                    <div className="appointment-reason">{appointment.reason}</div>
                                                </div>
                                                <div className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                                    {appointment.status}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-data">No appointments scheduled for today</div>
                                    )}
                                </div>
                            </div>

                            {/* Doctor Profile */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">My Profile</h3>
                                </div>
                                <div className="doctor-profile">
                                    {doctorInfo && (
                                        <>
                                            <div className="profile-item">
                                                <strong>Specialization:</strong> {doctorInfo.specialization}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Department:</strong> {doctorInfo.department}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Qualification:</strong> {doctorInfo.qualification}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Working Hours:</strong> {doctorInfo.workingHours}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Consultation Fee:</strong> ${doctorInfo.consultationFee}
                                            </div>
                                            <div className="profile-item">
                                                <strong>Status:</strong>
                                                <span className={`status-badge ${doctorInfo.available ? 'status-active' : 'status-inactive'}`}>
                                                    {doctorInfo.available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Upcoming Appointments</h3>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Patient</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.upcomingAppointments.length > 0 ? (
                                            dashboardData.upcomingAppointments.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td>{formatDateOnly(appointment.appointmentDateTime)}</td>
                                                    <td>{formatTime(appointment.appointmentDateTime)}</td>
                                                    <td>{appointment.patientName}</td>
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
                                                <td colSpan="5" className="no-data">No upcoming appointments</td>
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

export default DoctorDashboard;