import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../hooks/useStudents';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { adminAPI } from '../../services/api';

const Students = () => {
  const [filters, setFilters] = useState({
    status: '',
    batch: '',
    batchId: '',
    search: '',
    approvalStatus: 'pending',
  });
  const { students, loading, error, refetch } = useStudents(filters);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ term: '', batchId: '' });
  const [confirmState, setConfirmState] = useState({ open: false, action: null, student: null });
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const response = await adminAPI.getBatches({ limit: 100 });
      const payload = response?.data?.data;
      const items = Array.isArray(payload) ? payload : (payload?.data || []);
      setBatches(items);
    } catch (err) {
      addToast('error', err.response?.data?.message || err.response?.data?.error || 'Failed to load batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await adminAPI.updateStudentStatus(studentId, newStatus);
      addToast('success', `Student ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      refetch();
    } catch (error) {
      addToast('error', error.response?.data?.message || error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleApprove = async (studentId) => {
    try {
      await adminAPI.approveStudent(studentId);
      addToast('success', 'Student approved successfully');
      refetch();
    } catch (error) {
      addToast('error', error.response?.data?.message || error.response?.data?.error || 'Failed to approve student');
    }
  };

  const handleReject = async (studentId) => {
    try {
      await adminAPI.rejectStudent(studentId);
      addToast('success', 'Student rejected successfully');
      refetch();
    } catch (error) {
      addToast('error', error.response?.data?.message || error.response?.data?.error || 'Failed to reject student');
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setEditValues({
      term: student.batch || '',
      batchId: student.batchId?._id || student.batchId || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ term: '', batchId: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await adminAPI.updateStudentAcademic(editingId, {
        batch: editValues.term,
        batchId: editValues.batchId,
      });
      addToast('success', 'Academic info updated successfully');
      cancelEdit();
      refetch();
    } catch (error) {
      addToast('error', error.response?.data?.message || error.response?.data?.error || 'Failed to update academic info');
    }
  };

  const openConfirm = (action, student) => {
    setConfirmState({ open: true, action, student });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, action: null, student: null });
  };

  const handleConfirmAction = async () => {
    const { action, student } = confirmState;
    if (!student) return;

    if (action === 'approve') {
      await handleApprove(student._id);
    } else if (action === 'reject') {
      await handleReject(student._id);
    } else if (action === 'block') {
      await handleStatusChange(student._id, 'blocked');
    } else if (action === 'unblock') {
      await handleStatusChange(student._id, 'active');
    } else if (action === 'save') {
      await saveEdit();
    }

    closeConfirm();
  };

  const approvalTabs = [
    { label: 'Pending Approval', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const termOptions = [
    { value: 'longTerm', label: 'Long Term' },
    { value: 'shortTerm', label: 'Short Term' },
  ];

  const batchOptions = batches.map((batch) => ({
    value: batch._id,
    label: batch.name,
  }));

  const columns = useMemo(() => [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Term',
      accessor: 'batch',
      render: (student) => {
        const isEditing = editingId === student._id;
        return (
          <select
            className="input-field text-sm min-w-[140px]"
            disabled={!isEditing}
            value={isEditing ? editValues.term : (student.batch || '')}
            onChange={(e) => setEditValues((prev) => ({ ...prev, term: e.target.value }))}
          >
            <option value="">Select term</option>
            {termOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      header: 'Batch',
      accessor: 'batchId',
      render: (student) => {
        const isEditing = editingId === student._id;
        const currentBatchId = student.batchId?._id || student.batchId || '';
        return (
          <select
            className="input-field text-sm min-w-[160px]"
            disabled={!isEditing}
            value={isEditing ? editValues.batchId : currentBatchId}
            onChange={(e) => setEditValues((prev) => ({ ...prev, batchId: e.target.value }))}
          >
            <option value="">Select batch</option>
            {batchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      header: 'Approval Status',
      accessor: 'approvalStatus',
      render: (student) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              student.approvalStatus === 'approved'
                ? 'success'
                : student.approvalStatus === 'rejected'
                  ? 'danger'
                  : 'warning'
            }
          >
            {student.approvalStatus || 'pending'}
          </Badge>
          {(student.approvalStatus === 'pending' || student.approvalStatus === 'rejected') && (
            <Badge variant="danger">Login Disabled</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (student) => {
        const isEditing = editingId === student._id;
        const isApproved = student.approvalStatus === 'approved';
        const isPending = student.approvalStatus === 'pending';
        const isRejected = student.approvalStatus === 'rejected';

        return (
          <div className="flex flex-wrap items-center gap-2">
            {(isApproved || isRejected) && (
              <Link to={`/admin/students/${student._id}`}>
                <Button variant="outline" className="text-xs py-1 px-2">
                  View
                </Button>
              </Link>
            )}

            {isPending && (
              <>
                <Button
                  variant="primary"
                  className="text-xs py-1 px-2"
                  onClick={() => openConfirm('approve', student)}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  className="text-xs py-1 px-2"
                  onClick={() => openConfirm('reject', student)}
                >
                  Reject
                </Button>
              </>
            )}

            {isApproved && !isEditing && (
              <>
                <Button
                  variant="secondary"
                  className="text-xs py-1 px-2"
                  onClick={() => startEdit(student)}
                >
                  Edit
                </Button>
                <Button
                  variant={student.status === 'active' ? 'danger' : 'success'}
                  className="text-xs py-1 px-2"
                  onClick={() => openConfirm(student.status === 'active' ? 'block' : 'unblock', student)}
                >
                  {student.status === 'active' ? 'Block' : 'Unblock'}
                </Button>
              </>
            )}

            {isApproved && isEditing && (
              <>
                <Button
                  variant="primary"
                  className="text-xs py-1 px-2"
                  onClick={() => openConfirm('save', student)}
                  disabled={!editValues.term || !editValues.batchId}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="text-xs py-1 px-2"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ], [batchOptions, editValues, editingId, termOptions]);

  return (
    <div className="space-y-6">
      <Card>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-600 mt-1">Manage approvals, terms, and batch assignments.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {approvalTabs.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                filters.approvalStatus === tab.value
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setFilters((prev) => ({ ...prev, approvalStatus: tab.value }))}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="input-field"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            className="input-field"
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
          >
            <option value="">All Terms</option>
            <option value="longTerm">Long Term</option>
            <option value="shortTerm">Short Term</option>
          </select>
          <select
            className="input-field"
            value={filters.batchId}
            onChange={(e) => setFilters({ ...filters, batchId: e.target.value })}
            disabled={loadingBatches}
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => setFilters({ status: '', batch: '', batchId: '', search: '', approvalStatus: 'pending' })}
          >
            Clear Filters
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Table
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage="No students found"
        />
      </Card>

      <Modal
        isOpen={confirmState.open}
        onClose={closeConfirm}
        title="Confirm Action"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmAction}>
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-gray-700">
            Are you sure you want to{' '}
            <span className="font-semibold">{confirmState.action}</span>{' '}
            {confirmState.student?.name ? `“${confirmState.student.name}”` : 'this student'}?
          </p>
          {confirmState.action === 'save' && (
            <p className="text-sm text-gray-500">
              This will update the student’s term and batch assignment.
            </p>
          )}
        </div>
      </Modal>

      {/* Toasts */}
      <div className="fixed top-6 right-6 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Students;

