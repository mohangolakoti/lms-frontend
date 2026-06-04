import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStudent } from '../../hooks/useStudents';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminAPI } from '../../services/api';

const StudentDetail = () => {
  const { id } = useParams();
  const { student, loading, error, refetch } = useStudent(id);
  const [localStudent, setLocalStudent] = useState(null);

  useEffect(() => {
    setLocalStudent(student);
  }, [student]);

  const formatDate = (value, withTime = false) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return withTime ? date.toLocaleString() : date.toLocaleDateString();
  };

  const getStatusLabel = (status) => {
    if (!status) return 'unknown';
    return status;
  };

  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} this student?`)) {
      try {
        await adminAPI.updateStudentStatus(id, newStatus);
        setLocalStudent((prev) => (prev ? { ...prev, status: newStatus } : prev));
        refetch();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to update status');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !localStudent) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Student not found'}
      </div>
    );
  }

  const isBlocked = localStudent.status === 'blocked';
  const approvalTimeline = localStudent.approvalHistory || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/students">
          <Button variant="secondary">← Back to Students</Button>
        </Link>
        <div className="flex gap-2">
          {localStudent.status && (
            <Button
              variant={isBlocked ? 'success' : 'danger'}
              onClick={() => handleStatusChange(isBlocked ? 'active' : 'blocked')}
            >
              {isBlocked ? 'Unblock Student' : 'Block Student'}
            </Button>
          )}
        </div>
      </div>

      <Card title="Student Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{localStudent.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{localStudent.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <p className="text-gray-900">{localStudent.mobile || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <Badge variant={localStudent.batch === 'longTerm' ? 'primary' : 'info'}>
              {localStudent.batch || 'N/A'}
            </Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Badge variant={localStudent.status === 'active' ? 'success' : 'danger'}>
              {getStatusLabel(localStudent.status)}
            </Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval</label>
            <Badge
              variant={
                localStudent.approvalStatus === 'approved'
                  ? 'success'
                  : localStudent.approvalStatus === 'rejected'
                    ? 'danger'
                    : 'warning'
              }
            >
              {localStudent.approvalStatus || 'pending'}
            </Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registered</label>
            <p className="text-gray-900">
              {formatDate(localStudent.createdAt)}
            </p>
          </div>
          {localStudent.lastLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
              <p className="text-gray-900">
                {formatDate(localStudent.lastLogin, true)}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Approval Timeline">
        {approvalTimeline.length === 0 ? (
          <p className="text-sm text-gray-500">No approval actions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {approvalTimeline
              .slice()
              .sort((a, b) => new Date(b.changedAt || 0) - new Date(a.changedAt || 0))
              .map((entry, idx) => (
                <div key={`${entry.changedAt || idx}-${entry.status || 'status'}`} className="rounded-lg border border-line-soft p-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        entry.status === 'approved'
                          ? 'success'
                          : entry.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {entry.status || 'pending'}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatDate(entry.changedAt, true)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    By: {entry.changedBy?.name || entry.changedBy?.email || 'System'}
                  </p>
                  {entry.reason && (
                    <p className="text-sm text-gray-600 mt-1">Reason: {entry.reason}</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </Card>

      {localStudent.progress && localStudent.progress.length > 0 && (
        <Card title="Course Progress">
          <div className="space-y-4">
            {localStudent.progress.map((prog) => (
              <div key={prog._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {prog.courseId?.title || 'Course'}
                  </h4>
                  <Badge variant={prog.completed ? 'success' : 'primary'}>
                    {prog.completed ? 'Completed' : `${Math.round(prog.overallCoursePercentage)}%`}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${prog.overallCoursePercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Time Spent: {Math.floor((prog.totalTimeSpent || 0) / 60)} minutes
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentDetail;

