import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { SPECIALIZATIONS } from '../../utils/constants';

const BookAppointment = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('');
    const [formData, setFormData] = useState({
        doctorId: '',
        appointmentDateTime: '',
        reason: ''
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    useEffect(() => {
        filterDoctorsBySpecialization();
    }, [doctors, filterSpecialization]);

    const fetchData = async () => {
        try {
            const [doctorsData, patientsData] = await Promise.all([
                doctorService.getAvailableDoctors(),
                patientService.getAllPatients()
            ]);

            setDoctors(doctorsData);

            // Find current patient
            const currentPatient = patientsData.find(p => p.user.id === user.userId);
            setPatientInfo(currentPatient);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error loading doctors. Please try again.');
        }
    };

    const filterDoctorsBySpecialization = () => {
        if (!filterSpecialization) {
            setFilteredDoctors(doctors);
        } else {
            setFilteredDoctors(doctors.filter(doctor =>
                doctor.specialization === filterSpecialization
            ));
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
        if (!patientInfo) {
            setError('Patient information not found. Please contact support.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const appointmentData = {
                ...formData,
                patientId: patientInfo.id
            };

            await appointmentService.createAppointment(appointmentData);
            setSuccess('Appointment booked successfully!');

            // Reset form
            setFormData({
                doctorId: '',
                appointmentDateTime: '',
                reason: ''
            });
        } catch (error) {
            console.error('Error booking appointment:', error);
            setError('Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1); // At least 1 hour from now
        return now.toISOString().slice(0, 16);
    };

    const getSelectedDoctor = () => {
        return doctors.find(doctor => doctor.id.toString() === formData.doctorId);
    };

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Book Appointment" />
                <div className="page-content">
                    <div className="booking-container">
                        <div className="booking-form-section">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Schedule New Appointment</h3>
                                </div>
                                <div className="card-body">
                                    {success && <div className="alert alert-success">{success}</div>}
                                    {error && <div className="alert alert-error">{error}</div>}

                                    <form onSubmit={handleSubmit}>
                                        {/* Filter by Specialization */}
                                        <div className="form-group">
                                            <label>Filter by Specialization (Optional)</label>
                                            <select
                                                value={filterSpecialization}
                                                onChange={(e) => setFilterSpecialization(e.target.value)}
                                                className="form-control"
                                            >
                                                <option value="">All Specializations</option>
                                                {SPECIALIZATIONS.map(spec => (
                                                    <option key={spec} value={spec}>{spec}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Select Doctor */}
                                        <div className="form-group">
                                            <label>Select Doctor</label>
                                            <select
                                                name="doctorId"
                                                value={formData.doctorId}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            >
                                                <option value="">Choose a doctor</option>
                                                {filteredDoctors.map(doctor => (
                                                    <option key={doctor.id} value={doctor.id}>
                                                        Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Doctor Info */}
                                        {getSelectedDoctor() && (
                                            <div className="doctor-info-card">
                                                <h4>Doctor Information</h4>
                                                <div className="doctor-details">
                                                    <div className="detail-item">
                                                        <strong>Specialization:</strong> {getSelectedDoctor().specialization}
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Qualification:</strong> {getSelectedDoctor().qualification}
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Experience:</strong> {getSelectedDoctor().experience} years
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Consultation Fee:</strong> ${getSelectedDoctor().consultationFee}
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Working Hours:</strong> {getSelectedDoctor().workingHours}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Appointment Date & Time */}
                                        <div className="form-group">
                                            <label>Preferred Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                name="appointmentDateTime"
                                                value={formData.appointmentDateTime}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                min={getMinDateTime()}
                                                required
                                            />
                                            <small className="form-help">
                                                Please select a date and time during the doctor's working hours
                                            </small>
                                        </div>

                                        {/* Reason for Visit */}
                                        <div className="form-group">
                                            <label>Reason for Visit</label>
                                            <textarea
                                                name="reason"
                                                value={formData.reason}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows="4"
                                                placeholder="Please describe your symptoms or the reason for this appointment"
                                                required
                                            ></textarea>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? 'Booking...' : 'Book Appointment'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Available Doctors List */}
                        <div className="doctors-list-section">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Available Doctors</h3>
                                </div>
                                <div className="doctors-grid">
                                    {filteredDoctors.slice(0, 6).map(doctor => (
                                        <div key={doctor.id} className="doctor-card">
                                            <div className="doctor-avatar">
                                                Dr. {doctor.user.firstName.charAt(0)}{doctor.user.lastName.charAt(0)}
                                            </div>
                                            <div className="doctor-info">
                                                <h4>Dr. {doctor.user.firstName} {doctor.user.lastName}</h4>
                                                <p className="specialization">{doctor.specialization}</p>
                                                <p className="experience">{doctor.experience} years experience</p>
                                                <p className="fee">${doctor.consultationFee} consultation</p>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => setFormData(prev => ({ ...prev, doctorId: doctor.id.toString() }))}
                                                >
                                                    Select Doctor
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;