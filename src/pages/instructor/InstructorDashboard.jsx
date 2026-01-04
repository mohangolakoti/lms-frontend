import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { instructorAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

const InstructorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
    fetchCourses();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await instructorAPI.getDashboard();
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

  const fetchCourses = async () => {
    try {
      const response = await instructorAPI.getCourses();
      if (response.data.success) {
        setCourses(response.data.data.slice(0, 5)); // Show latest 5 courses
      }
    } catch (error) {
      console.error('Courses error:', error);
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
        <h1 className="text-3xl font-bold mb-2">Welcome Back, Instructor!</h1>
        <p className="text-primary-100">Ready to continue teaching? You're making great progress!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats?.courses?.totalCourses || 0}
          icon={<span className="text-2xl">📚</span>}
          color="blue"
        />
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
          title="Total Students"
          value={stats?.students?.totalStudents || 0}
          icon={<span className="text-2xl">👥</span>}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/instructor/courses">
            <Button className="w-full">My Courses</Button>
          </Link>
          <Link to="/instructor/assessments">
            <Button className="w-full">Manage Assessments</Button>
          </Link>
          <Link to="/instructor/progress">
            <Button className="w-full">View Student Progress</Button>
          </Link>
        </div>
      </Card>

      {/* My Courses */}
      <Card title="My Courses" action={<Link to="/instructor/courses"><Button variant="outline">View All</Button></Link>}>
        {courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No courses yet. Create your first course to get started!</p>
            <Link to="/instructor/courses">
              <Button>Create Course</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.visibility === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.visibility}
                    </span>
                    <span className="text-xs text-gray-500">{course.level}</span>
                    <span className="text-xs text-gray-500">{course.term}</span>
                  </div>
                </div>
                <Link to={`/instructor/courses/${course._id}`}>
                  <Button variant="outline">View Course →</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default InstructorDashboard;

