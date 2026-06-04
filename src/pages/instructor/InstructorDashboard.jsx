import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instructorAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

const InstructorDashboard = () => {
  const navigate = useNavigate();
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
    } catch (fetchError) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await instructorAPI.getCourses();
      if (response.data.success) {
        setCourses(response.data.data.slice(0, 5));
      }
    } catch (fetchError) {
      console.error('Courses error:', fetchError);
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
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-card">
        <h1 className="text-3xl font-semibold mb-2">Welcome Back, Instructor!</h1>
        <p className="text-brand-100">Review courses, track learner progress, and manage assessments from one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Courses" value={stats?.courses?.totalCourses || 0} icon={<span className="text-2xl">📚</span>} color="blue" />
        <StatCard title="Published Courses" value={stats?.courses?.publishedCourses || 0} icon={<span className="text-2xl">📖</span>} color="green" />
        <StatCard title="Draft Assessments" value={stats?.assessments?.draftAssessments || 0} icon={<span className="text-2xl">📝</span>} color="yellow" />
        <StatCard title="At-Risk Students" value={stats?.students?.atRiskStudents || 0} icon={<span className="text-2xl">⚠️</span>} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-text-muted">Total Submissions</p>
          <p className="text-2xl font-semibold text-text-base">{stats?.assessments?.totalSubmissions || 0}</p>
          <Button variant="outline" className="mt-3 w-full" onClick={() => navigate('/instructor/assessments')}>
            Review Assessments
          </Button>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Enrolled Learners (tracked)</p>
          <p className="text-2xl font-semibold text-text-base">{stats?.students?.totalStudents || 0}</p>
          <Button variant="outline" className="mt-3 w-full" onClick={() => navigate('/instructor/progress')}>
            View Progress
          </Button>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">Completed Learners</p>
          <p className="text-2xl font-semibold text-text-base">{stats?.students?.completedStudents || 0}</p>
          <Button variant="outline" className="mt-3 w-full" onClick={() => navigate('/instructor/courses')}>
            Open Courses
          </Button>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="w-full" onClick={() => navigate('/instructor/courses')}>My Courses</Button>
          <Button className="w-full" onClick={() => navigate('/instructor/assessments')}>Manage Assessments</Button>
          <Button className="w-full" onClick={() => navigate('/instructor/progress')}>View Student Progress</Button>
        </div>
      </Card>

      <Card
        title="My Courses"
        action={<Button variant="outline" onClick={() => navigate('/instructor/courses')}>View All</Button>}
      >
        {courses.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>No courses assigned yet. Contact an administrator to get course access.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course._id} className="flex items-center justify-between p-4 border border-line-soft rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-base">{course.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{course.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={course.visibility === 'published' ? 'success' : 'warning'}>{course.visibility}</Badge>
                    <Badge variant={course.instructorRole === 'editor' ? 'success' : 'info'}>
                      {course.instructorRole === 'editor' ? 'Editor' : 'Viewer'}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate(`/instructor/courses/${course._id}`)}>
                  {course.instructorRole === 'editor' ? 'Manage →' : 'Review →'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default InstructorDashboard;
