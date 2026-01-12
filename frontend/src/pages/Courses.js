import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    duration: { years: 4, semesters: 8 },
    department: '',
    feeStructure: {
      totalFees: 0,
      admissionFee: 5000,
      cautionDeposit: 10000,
      yearlyFee: 0,
      examFeePerSemester: 2000
    },
    seats: { total: 0, filled: 0 },
    description: '',
    eligibility: '',
    facilities: [],
    isActive: true
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAll();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseService.update(editingCourse._id, formData);
      } else {
        await courseService.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.delete(id);
        fetchCourses();
      } catch (err) {
        alert('Error deleting course');
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      duration: course.duration,
      department: course.department,
      feeStructure: course.feeStructure,
      seats: course.seats,
      description: course.description || '',
      eligibility: course.eligibility || '',
      facilities: course.facilities || [],
      isActive: course.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseCode: '',
      duration: { years: 4, semesters: 8 },
      department: '',
      feeStructure: {
        totalFees: 0,
        admissionFee: 5000,
        cautionDeposit: 10000,
        yearlyFee: 0,
        examFeePerSemester: 2000
      },
      seats: { total: 0, filled: 0 },
      description: '',
      eligibility: '',
      facilities: [],
      isActive: true
    });
    setEditingCourse(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: parseFloat(value) || value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const filteredCourses = courses.filter(course =>
    course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Courses</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Course
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search courses..."
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p>No courses found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredCourses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-header">
                  <div>
                    <div className="course-name">{course.courseName}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{course.department}</div>
                  </div>
                  <span className="course-code">{course.courseCode}</span>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Duration:</span>
                    <strong>{course.duration.years} Years ({course.duration.semesters} Sem)</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Total Fees:</span>
                    <strong style={{ color: '#667eea' }}>₹{course.feeStructure.totalFees.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Per Year:</span>
                    <strong>₹{course.feeStructure.yearlyFee.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="seats-indicator">
                  <div className="seat-box">
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>{course.seats.total}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Seats</div>
                  </div>
                  <div className="seat-box filled">
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>{course.seats.filled}</div>
                    <div style={{ fontSize: '12px' }}>Filled</div>
                  </div>
                  <div className="seat-box available">
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>{course.seats.available}</div>
                    <div style={{ fontSize: '12px' }}>Available</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(course)}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(course._id)}
                    style={{ flex: 1 }}
                  >
                    Delete
                  </button>
                </div>

                {!course.isActive && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '5px', 
                    background: '#ffebee', 
                    color: '#d32f2f',
                    textAlign: 'center',
                    borderRadius: '5px',
                    fontSize: '12px'
                  }}>
                    Inactive
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <h4 style={{ marginBottom: '15px', color: '#667eea' }}>Basic Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Name *</label>
                  <input
                    type="text"
                    name="courseName"
                    className="form-input"
                    value={formData.courseName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input
                    type="text"
                    name="courseCode"
                    className="form-input"
                    value={formData.courseCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Seats *</label>
                  <input
                    type="number"
                    name="seats.total"
                    className="form-input"
                    value={formData.seats.total}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Duration</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Years *</label>
                  <input
                    type="number"
                    name="duration.years"
                    className="form-input"
                    value={formData.duration.years}
                    onChange={handleChange}
                    required
                    min="1"
                    max="6"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semesters *</label>
                  <input
                    type="number"
                    name="duration.semesters"
                    className="form-input"
                    value={formData.duration.semesters}
                    onChange={handleChange}
                    required
                    min="2"
                    max="12"
                  />
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Fee Structure</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Course Fees *</label>
                  <input
                    type="number"
                    name="feeStructure.totalFees"
                    className="form-input"
                    value={formData.feeStructure.totalFees}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Yearly Fee *</label>
                  <input
                    type="number"
                    name="feeStructure.yearlyFee"
                    className="form-input"
                    value={formData.feeStructure.yearlyFee}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Admission Fee</label>
                  <input
                    type="number"
                    name="feeStructure.admissionFee"
                    className="form-input"
                    value={formData.feeStructure.admissionFee}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Caution Deposit</label>
                  <input
                    type="number"
                    name="feeStructure.cautionDeposit"
                    className="form-input"
                    value={formData.feeStructure.cautionDeposit}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Exam Fee (Per Semester)</label>
                <input
                  type="number"
                  name="feeStructure.examFeePerSemester"
                  className="form-input"
                  value={formData.feeStructure.examFeePerSemester}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Additional Details</h4>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Eligibility</label>
                <input
                  type="text"
                  name="eligibility"
                  className="form-input"
                  value={formData.eligibility}
                  onChange={handleChange}
                  placeholder="e.g., 10+2 with 60% marks"
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Course is Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Update' : 'Create'} Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;