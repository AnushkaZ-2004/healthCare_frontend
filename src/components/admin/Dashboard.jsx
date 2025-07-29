import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { adminService } from '../../services/adminService';
import { appointmentService } from '../../services/appointmentService';
import Loading from '../common/Loading';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [todaysAppointments, setTodaysAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dashData, todayAppts] = await Promise.all([
                adminService.getDashboardData(),
                appointmentService.getTodaysAppointments()
            ]);

            setDashboardData(dashData);
            setTodaysAppointments(todayAppts);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <Loading />;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Admin Dashboard" />
                <div className="page-content">
                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card users">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData?.totalUsers || 0}</div>
                                <div className="stat-label">Total Users</div>
                            </div>
                            <div className="stat-icon">👥</div>
                        </div>

                        <div className="stat-card patients">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData?.totalPatients || 0}</div>
                                <div className="stat-label">Total Patients</div>
                            </div>
                            <div className="stat-icon">🤒</div>
                        </div>

                        <div className="stat-card doctors">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData?.totalDoctors || 0}</div>
                                <div className="stat-label">Total Doctors</div>
                            </div>
                            <div className="stat-icon">👨‍⚕️</div>
                        </div>

                        <div className="stat-card appointments">
                            <div className="stat-content">
                                <div className="stat-number">{dashboardData?.totalAppointments || 0}</div>
                                <div className="stat-label">Total Appointments</div>
                            </div>
                            <div className="stat-icon">📅</div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-row">
                            {/* Today's Appointments */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Today's Appointments</h3>
                                    <span className="badge">{todaysAppointments.length}</span>
                                </div>
                                <div className="appointments-list">
                                    {todaysAppointments.length > 0 ? (
                                        todaysAppointments.slice(0, 5).map((appointment) => (
                                            <div key={appointment.id} className="appointment-item">
                                                <div className="appointment-time">
                                                    {formatTime(appointment.appointmentDateTime)}
                                                </div>
                                                <div className="appointment-details">
                                                    <div className="patient-name">{appointment.patientName}</div>
                                                    <div className="doctor-name">Dr. {appointment.doctorName}</div>
                                                </div>
                                                <div className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                                    {appointment.status}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-data">No appointments for today</div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Quick Actions</h3>
                                </div>
                                <div className="quick-actions">
                                    <a href="/admin/patients" className="quick-action-btn">
                                        <span className="action-icon">🤒</span>
                                        <span>Add New Patient</span>
                                    </a>
                                    <a href="/admin/doctors" className="quick-action-btn">
                                        <span className="action-icon">👨‍⚕️</span>
                                        <span>Add New Doctor</span>
                                    </a>
                                    <a href="/admin/appointments" className="quick-action-btn">
                                        <span className="action-icon">📅</span>
                                        <span>Schedule Appointment</span>
                                    </a>
                                    <a href="/admin/users" className="quick-action-btn">
                                        <span className="action-icon">👥</span>
                                        <span>Manage Users</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Recent Patients */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Patients</h3>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Patient ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Blood Group</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData?.recentPatients?.slice(0, 5).map((patient) => (
                                            <tr key={patient.id}>
                                                <td>{patient.patientId}</td>
                                                <td>{patient.user?.firstName} {patient.user?.lastName}</td>
                                                <td>{patient.user?.email}</td>
                                                <td>{patient.user?.phoneNumber}</td>
                                                <td>{patient.bloodGroup || 'N/A'}</td>
                                            </tr>
                                        )) || (
                                                <tr>
                                                    <td colSpan="5" className="no-data">No recent patients</td>
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

export default AdminDashboard;