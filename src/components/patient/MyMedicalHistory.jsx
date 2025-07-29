import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate, formatDateOnly } from '../../utils/helpers';
import Loading from '../common/Loading';

const MyMedicalHistory = () => {
    const { user } = useAuth();
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [filteredHistory, setFilteredHistory] = useState([]);

    useEffect(() => {
        if (user?.userId) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [medicalHistory, searchTerm, filterDoctor, dateFilter]);

    const fetchData = async () => {
        try {
            // Get patient info
            const patients = await patientService.getAllPatients();
            const currentPatient = patients.find(p => p.user.id === user.userId);

            if (currentPatient) {
                setPatientInfo(currentPatient);

                // Get medical history
                const historyData = await patientService.getPatientMedicalHistory(currentPatient.id);
                setMedicalHistory(historyData.sort((a, b) =>
                    new Date(b.visitDate) - new Date(a.visitDate)
                ));
            }
        } catch (error) {
            console.error('Error fetching medical history:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...medicalHistory];

        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.symptoms && record.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (filterDoctor) {
            filtered = filtered.filter(record =>
                record.doctorName.toLowerCase().includes(filterDoctor.toLowerCase())
            );
        }

        if (dateFilter) {
            const filterYear = new Date(dateFilter).getFullYear();
            const filterMonth = new Date(dateFilter).getMonth();

            filtered = filtered.filter(record => {
                const recordDate = new Date(record.visitDate);
                return recordDate.getFullYear() === filterYear &&
                    recordDate.getMonth() === filterMonth;
            });
        }

        setFilteredHistory(filtered);
    };

    const handleViewRecord = (record) => {
        setSelectedRecord(record);
        setShowRecordModal(true);
    };

    const getUniqueYear = () => {
        const years = medicalHistory.map(record =>
            new Date(record.visitDate).getFullYear()
        );
        return [...new Set(years)].sort((a, b) => b - a);
    };

    const getUniqueDoctors = () => {
        const doctors = medicalHistory.map(record => record.doctorName);
        return [...new Set(doctors)].sort();
    };

    const getHealthSummary = () => {
        const totalVisits = medicalHistory.length;
        const uniqueDoctors = new Set(medicalHistory.map(r => r.doctorName)).size;
        const recentVisits = medicalHistory.filter(r => {
            const visitDate = new Date(r.visitDate);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return visitDate >= sixMonthsAgo;
        }).length;

        const commonDiagnoses = medicalHistory
            .filter(r => r.diagnosis && r.diagnosis !== 'N/A')
            .reduce((acc, record) => {
                acc[record.diagnosis] = (acc[record.diagnosis] || 0) + 1;
                return acc;
            }, {});

        const mostCommon = Object.entries(commonDiagnoses)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        return {
            totalVisits,
            uniqueDoctors,
            recentVisits,
            mostCommon
        };
    };

    const healthSummary = getHealthSummary();

    if (loading) return <Loading />;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="My Medical History" />
                <div className="page-content">
                    {/* Health Summary */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Health Summary</h3>
                        </div>
                        <div className="health-summary">
                            <div className="stats-grid">
                                <div className="stat-card doctors">
                                    <div className="stat-content">
                                        <div className="stat-number">{healthSummary.uniqueDoctors}</div>
                                        <div className="stat-label">Doctors Consulted</div>
                                    </div>
                                    <div className="stat-icon">👨‍⚕️</div>
                                </div>
                                <div className="stat-card recent">
                                    <div className="stat-content">
                                        <div className="stat-number">{healthSummary.recentVisits}</div>
                                        <div className="stat-label">Last 6 Months</div>
                                    </div>
                                    <div className="stat-icon">📅</div>
                                </div>
                            </div>

                            {healthSummary.mostCommon.length > 0 && (
                                <div className="common-conditions">
                                    <h4>Most Common Conditions</h4>
                                    <div className="conditions-list">
                                        {healthSummary.mostCommon.map(([diagnosis, count], index) => (
                                            <div key={index} className="condition-item">
                                                <span className="condition-name">{diagnosis}</span>
                                                <span className="condition-count">{count} visits</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Search & Filter Records</h3>
                        </div>
                        <div className="filters-section">
                            <div className="filter-group">
                                <label>Search:</label>
                                <input
                                    type="text"
                                    placeholder="Search by diagnosis, doctor, or symptoms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control filter-control"
                                />
                            </div>
                            <div className="filter-group">
                                <label>Doctor:</label>
                                <select
                                    value={filterDoctor}
                                    onChange={(e) => setFilterDoctor(e.target.value)}
                                    className="form-control filter-control"
                                >
                                    <option value="">All Doctors</option>
                                    {getUniqueDoctors().map(doctor => (
                                        <option key={doctor} value={doctor}>{doctor}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Year:</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="form-control filter-control"
                                >
                                    <option value="">All Years</option>
                                    {getUniqueYear().map(year => (
                                        <option key={year} value={`${year}-01-01`}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterDoctor('');
                                        setDateFilter('');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Medical History Timeline */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Medical History ({filteredHistory.length} records)
                            </h3>
                        </div>

                        {filteredHistory.length > 0 ? (
                            <div className="medical-timeline">
                                {filteredHistory.map((record, index) => (
                                    <div key={record.id} className="timeline-item">
                                        <div className="timeline-marker">
                                            <div className="marker-dot"></div>
                                            {index < filteredHistory.length - 1 && <div className="marker-line"></div>}
                                        </div>

                                        <div className="timeline-content">
                                            <div className="record-card">
                                                <div className="record-header">
                                                    <div className="record-date">
                                                        {formatDate(record.visitDate)}
                                                    </div>
                                                    <div className="record-doctor">
                                                        Dr. {record.doctorName}
                                                    </div>
                                                </div>

                                                <div className="record-body">
                                                    <div className="record-main-info">
                                                        <div className="diagnosis-section">
                                                            <h4>Diagnosis:</h4>
                                                            <p>{record.diagnosis || 'No diagnosis recorded'}</p>
                                                        </div>

                                                        {record.symptoms && (
                                                            <div className="symptoms-section">
                                                                <h4>Symptoms:</h4>
                                                                <p>{record.symptoms}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="record-actions">
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleViewRecord(record)}
                                                        >
                                                            View Full Details
                                                        </button>
                                                    </div>
                                                </div>

                                                {(record.prescription || record.treatment) && (
                                                    <div className="record-footer">
                                                        {record.prescription && (
                                                            <div className="prescription-preview">
                                                                <strong>Prescription:</strong>
                                                                <span>{record.prescription.length > 100 ?
                                                                    record.prescription.substring(0, 100) + '...' :
                                                                    record.prescription
                                                                }</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data">
                                {medicalHistory.length === 0 ? (
                                    <div>
                                        <p>No medical history available yet.</p>
                                        <p>Your medical records will appear here after your appointments.</p>
                                    </div>
                                ) : (
                                    <p>No records match your search criteria.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Patient Profile Summary */}
                    {patientInfo && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">My Profile</h3>
                            </div>
                            <div className="patient-profile-summary">
                                <div className="profile-grid">
                                    <div className="profile-item">
                                        <strong>Patient ID:</strong>
                                        <span>{patientInfo.patientId}</span>
                                    </div>
                                    <div className="profile-item">
                                        <strong>Blood Group:</strong>
                                        <span>{patientInfo.bloodGroup || 'Not specified'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <strong>Date of Birth:</strong>
                                        <span>{formatDateOnly(patientInfo.dateOfBirth)}</span>
                                    </div>
                                    <div className="profile-item">
                                        <strong>Gender:</strong>
                                        <span>{patientInfo.gender || 'Not specified'}</span>
                                    </div>
                                </div>

                                {patientInfo.allergies && (
                                    <div className="allergies-section">
                                        <strong>Allergies:</strong>
                                        <div className="allergies-content">{patientInfo.allergies}</div>
                                    </div>
                                )}

                                {patientInfo.medicalHistory && (
                                    <div className="medical-background-section">
                                        <strong>Medical Background:</strong>
                                        <div className="medical-background-content">{patientInfo.medicalHistory}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Medical Record Details Modal */}
                    {showRecordModal && selectedRecord && (
                        <Modal
                            title={`Medical Record - ${formatDateOnly(selectedRecord.visitDate)}`}
                            onClose={() => setShowRecordModal(false)}
                        >
                            <div className="record-details-modal">
                                <div className="record-header-info">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <strong>Date:</strong> {formatDate(selectedRecord.visitDate)}
                                        </div>
                                        <div className="info-item">
                                            <strong>Doctor:</strong> Dr. {selectedRecord.doctorName}
                                        </div>
                                    </div>
                                </div>

                                <div className="record-sections">
                                    {selectedRecord.symptoms && (
                                        <div className="record-section">
                                            <h4>Reported Symptoms</h4>
                                            <div className="section-content">{selectedRecord.symptoms}</div>
                                        </div>
                                    )}

                                    <div className="record-section">
                                        <h4>Diagnosis</h4>
                                        <div className="section-content">
                                            {selectedRecord.diagnosis || 'No diagnosis recorded'}
                                        </div>
                                    </div>

                                    {selectedRecord.treatment && (
                                        <div className="record-section">
                                            <h4>Treatment Plan</h4>
                                            <div className="section-content">{selectedRecord.treatment}</div>
                                        </div>
                                    )}

                                    {selectedRecord.prescription && (
                                        <div className="record-section prescription-section">
                                            <h4>Prescription</h4>
                                            <div className="prescription-content">
                                                {selectedRecord.prescription}
                                            </div>
                                        </div>
                                    )}

                                    {selectedRecord.testResults && (
                                        <div className="record-section">
                                            <h4>Test Results</h4>
                                            <div className="section-content">{selectedRecord.testResults}</div>
                                        </div>
                                    )}

                                    {selectedRecord.notes && (
                                        <div className="record-section">
                                            <h4>Doctor's Notes</h4>
                                            <div className="section-content">{selectedRecord.notes}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="record-footer-info">
                                    <p className="record-disclaimer">
                                        <strong>Note:</strong> This information is for your personal records.
                                        Always consult with your healthcare provider for medical advice.
                                    </p>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyMedicalHistory;