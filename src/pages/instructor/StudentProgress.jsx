import { useState, useEffect } from 'react';
import { useInstructorCourses } from '../../hooks/useCourses';
import { instructorAPI } from '../../services/api';
import Card from '../../components/Card';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Table from '../../components/Table';

const isAtRisk = (prog) => {
  if (prog.completed) return false;
  if ((prog.overallCoursePercentage || 0) < 40) return true;
  if (!prog.lastAccessed) return true;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(prog.lastAccessed).getTime() < sevenDaysAgo;
};

const StudentProgress = () => {
  const { courses } = useInstructorCourses();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    batch: '',
    search: '',
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (selectedCourse) {
      fetchProgress();
    } else {
      setProgress([]);
    }
  }, [selectedCourse, filters.status, filters.batch, filters.search]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.batch) params.batch = filters.batch;
      if (filters.search.trim()) params.search = filters.search.trim();

      const response = await instructorAPI.getCourseProgress(selectedCourse, params);
      if (response.data.success) {
        setProgress(response.data.data);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.error || 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.batch) params.batch = filters.batch;
      if (filters.search.trim()) params.search = filters.search.trim();

      const response = await instructorAPI.exportCourseProgress(selectedCourse, params);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `course-${selectedCourse}-progress.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError.response?.data?.error || 'Failed to export progress');
    } finally {
      setExporting(false);
    }
  };

  const completedCount = progress.filter((item) => item.completed).length;
  const atRiskCount = progress.filter(isAtRisk).length;
  const averageProgress = progress.length > 0
    ? progress.reduce((sum, item) => sum + (item.overallCoursePercentage || 0), 0) / progress.length
    : 0;

  const columns = [
    {
      header: 'Student',
      accessor: 'userId',
      render: (prog) => (
        <div>
          <p className="font-medium">{prog.userId?.name || 'N/A'}</p>
          <p className="text-xs text-text-muted">{prog.userId?.email || ''}</p>
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
          <div className="w-full bg-surface-muted rounded-full h-2">
            <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${prog.overallCoursePercentage || 0}%` }} />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'completed',
      render: (prog) => (
        <div className="flex flex-col gap-1">
          <Badge variant={prog.completed ? 'success' : 'warning'}>
            {prog.completed ? 'Completed' : 'In Progress'}
          </Badge>
          {isAtRisk(prog) && <Badge variant="danger">At Risk</Badge>}
        </div>
      ),
    },
    {
      header: 'Time Spent',
      accessor: 'totalTimeSpent',
      render: (prog) => {
        const seconds = prog.totalTimeSpent || 0;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">Student Progress</h1>

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

      {selectedCourse && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'not_started', label: 'Not Started' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
            <Select
              label="Batch"
              name="batch"
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
              options={[
                { value: '', label: 'All batches' },
                { value: 'longTerm', label: 'Long Term' },
                { value: 'shortTerm', label: 'Short Term' },
              ]}
            />
            <Input
              label="Search"
              name="search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Name or email"
            />
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={handleExport} disabled={exporting || loading}>
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {selectedCourse && (
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-line-subtle bg-surface-subtle p-4">
              <p className="text-sm text-text-muted">Enrolled Students</p>
              <p className="text-xl font-semibold text-text-primary">{progress.length}</p>
            </div>
            <div className="rounded-lg border border-line-subtle bg-surface-subtle p-4">
              <p className="text-sm text-text-muted">Completed</p>
              <p className="text-xl font-semibold text-text-primary">{completedCount}</p>
            </div>
            <div className="rounded-lg border border-line-subtle bg-surface-subtle p-4">
              <p className="text-sm text-text-muted">At Risk</p>
              <p className="text-xl font-semibold text-danger-700">{atRiskCount}</p>
            </div>
            <div className="rounded-lg border border-line-subtle bg-surface-subtle p-4">
              <p className="text-sm text-text-muted">Average Progress</p>
              <p className="text-xl font-semibold text-text-primary">{Math.round(averageProgress)}%</p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : progress.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p>No student progress data matches your filters.</p>
            </div>
          ) : (
            <Table columns={columns} data={progress} loading={loading} emptyMessage="No progress data" />
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentProgress;
