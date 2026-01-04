import { useState, useEffect } from 'react';
import { useInstructorCourses } from '../../hooks/useCourses';
import { instructorAPI } from '../../services/api';
import Card from '../../components/Card';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Table from '../../components/Table';

const StudentProgress = () => {
  const { courses } = useInstructorCourses();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedCourse) {
      fetchProgress();
    } else {
      setProgress([]);
    }
  }, [selectedCourse]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await instructorAPI.getCourseProgress(selectedCourse);
      if (response.data.success) {
        setProgress(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'userId',
      render: (prog) => (
        <div>
          <p className="font-medium">{prog.userId?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{prog.userId?.email || ''}</p>
        </div>
      ),
    },
    {
      header: 'Batch',
      accessor: 'userId',
      render: (prog) => (
        <Badge variant={prog.userId?.batch === 'longTerm' ? 'primary' : 'info'}>
          {prog.userId?.batch || 'N/A'}
        </Badge>
      ),
    },
    {
      header: 'Progress',
      accessor: 'overallCoursePercentage',
      render: (prog) => (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{Math.round(prog.overallCoursePercentage || 0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-400 h-2 rounded-full"
              style={{ width: `${prog.overallCoursePercentage || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'completed',
      render: (prog) => (
        <Badge variant={prog.completed ? 'success' : 'warning'}>
          {prog.completed ? 'Completed' : 'In Progress'}
        </Badge>
      ),
    },
    {
      header: 'Time Spent',
      accessor: 'totalTimeSpent',
      render: (prog) => `${Math.floor((prog.totalTimeSpent || 0) / 60)} minutes`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>

      <Card>
        <Select
          label="Select Course"
          name="course"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          options={courses.map((c) => ({ value: c._id, label: c.title }))}
          placeholder="Choose a course..."
        />
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {selectedCourse && (
        <Card>
          {loading ? (
            <LoadingSpinner />
          ) : progress.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No student progress data available for this course.</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={progress}
              loading={loading}
              emptyMessage="No progress data"
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentProgress;

