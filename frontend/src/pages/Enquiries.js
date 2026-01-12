import React, { useState, useEffect } from 'react';
import { enquiryService } from '../services/enquiryService';
import { studentService } from '../services/studentService';
import { courseService } from '../services/courseService';

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [convertingEnquiry, setConvertingEnquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    courseApplied: '',
    source: 'Walk-in',
    address: '',
    remarks: '',
  });

  const [studentFormData, setStudentFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    course: '',
    year: 1,
    semester: 1,
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'Father',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    bloodGroup: '',
    remarks: '',
    enquiryId: ''
  });

  const staticCourses = [
    'B.Tech Computer Science',
    'B.Tech Mechanical',
    'B.Tech Civil',
    'B.Tech Electrical',
    'MBA',
    'MCA',
    'BBA',
    'BCA',
    'B.Com',
    'B.Sc',
    'M.Sc',
  ];

  useEffect(() => {
    fetchEnquiries();
    fetchCourses();
  }, [statusFilter]);

  const fetchEnquiries = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await enquiryService.getAll(params);
      if (response.success) {
        setEnquiries(response.data);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseService.getActive();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Use static courses as fallback
    }
  };

  // NEW FUNCTION: Handle conversion to student
  const handleConvertToStudent = async (enquiry) => {
    try {
      // Fetch pre-filled data
      const response = await enquiryService.getForConversion(enquiry._id);
      
      if (response.success) {
        setConvertingEnquiry(enquiry);
        setStudentFormData({
          ...studentFormData,
          fullName: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone,
          course: response.data.course,
          address: response.data.address,
          remarks: response.data.remarks,
          enquiryId: response.data.enquiryId
        });
        setShowConversionModal(true);
      }
    } catch (err) {
      alert('Error loading conversion data');
      console.error(err);
    }
  };

  // NEW FUNCTION: Handle student form submission
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await studentService.create(studentFormData);
      
      if (response.success) {
        alert(
          `✅ Student Created Successfully!\n\n` +
          `Student ID: ${response.data.studentId}\n` +
          `Name: ${response.data.fullName}\n\n` +
          `Automated Actions:\n` +
          `${response.automation?.courseSeatsUpdated ? '✅ Course seats updated\n' : ''}` +
          `${response.automation?.enquiryStatusUpdated ? '✅ Enquiry marked as Admitted\n' : ''}` +
          `${response.automation?.communicationLogCreated ? '✅ Communication log created\n' : ''}`
        );
        
        setShowConversionModal(false);
        resetStudentForm();
        fetchEnquiries(); // Refresh to show updated status
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEnquiry) {
        await enquiryService.update(editingEnquiry._id, formData);
      } else {
        await enquiryService.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchEnquiries();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving enquiry');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await enquiryService.updateStatus(id, newStatus);
      fetchEnquiries();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await enquiryService.delete(id);
        fetchEnquiries();
      } catch (err) {
        alert('Error deleting enquiry');
      }
    }
  };

  const handleEdit = (enquiry) => {
    setEditingEnquiry(enquiry);
    setFormData({
      studentName: enquiry.studentName,
      email: enquiry.email,
      phone: enquiry.phone,
      courseApplied: enquiry.courseApplied,
      source: enquiry.source,
      address: enquiry.address || '',
      remarks: enquiry.remarks || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      email: '',
      phone: '',
      courseApplied: '',
      source: 'Walk-in',
      address: '',
      remarks: '',
    });
    setEditingEnquiry(null);
  };

  const resetStudentForm = () => {
    setStudentFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'Male',
      course: '',
      year: 1,
      semester: 1,
      guardianName: '',
      guardianPhone: '',
      guardianRelation: 'Father',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      bloodGroup: '',
      remarks: '',
      enquiryId: ''
    });
    setConvertingEnquiry(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStudentFormData({
        ...studentFormData,
        [parent]: {
          ...studentFormData[parent],
          [child]: value
        }
      });
    } else {
      setStudentFormData({ ...studentFormData, [name]: value });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      New: 'badge-new',
      Contacted: 'badge-contacted',
      Admitted: 'badge-admitted',
      Rejected: 'badge-rejected',
    };
    return `badge ${badges[status] || ''}`;
  };

  const filteredEnquiries = enquiries.filter(enq =>
    enq.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.phone?.includes(searchTerm)
  );

  if (loading) {
    return <div className="loading">Loading enquiries...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Enquiries</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Enquiry
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Admitted">Admitted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="card">
        {filteredEnquiries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No enquiries found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id}>
                    <td>{enquiry.studentName}</td>
                    <td>{enquiry.email}</td>
                    <td>{enquiry.phone}</td>
                    <td>{enquiry.courseApplied}</td>
                    <td>
                      <select
                        className={getStatusBadge(enquiry.status)}
                        value={enquiry.status}
                        onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Admitted">Admitted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>{new Date(enquiry.enquiryDate || enquiry.createdAt).toLocaleDateString()}</td>
                    <td>
                      {enquiry.status !== 'Admitted' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleConvertToStudent(enquiry)}
                          style={{ marginRight: '5px' }}
                          title="Convert to Student"
                        >
                          👨‍🎓 Admit
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(enquiry)}
                        style={{ marginRight: '5px' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(enquiry._id)}
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

      {/* Standard Enquiry Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Student Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    className="form-input"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select
                    name="source"
                    className="form-select"
                    value={formData.source}
                    onChange={handleChange}
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Applied *</label>
                <select
                  name="courseApplied"
                  className="form-select"
                  value={formData.courseApplied}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Course</option>
                  {(courses.length > 0 ? courses : staticCourses).map((course) => (
                    <option key={course._id || course} value={course.courseName || course}>
                      {course.courseName || course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  name="remarks"
                  className="form-textarea"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEnquiry ? 'Update' : 'Create'} Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Conversion Modal - NEW! */}
      {showConversionModal && (
        <div className="modal-overlay" onClick={() => setShowConversionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>🎓 Convert to Student: {convertingEnquiry?.studentName}</h3>
              <button className="modal-close" onClick={() => setShowConversionModal(false)}>
                ×
              </button>
            </div>

            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <strong>✨ Pre-filled from Enquiry:</strong> Name, Email, Phone, Course
              <br />
              <strong>📝 Please fill:</strong> Date of Birth, Gender, Guardian Info
            </div>

            <form onSubmit={handleStudentSubmit}>
              <h4 style={{ marginBottom: '15px', color: '#667eea' }}>Personal Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name * (Pre-filled)</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    value={studentFormData.fullName}
                    onChange={handleStudentChange}
                    required
                    style={{ background: '#f0f8ff' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email * (Pre-filled)</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={studentFormData.email}
                    onChange={handleStudentChange}
                    required
                    style={{ background: '#f0f8ff' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone * (Pre-filled)</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={studentFormData.phone}
                    onChange={handleStudentChange}
                    required
                    pattern="[0-9]{10}"
                    style={{ background: '#f0f8ff' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-input"
                    value={studentFormData.dateOfBirth}
                    onChange={handleStudentChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={studentFormData.gender}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    className="form-select"
                    value={studentFormData.bloodGroup}
                    onChange={handleStudentChange}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Academic Information</h4>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course * (Pre-filled)</label>
                  <input
                    type="text"
                    name="course"
                    className="form-input"
                    value={studentFormData.course}
                    readOnly
                    style={{ background: '#f0f8ff' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <select
                    name="year"
                    className="form-select"
                    value={studentFormData.year}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Semester *</label>
                <select
                  name="semester"
                  className="form-select"
                  value={studentFormData.semester}
                  onChange={handleStudentChange}
                  required
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Guardian Information</h4>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    className="form-input"
                    value={studentFormData.guardianName}
                    onChange={handleStudentChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guardian Phone</label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    className="form-input"
                    value={studentFormData.guardianPhone}
                    onChange={handleStudentChange}
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Guardian Relation</label>
                <select
                  name="guardianRelation"
                  className="form-select"
                  value={studentFormData.guardianRelation}
                  onChange={handleStudentChange}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConversionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  🎓 Admit Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Enquiries;