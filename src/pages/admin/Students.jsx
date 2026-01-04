import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../hooks/useStudents';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import { adminAPI } from '../../services/api';

const Students = () => {
  const [filters, setFilters] = useState({
    status: '',
    batch: '',
    search: '',
  });
  const { students, loading, error, refetch } = useStudents(filters);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await adminAPI.updateStudentStatus(studentId, newStatus);
      refetch();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
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
      header: 'Batch',
      accessor: 'batch',
      render: (student) => (
        <Badge variant={student.batch === 'longTerm' ? 'primary' : 'info'}>
          {student.batch || 'N/A'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (student) => (
        <Badge variant={student.status === 'active' ? 'success' : 'danger'}>
          {student.status}
        </Badge>
      ),
    },
    {
      header: 'Mobile',
      accessor: 'mobile',
      render: (student) => student.mobile || 'N/A',
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (student) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/students/${student._id}`}>
            <Button variant="outline" className="text-xs py-1 px-2">
              View
            </Button>
          </Link>
          <Button
            variant={student.status === 'active' ? 'danger' : 'success'}
            className="text-xs py-1 px-2"
            onClick={() => handleStatusChange(student._id, student.status === 'active' ? 'blocked' : 'active')}
          >
            {student.status === 'active' ? 'Block' : 'Unblock'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <option value="">All Batches</option>
            <option value="longTerm">Long Term</option>
            <option value="shortTerm">Short Term</option>
          </select>
          <Button
            variant="secondary"
            onClick={() => setFilters({ status: '', batch: '', search: '' })}
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
    </div>
  );
};

export default Students;

