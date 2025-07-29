import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { medicalRecordService } from '../../services/medicalRecordService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { formatDate, formatDateOnly } from '../../utils/helpers';
import Loading from '../common/Loading';

const PatientRecords = () => {
    const { user } = useAuth();
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPatient, setFilterPatient] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);

    useEffect(() => {
        if (user?.userId) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [medicalRecords, searchTerm, filterPatient]);

    const fetchData = async () => {
        try {
            // Get doctor info
            const doctors = await doctorService.getAllDoctors();
            const currentDoctor = doctors.find(d => d.user.id === user.userId);

            if (currentDoctor) {
                setDoctorInfo(currentDoctor);

                // Get medical records for this doctor
                const recordsData = await medicalRecordService.getMedicalRecordsByDoctor(currentDoctor.id);
                setMedicalRecords(recordsData.sort((a, b) =>
                    new Date(b.visitDate) - new Date(a.visitDate)
                ));

                // Get unique patients from records
                const uniquePatientIds = [...new Set(recordsData.map(record => record.patientId))];
                const allPatients = await patientService.getAllPatients();
                const relevantPatients = allPatients.filter(patient =>
                    uniquePatientIds.includes(patient.id)
                );
                setPatients(relevantPatients);
            }
        } catch (error) {
            console.error('Error fetching patient records:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...medicalRecords];

        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterPatient) {
            filtered = filtered.filter(record =>
                record.patientId.toString() === filterPatient
            );
        }

        setFilteredRecords(filtered);
    };

    const handleViewRecord = (record) => {
        setSelectedRecord(record);
        setShowRecordModal(true);
    };

    const getPatientStats = () => {
        const totalPatients = new Set(medicalRecords.map(r => r.patientId)).size;
        const totalRecords = medicalRecords.length;
        const thisMonth = medicalRecords.filter(r => {
            const recordDate = new Date(r.visitDate);
            const now = new Date();
            return recordDate.getMonth() === now.getMonth() &&
                recordDate.getFullYear() === now.getFullYear();
        }).length;

        return { totalPatients, totalRecords, thisMonth };
    };

    const stats = getPatientStats();

    if (loading) return <Loading />;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Patient Records" />
                <div className="page-content">
                    {/* Search and Filters */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Search & Filter</h3>
                        </div>
                        <div className="filters-section">
                            <div className="filter-group">
                                <label>Search:</label>
                                <input
                                    type="text"
                                    placeholder="Search by patient name or diagnosis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control filter-control"
                                />
                            </div>
                            <div className="filter-group">
                                <label>Patient:</label>
                                <select
                                    value={filterPatient}
                                    onChange={(e) => setFilterPatient(e.target.value)}
                                    className="form-control filter-control"
                                >
                                    <option value="">All Patients</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.user.firstName} {patient.user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterPatient('');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="stats-grid">
                        <div className="stat-card patients">
                            <div className="stat-content">
                                <div className="stat-number">{stats.totalPatients}</div>
                                <div className="stat-label">Total Patients</div>
                            </div>
                            <div className="stat-icon">👥</div>
                        </div>
                        <div className="stat-card records">
                            <div className="stat-content">
                                <div className="stat-number">{stats.totalRecords}</div>
                                <div className="stat-label">Total Records</div>
                            </div>
                            <div className="stat-icon">📋</div>
                        </div>
                        <div className="stat-card monthly">
                            <div className="stat-content">
                                <div className="stat-number">{stats.thisMonth}</div>
                                <div className="stat-label">This Month</div>
                            </div>
                            <div className="stat-icon">📅</div>
                        </div>
                    </div>

                    {/* Medical Records Table */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Medical Records ({filteredRecords.length})
                            </h3>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Diagnosis</th>
                                        <th>Treatment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id}>
                                            <td>{formatDateOnly(record.visitDate)}</td>
                                            <td>
                                                <div className="patient-cell">
                                                    <div className="patient-name">{record.patientName}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="diagnosis-cell">
                                                    {record.diagnosis || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="treatment-cell">
                                                    {record.treatment ?
                                                        (record.treatment.length > 50 ?
                                                            record.treatment.substring(0, 50) + '...' :
                                                            record.treatment
                                                        ) : 'N/A'
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleViewRecord(record)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRecords.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="no-data">
                                                {medicalRecords.length === 0 ?
                                                    'No medical records found' :
                                                    'No records match your search criteria'
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Medical Record Details Modal */}
                    {showRecordModal && selectedRecord && (
                        <Modal
                            title={`Medical Record - ${selectedRecord.patientName}`}
                            onClose={() => setShowRecordModal(false)}
                        >
                            <div className="record-details">
                                <div className="record-header-info">
                                    <div className="info-row">
                                        <strong>Date:</strong> {formatDate(selectedRecord.visitDate)}
                                    </div>
                                    <div className="info-row">
                                        <strong>Patient:</strong> {selectedRecord.patientName}
                                    </div>
                                </div>

                                <div className="record-sections">
                                    <div className="record-section">
                                        <h4>Symptoms</h4>
                                        <p>{selectedRecord.symptoms || 'No symptoms recorded'}</p>
                                    </div>

                                    <div className="record-section">
                                        <h4>Diagnosis</h4>
                                        <p>{selectedRecord.diagnosis || 'No diagnosis recorded'}</p>
                                    </div>

                                    <div className="record-section">
                                        <h4>Treatment</h4>
                                        <p>{selectedRecord.treatment || 'No treatment recorded'}</p>
                                    </div>

                                    <div className="record-section">
                                        <h4>Prescription</h4>
                                        <p>{selectedRecord.prescription || 'No prescription'}</p>
                                    </div>

                                    {selectedRecord.testResults && (
                                        <div className="record-section">
                                            <h4>Test Results</h4>
                                            <p>{selectedRecord.testResults}</p>
                                        </div>
                                    )}

                                    {selectedRecord.notes && (
                                        <div className="record-section">
                                            <h4>Additional Notes</h4>
                                            <p>{selectedRecord.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientRecords;