import React, { useState, useEffect } from 'react';
import { feeService } from '../services/feeService';
import { studentService } from '../services/studentService';

function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [totals, setTotals] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: 'Yearly Fee',
    academicYear: '2024-25',
    semester: 1,
    totalAmount: 0,
    paidAmount: 0,
    paymentMode: 'Cash',
    transactionId: '',
    dueDate: '',
    paidBy: '',
    remarks: ''
  });

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, [statusFilter]);

  const fetchFees = async () => {
    try {
      const params = {};
      if (statusFilter) params.paymentStatus = statusFilter;
      
      const response = await feeService.getAll(params);
      if (response.success) {
        setFees(response.data);
        setTotals(response.totals);
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      if (response.success) {
        setStudents(response.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeService.create(formData);
      setShowModal(false);
      resetForm();
      fetchFees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating fee record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await feeService.delete(id);
        fetchFees();
      } catch (err) {
        alert('Error deleting fee');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      feeType: 'Yearly Fee',
      academicYear: '2024-25',
      semester: 1,
      totalAmount: 0,
      paidAmount: 0,
      paymentMode: 'Cash',
      transactionId: '',
      dueDate: '',
      paidBy: '',
      remarks: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'badge-admitted',
      'Partial': 'badge-contacted',
      'Pending': 'badge-new',
      'Overdue': 'badge-rejected',
    };
    return `badge ${colors[status] || 'badge-new'}`;
  };

  if (loading) {
    return <div className="loading">Loading fee records...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Fee Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Payment
        </button>
      </div>

      {/* Fee Summary */}
      {totals && (
        <div className="fee-summary">
          <h3>Fee Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Expected</div>
              <div className="fee-amount">₹{(totals.totalAmount / 100000).toFixed(2)}L</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Collected</div>
              <div className="fee-amount">₹{(totals.totalPaid / 100000).toFixed(2)}L</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Pending</div>
              <div className="fee-amount">₹{(totals.totalPending / 100000).toFixed(2)}L</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Fee Records Table */}
      <div className="card">
        {fees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>No fee records found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Student</th>
                  <th>Fee Type</th>
                  <th>Academic Year</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee._id}>
                    <td><strong>{fee.receiptNumber}</strong></td>
                    <td>
                      {fee.studentName}
                      <br />
                      <small style={{ color: '#666' }}>{fee.studentCode}</small>
                    </td>
                    <td>{fee.feeType}</td>
                    <td>{fee.academicYear}</td>
                    <td>₹{fee.totalAmount.toLocaleString()}</td>
                    <td style={{ color: '#388e3c', fontWeight: '600' }}>
                      ₹{fee.paidAmount.toLocaleString()}
                    </td>
                    <td style={{ color: '#d32f2f', fontWeight: '600' }}>
                      ₹{fee.pendingAmount.toLocaleString()}
                    </td>
                    <td>
                      <span className={getStatusColor(fee.paymentStatus)}>
                        {fee.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(fee.paymentDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(fee._id)}
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
              <h3>Add Fee Payment</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Student *</label>
                <select
                  name="studentId"
                  className="form-select"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.fullName} ({student.studentId}) - {student.course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fee Type *</label>
                  <select
                    name="feeType"
                    className="form-select"
                    value={formData.feeType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Yearly Fee">Yearly Fee</option>
                    <option value="Semester Fee">Semester Fee</option>
                    <option value="Exam Fee">Exam Fee</option>
                    <option value="Caution Deposit">Caution Deposit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Year *</label>
                  <input
                    type="text"
                    name="academicYear"
                    className="form-input"
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 2024-25"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Amount *</label>
                  <input
                    type="number"
                    name="totalAmount"
                    className="form-input"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Paid Amount *</label>
                  <input
                    type="number"
                    name="paidAmount"
                    className="form-input"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select
                    name="paymentMode"
                    className="form-select"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                    <option value="DD">DD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction ID</label>
                  <input
                    type="text"
                    name="transactionId"
                    className="form-input"
                    value={formData.transactionId}
                    onChange={handleChange}
                    placeholder="For online payments"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Paid By</label>
                  <input
                    type="text"
                    name="paidBy"
                    className="form-input"
                    value={formData.paidBy}
                    onChange={handleChange}
                    placeholder="e.g., Father, Self"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  name="remarks"
                  className="form-textarea"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>

              <div style={{ 
                background: '#e8f5e9', 
                padding: '15px', 
                borderRadius: '5px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Receipt Number (Auto-generated):
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#388e3c' }}>
                  Will be generated after saving
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fees;