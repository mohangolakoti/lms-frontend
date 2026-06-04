import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashboardResponse, reportsResponse, healthResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOperationalReports(),
        adminAPI.getHealth(),
      ]);

      if (dashboardResponse.data.success) {
        setStats(dashboardResponse.data.data);
      }
      if (reportsResponse.data.success) {
        setReports(reportsResponse.data.data);
      }
      if (healthResponse.data) {
        setHealth(healthResponse.data);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-card">
        <h1 className="text-3xl font-semibold mb-2">Welcome Back, Admin!</h1>
        <p className="text-brand-100">Here's an overview of your LMS platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.users?.totalStudents || 0}
          icon={<span className="text-2xl">👥</span>}
          color="blue"
        />
        <StatCard
          title="Active Students"
          value={stats?.users?.activeStudents || 0}
          icon={<span className="text-2xl">✅</span>}
          color="green"
        />
        <StatCard
          title="Total Courses"
          value={stats?.courses?.totalCourses || 0}
          icon={<span className="text-2xl">📚</span>}
          color="purple"
        />
        <StatCard
          title="Instructors"
          value={stats?.users?.totalInstructors || 0}
          icon={<span className="text-2xl">👨‍🏫</span>}
          color="yellow"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Published Courses"
          value={stats?.courses?.publishedCourses || 0}
          icon={<span className="text-2xl">📖</span>}
          color="green"
        />
        <StatCard
          title="Draft Courses"
          value={stats?.courses?.draftCourses || 0}
          icon={<span className="text-2xl">📝</span>}
          color="yellow"
        />
        <StatCard
          title="30-Day Active Learners"
          value={stats?.activity?.activeStudentsRecent || 0}
          icon={<span className="text-2xl">🔥</span>}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Completion Rate"
          value={`${stats?.progress?.completionRate?.toFixed(1) || 0}%`}
          icon={<span className="text-2xl">📊</span>}
          color="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={reports?.pendingApprovals || 0}
          icon={<span className="text-2xl">⏳</span>}
          color="yellow"
        />
        <StatCard
          title="Learning Hours"
          value={stats?.activity?.totalTimeSpent || 0}
          icon={<span className="text-2xl">⏱️</span>}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/students">
            <Button className="w-full">Manage Students</Button>
          </Link>
          <Link to="/admin/courses">
            <Button className="w-full">Manage Courses</Button>
          </Link>
          <Link to="/admin/instructors">
            <Button className="w-full">View Instructors</Button>
          </Link>
          <Link to="/admin/announcements">
            <Button className="w-full">Create Announcement</Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Platform Overview">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Time Spent</span>
              <span className="font-semibold">{stats?.activity?.totalTimeSpent || 0} hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Students (30 days)</span>
              <span className="font-semibold">{stats?.activity?.activeStudentsRecent || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Course Completions</span>
              <span className="font-semibold">{stats?.progress?.completedProgress || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blocked Students</span>
              <span className="font-semibold text-red-600">{stats?.users?.blockedStudents || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cohort Completion</span>
              <span className="font-semibold">{(reports?.completionRate || 0).toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        <Card title="System Health">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                health?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
              }`}>
                {health?.success ? 'Operational' : 'Degraded'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                health?.database?.state === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
              }`}>
                {health?.database?.state || 'unknown'}
              </span>
            </div>
            {reports?.batchHealth?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Batch Health</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {reports.batchHealth.map((batch) => (
                    <div key={batch._id || batch.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{batch.name}</span>
                      <span className="text-gray-500">
                        {batch.studentCount} students · {batch.isActive ? 'active' : 'inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

