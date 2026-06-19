import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import formatDuration from '../../utils/formatDuration';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
    fetchLearningPath();
    fetchAssignedCourses();
    fetchCertificates();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await studentAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPath = async () => {
    try {
      const response = await studentAPI.getLearningPath();
      if (response.data.success) {
        setLearningPath(response.data.data);
      }
    } catch (err) {
      console.error('Learning path error:', err);
    }
  };

  const fetchAssignedCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await studentAPI.getCourses({ page: 1, limit: 12 });
      if (response.data.success) {
        setAssignedCourses(response.data.data || []);
      }
    } catch (err) {
      console.error('Assigned courses error:', err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      setCertificatesLoading(true);
      const response = await studentAPI.getMyCertificates();
      if (response.data.success) {
        setCertificates(response.data.data || []);
      }
    } catch (err) {
      console.error('Certificates error:', err);
    } finally {
      setCertificatesLoading(false);
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
  const continueLesson = learningPath?.continueLesson;
  const upcomingAssessments = learningPath?.upcomingAssessments || [];
  const recentAnnouncements = learningPath?.recentAnnouncements || [];
  const timeSeconds = metrics.totalTimeSpentSeconds ?? metrics.totalTimeSpent ?? 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-card">
        <h1 className="text-3xl font-semibold mb-2">Welcome Back, {user?.name || 'Student'}!</h1>
        <p className="text-brand-100">Pick up where you left off and keep your learning momentum going.</p>
        {continueLesson && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate(`/student/courses/${continueLesson.courseId}/lessons/${continueLesson.lessonId}`)}>
              Resume: {continueLesson.lessonTitle}
            </Button>
            <span className="text-sm text-brand-100">
              {continueLesson.courseTitle} • {Math.round(continueLesson.progress || 0)}% complete
            </span>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text-base mb-4">Learning Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Courses"
            value={`${metrics.completedCourses || 0}/${metrics.totalCourses || 0}`}
            icon={<span className="text-2xl">📚</span>}
            color="blue"
          />
          <StatCard
            title="Modules Completed"
            value={`${metrics.completedModules || 0}/${metrics.totalModules || 0}`}
            icon={<span className="text-2xl">📖</span>}
            color="green"
          />
          <StatCard
            title="Time Spent Learning"
            value={formatDuration(timeSeconds)}
            icon={<span className="text-2xl">⏱️</span>}
            color="yellow"
          />
          <StatCard
            title="Assessments Done"
            value={`${metrics.completedAssessments || 0}/${metrics.totalAssessments || 0}`}
            icon={<span className="text-2xl">📝</span>}
            color="purple"
          />
        </div>
      </div>

      <Card
        title="My Courses"
        action={<Button variant="outline" onClick={() => navigate('/student/courses')}>View All</Button>}
      >
        {coursesLoading ? (
          <div className="flex items-center justify-center py-8"><LoadingSpinner size="md" /></div>
        ) : assignedCourses.length === 0 ? (
          <div className="text-center py-8 text-text-subtle">No courses assigned yet.</div>
        ) : (
          <div className="space-y-4">
            {assignedCourses.slice(0, 3).map((course) => (
              <div key={course._id} className="flex items-center justify-between p-4 border border-line-soft rounded-lg">
                <div>
                  <h3 className="font-semibold text-text-base">{course.title}</h3>
                  <p className="text-sm text-text-muted">{course.instructorId?.name || 'Instructor'}</p>
                  <Badge variant={course.completed ? 'success' : 'primary'} className="mt-2">
                    {course.completed ? 'Completed' : `${Math.round(course.progress || 0)}%`}
                  </Badge>
                </div>
                <Button onClick={() => navigate(`/student/courses/${course._id}`)}>Continue →</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Upcoming Assessments">
        {upcomingAssessments.length === 0 ? (
          <p className="text-sm text-text-subtle">No upcoming assessments.</p>
        ) : (
          <div className="space-y-3">
            {upcomingAssessments.map((assessment) => (
              <div key={assessment._id} className="flex items-center justify-between p-3 border border-line-soft rounded-lg">
                <div>
                  <p className="font-medium text-text-base">{assessment.title}</p>
                  <p className="text-xs text-text-muted">{assessment.courseTitle}</p>
                </div>
                <Button variant="outline" onClick={() => navigate(`/student/assessments/${assessment._id}`)}>
                  {assessment.windowStatus === 'upcoming' ? 'View' : 'Start'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="My Certificates"
        action={<Button variant="outline" onClick={() => navigate('/student/certificates')}>View All</Button>}
      >
        {certificatesLoading ? (
          <div className="flex items-center justify-center py-8"><LoadingSpinner size="md" /></div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8 text-text-subtle">No certificates yet.</div>
        ) : (
          <div className="space-y-3">
            {certificates.slice(0, 3).map((certificate) => (
              <div key={certificate._id} className="p-4 border border-line-soft rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-base">{certificate.certificateName || 'Certificate'}</p>
                  <p className="text-sm text-text-muted">
                    {certificate.certificateNumber} • {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="success">Issued</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Announcements">
        {recentAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-text-subtle">No announcements.</div>
        ) : (
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement._id}
                className={`p-4 border rounded-lg ${announcement.pinned ? 'border-brand-300 bg-brand-50' : 'border-line-soft'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-text-base">{announcement.title}</h4>
                  {announcement.pinned && <Badge variant="primary">Pinned</Badge>}
                </div>
                <p className="text-sm text-text-muted">{announcement.message}</p>
              </div>
            ))}
            <Button variant="outline" onClick={() => navigate('/student/announcements')}>View All Announcements</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
