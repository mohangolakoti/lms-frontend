import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Table from '../../components/Table';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getInstructors();
      if (response.data.success) {
        setInstructors(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  };

    const handleOpenModal = () => {
      setFormData({ name: '', email: '', mobile: '' });
      setFormError('');
      setShowModal(true);
    };

    const handleCloseModal = () => {
      setShowModal(false);
      setFormData({ name: '', email: '', mobile: '' });
      setFormError('');
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError('');

      if (!formData.name.trim()) {
        setFormError('Name is required');
        return;
      }

      if (!formData.email.trim()) {
        setFormError('Email is required');
        return;
      }

      try {
        setSubmitting(true);
        const response = await adminAPI.createInstructor(formData);

        if (response.data.success) {
          addToast('success', 'Instructor created successfully. Credentials sent to email.');
          handleCloseModal();
          fetchInstructors();
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create instructor';
        setFormError(errorMsg);
        addToast('error', errorMsg);
      } finally {
        setSubmitting(false);
      }
    };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Mobile',
      accessor: 'mobile',
      render: (instructor) => instructor.mobile || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (instructor) => (
        <Badge variant={instructor.status === 'active' ? 'success' : 'danger'}>
          {instructor.status}
        </Badge>
      ),
    },
    {
      header: 'Registered',
      accessor: 'createdAt',
      render: (instructor) => new Date(instructor.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
          <Button onClick={handleOpenModal}>Register Instructor</Button>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={instructors}
          loading={loading}
          emptyMessage="No instructors found"
        />
      </Card>

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title="Register Instructor"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {formError}
              </div>
            )}
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter instructor name"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter instructor email"
              required
            />
            <Input
              label="Mobile (Optional)"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </form>
        </Modal>

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

export default Instructors;

