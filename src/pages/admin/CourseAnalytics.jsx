import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseAnalytics = () => {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCourseAnalytics(id);
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch analytics');
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

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <Link to="/admin/courses">
          <Button variant="secondary">← Back to Courses</Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Analytics not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/courses">
        <Button variant="secondary">← Back to Courses</Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {analytics.course?.title || 'Course Analytics'}
        </h1>
        <p className="text-gray-600">
          {analytics.course?.totalModules || 0} Modules • {analytics.course?.totalLessons || 0} Lessons
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={analytics.students?.totalStudents || 0}
          icon={<span className="text-2xl">👥</span>}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={analytics.students?.completedStudents || 0}
          icon={<span className="text-2xl">✅</span>}
          color="green"
        />
        <StatCard
          title="Completion Rate"
          value={`${analytics.students?.completionRate?.toFixed(1) || 0}%`}
          icon={<span className="text-2xl">📊</span>}
          color="purple"
        />
      </div>

      <Card title="Progress Overview">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Average Completion</span>
            <span className="font-semibold text-lg">
              {analytics.progress?.avgCompletion?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Time Spent</span>
            <span className="font-semibold text-lg">
              {analytics.progress?.totalTimeSpent || 0} hours
            </span>
          </div>
        </div>
      </Card>

      {analytics.moduleStats && analytics.moduleStats.length > 0 && (
        <Card title="Module Statistics">
          <div className="space-y-4">
            {analytics.moduleStats.map((module, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{module.title}</h4>
                  <span className="text-sm font-medium text-brand-700">
                    {module.avgCompletion?.toFixed(1) || 0}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${module.avgCompletion || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CourseAnalytics;

