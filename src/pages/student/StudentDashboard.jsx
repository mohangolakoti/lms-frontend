import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
    fetchAnnouncements();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await studentAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await studentAPI.getAnnouncements();
      if (response.data.success) {
        setAnnouncements(response.data.data.slice(0, 5)); // Show latest 5
      }
    } catch (error) {
      console.error('Announcements error:', error);
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

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, {user?.name || 'Student'}!</h1>
        <p className="text-primary-100">Ready to continue your learning journey? You're making great progress!</p>
      </div>

      {/* Assessment Activity Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assessment Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tests Assigned"
            value={metrics.totalAssessments || 0}
            icon={<span className="text-2xl">📄</span>}
            color="blue"
          />
          <StatCard
            title="Tests Completed"
            value={metrics.completedAssessments || 0}
            icon={<span className="text-2xl">✅</span>}
            color="green"
          />
          <StatCard
            title="Questions Attempted"
            value={metrics.totalQuestionsAttempted || 0}
            icon={<span className="text-2xl">❓</span>}
            color="purple"
          />
          <StatCard
            title="Total Time Spent"
            value={`${Math.floor((metrics.totalTimeSpent || 0) / 60)}h ${(metrics.totalTimeSpent || 0) % 60}m`}
            icon={<span className="text-2xl">⏱️</span>}
            color="yellow"
          />
        </div>
      </div>

      {/* Learning Paths / Courses */}
      <Card title="Learning Paths" action={<Link to="/student/courses"><Button variant="outline">View All</Button></Link>}>
        {dashboardData?.courses?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No courses assigned yet. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData?.courses?.slice(0, 3).map((course) => (
              <div
                key={course.courseId}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Instructor: {course.instructor}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        course.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {course.completed ? 'Completed' : `${Math.round(course.progress)}% Complete`}
                      </span>
                      <span className="text-xs text-gray-500">{course.level}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/student/courses/${course.courseId}`}>
                  <Button variant="primary">Continue Learning →</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Announcements */}
      <Card title="Announcements" icon={<span className="text-xl">🔔</span>}>
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No announcements</p>
            <p className="text-sm mt-2">Check back later for important updates and news!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`p-4 border rounded-lg ${
                  announcement.pinned 
                    ? 'border-primary-300 bg-primary-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                      {announcement.pinned && (
                        <span className="px-2 py-1 bg-primary-200 text-primary-800 rounded text-xs font-medium">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{announcement.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>By: {announcement.createdBy?.name || 'Admin'}</span>
                      <span>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      {announcement.courseId && (
                        <span>Course: {announcement.courseId?.title || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;

