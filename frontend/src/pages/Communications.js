import React, { useState, useEffect } from 'react';
import { communicationService } from '../services/communicationService';
import { enquiryService } from '../services/enquiryService';
import { studentService } from '../services/studentService';

function Communications() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [enquiries, setEnquiries] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    enquiryId: '',
    studentId: '',
    communicationType: 'Phone Call',
    subject: '',
    notes: '',
    followUpRequired: false,
    followUpDate: '',
  });

  useEffect(() => {
    fetchCommunications();
    fetchEnquiriesAndStudents();
  }, [typeFilter]);

  const fetchCommunications = async () => {
    try {
      const params = {};
      if (typeFilter) params.communicationType = typeFilter;
      
      const response = await communicationService.getAll(params);
      if (response.success) {
        setCommunications(response.data);
      }
    } catch (err) {
      console.error('Error fetching communications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiriesAndStudents = async () => {
    try {
      const [enqRes, stuRes] = await Promise.all([
        enquiryService.getAll(),
        studentService.getAll()
      ]);
      if (enqRes.success) setEnquiries(enqRes.data);
      if (stuRes.success) setStudents(stuRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await communicationService.create(formData);
      setShowModal(false);
      resetForm();
      fetchCommunications();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating communication');
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await communicationService.markComplete(id);
      fetchCommunications();
    } catch (err) {
      alert('Error marking as complete');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this communication?')) {
      try {
        await communicationService.delete(id);
        fetchCommunications();
      } catch (err) {
        alert('Error deleting communication');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      enquiryId: '',
      studentId: '',
      communicationType: 'Phone Call',
      subject: '',
      notes: '',
      followUpRequired: false,
      followUpDate: '',
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      'Phone Call': 'badge-contacted',
      'Email': 'badge-new',
      'In-person Meeting': 'badge-admitted',
      'Walk-in Visit': 'badge-new',
      'SMS': 'badge-contacted',
      'WhatsApp': 'badge-admitted',
    };
    return `badge ${colors[type] || 'badge-new'}`;
  };

  const filteredCommunications = communications.filter(comm => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      comm.subject?.toLowerCase().includes(search) ||
      comm.notes?.toLowerCase().includes(search) ||
      comm.recordedByName?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return <div className="loading">Loading communications...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Communication Logs</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Communication
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by subject, notes, or recorded by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Types</option>
            <option value="Phone Call">Phone Call</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="In-person Meeting">In-person Meeting</option>
            <option value="Walk-in Visit">Walk-in Visit</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Communications List */}
      <div className="card">
        {filteredCommunications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>No communications found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Related To</th>
                  <th>Follow-up</th>
                  <th>Recorded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommunications.map((comm) => (
                  <tr key={comm._id}>
                    <td>{new Date(comm.communicationDate).toLocaleDateString()}</td>
                    <td>
                      <span className={getTypeColor(comm.communicationType)}>
                        {comm.communicationType}
                      </span>
                    </td>
                    <td>
                      <strong>{comm.subject}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{comm.notes?.substring(0, 50)}...</small>
                    </td>
                    <td>
                      {comm.enquiryId && (
                        <div>
                          <small>Enquiry:</small> {comm.enquiryId.studentName}
                        </div>
                      )}
                      {comm.studentId && (
                        <div>
                          <small>Student:</small> {comm.studentId.fullName} ({comm.studentId.studentId})
                        </div>
                      )}
                    </td>
                    <td>
                      {comm.followUpRequired ? (
                        <div>
                          {comm.followUpCompleted ? (
                            <span className="badge badge-admitted">✓ Completed</span>
                          ) : (
                            <>
                              <div>{new Date(comm.followUpDate).toLocaleDateString()}</div>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleMarkComplete(comm._id)}
                                style={{ marginTop: '5px' }}
                              >
                                Mark Done
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                    <td>{comm.recordedByName}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(comm._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Communication Log</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Related To *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    name="enquiryId"
                    className="form-select"
                    value={formData.enquiryId}
                    onChange={handleChange}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Enquiry (Optional)</option>
                    {enquiries.map((enq) => (
                      <option key={enq._id} value={enq._id}>
                        {enq.studentName} - {enq.courseApplied}
                      </option>
                    ))}
                  </select>

                  <select
                    name="studentId"
                    className="form-select"
                    value={formData.studentId}
                    onChange={handleChange}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Student (Optional)</option>
                    {students.map((stu) => (
                      <option key={stu._id} value={stu._id}>
                        {stu.fullName} ({stu.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <small style={{ color: '#666' }}>Select either enquiry or student</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Communication Type *</label>
                  <select
                    name="communicationType"
                    className="form-select"
                    value={formData.communicationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="In-person Meeting">In-person Meeting</option>
                    <option value="Walk-in Visit">Walk-in Visit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Follow-up call about admission"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes *</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  required
                  placeholder="What was discussed..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    checked={formData.followUpRequired}
                    onChange={handleChange}
                  />
                  <span>Follow-up Required</span>
                </label>
              </div>

              {formData.followUpRequired && (
                <div className="form-group">
                  <label className="form-label">Follow-up Date *</label>
                  <input
                    type="date"
                    name="followUpDate"
                    className="form-input"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    required={formData.followUpRequired}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Communication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Communications;