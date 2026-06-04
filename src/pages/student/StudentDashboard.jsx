import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recommendedLesson, setRecommendedLesson] = useState(null);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
    fetchAnnouncements();
    fetchAssignedCourses();
    fetchCertificates();
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

  const fetchAssignedCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await studentAPI.getCourses();
      if (response.data.success) {
        const payload = response?.data?.data;
        const items = Array.isArray(payload) ? payload : (payload?.data || []);
        setAssignedCourses(items);
        await buildRecommendedLesson(items);
      }
    } catch (error) {
      console.error('Assigned courses error:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const buildRecommendedLesson = async (courses) => {
    try {
      const rankedCourses = (courses || [])
        .filter((course) => !course.completed)
        .sort((a, b) => (a.progress || 0) - (b.progress || 0))
        .slice(0, 3);

      for (const course of rankedCourses) {
        const courseId = course._id || course.courseId;
        if (!courseId) continue;
        const detailsResponse = await studentAPI.getCourseDetails(courseId);
        const detailCourse = detailsResponse?.data?.data?.course;
        if (!detailCourse?.modules?.length) continue;

        const orderedModules = [...detailCourse.modules].sort((a, b) => a.order - b.order);
        for (const module of orderedModules) {
          const orderedLessons = [...(module.lessons || [])].sort((a, b) => a.order - b.order);
          const nextLesson = orderedLessons.find((lesson) => !lesson.completed);
          if (nextLesson) {
            setRecommendedLesson({
              courseId,
              courseTitle: detailCourse.title,
              moduleTitle: module.title,
              lessonId: nextLesson._id,
              lessonTitle: nextLesson.title,
              progress: course.progress || 0,
            });
            return;
          }
        }
      }

      setRecommendedLesson(null);
    } catch (recommendationError) {
      console.error('Recommendation error:', recommendationError);
      setRecommendedLesson(null);
    }
  };

  const fetchCertificates = async () => {
    try {
      setCertificatesLoading(true);
      const response = await studentAPI.getMyCertificates();
      if (response.data.success) {
        setCertificates(response.data.data || []);
      }
    } catch (error) {
      console.error('Certificates error:', error);
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-card">
        <h1 className="text-3xl font-semibold mb-2">Welcome Back, {user?.name || 'Student'}!</h1>
        <p className="text-brand-100">Ready to continue your learning journey? You're making great progress!</p>
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
        {coursesLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : assignedCourses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No courses assigned yet. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedCourses.slice(0, 3).map((course) => {
              const courseId = course._id || course.courseId;
              const batchNames = (course.batches || [])
                .map((b) => b?.name)
                .filter(Boolean);
              const batchLabel = batchNames.length > 0 ? batchNames.join(', ') : 'N/A';

              return (
                <div
                  key={courseId}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Instructor: {course.instructorId?.name || course.instructor || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            course.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {course.completed ? 'Completed' : `${Math.round(course.progress || 0)}% Complete`}
                        </span>
                        <span className="text-xs text-gray-500">{course.level}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/student/courses/${courseId}`}>
                    <Button variant="primary">Continue Learning →</Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Recommended Next Lesson">
        {recommendedLesson ? (
          <div className="flex items-center justify-between p-4 border border-brand-200 bg-brand-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{recommendedLesson.lessonTitle}</p>
              <p className="text-sm text-gray-600">
                {recommendedLesson.courseTitle} • {recommendedLesson.moduleTitle}
              </p>
              <p className="text-xs text-brand-700 mt-1">
                Current course progress: {Math.round(recommendedLesson.progress)}%
              </p>
            </div>
            <Link to={`/student/courses/${recommendedLesson.courseId}/lessons/${recommendedLesson.lessonId}`}>
              <Button>Resume Now</Button>
            </Link>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No recommendation available yet. Start a course to get suggestions.</div>
        )}
      </Card>

      <Card title="My Certificates" action={<Link to="/student/certificates"><Button variant="outline">View All</Button></Link>}>
        {certificatesLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No certificates available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.slice(0, 3).map((certificate) => (
              <div
                key={certificate._id}
                className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{certificate.certificateName || 'Certificate'}</p>
                  <p className="text-sm text-gray-600">
                    {certificate.certificateNumber} • Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="success">Issued</Badge>
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
                    ? 'border-brand-300 bg-brand-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                      {announcement.pinned && (
                        <span className="px-2 py-1 bg-brand-200 text-brand-800 rounded text-xs font-medium">
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

