import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setStats(response.data.data);
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
      <div className="bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, Admin!</h1>
        <p className="text-primary-100">Here's an overview of your LMS platform</p>
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
          title="Completion Rate"
          value={`${stats?.progress?.completionRate?.toFixed(1) || 0}%`}
          icon={<span className="text-2xl">📊</span>}
          color="blue"
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
          </div>
        </Card>

        <Card title="System Health">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Connected
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

