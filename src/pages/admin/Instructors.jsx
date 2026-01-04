import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Table from '../../components/Table';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>

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
    </div>
  );
};

export default Instructors;

