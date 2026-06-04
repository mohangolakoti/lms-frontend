import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import StudentLayout from './layouts/StudentLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Students from './pages/admin/Students';
import StudentDetail from './pages/admin/StudentDetail';
import AdminCourses from './pages/admin/Courses';
import CourseAnalytics from './pages/admin/CourseAnalytics';
import Instructors from './pages/admin/Instructors';
import AdminAnnouncements from './pages/admin/Announcements';
import Batches from './pages/admin/Batches';
import AdminCertificates from './pages/admin/Certificates';
import AuditLogs from './pages/admin/AuditLogs';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/Courses';
import CourseManagement from './pages/instructor/CourseManagement';
import InstructorAssessments from './pages/instructor/Assessments';
import AssessmentSubmissions from './pages/instructor/AssessmentSubmissions';
import AssessmentAnalytics from './pages/instructor/AssessmentAnalytics';
import StudentProgress from './pages/instructor/StudentProgress';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import LessonView from './pages/student/LessonView';
import StudentAssessments from './pages/student/Assessments';
import AssessmentView from './pages/student/AssessmentView';
import StudentAnnouncements from './pages/student/Announcements';
import Notifications from './pages/student/Notifications';
import StudentCertificates from './pages/student/Certificates';
import StudentSessions from './pages/student/Sessions';

// Redirect component for authenticated users
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-400"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'instructor') {
      return <Navigate to="/instructor/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword/:resettoken" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="students" element={<Students />} />
                    <Route path="students/:id" element={<StudentDetail />} />
                    <Route path="batches" element={<Batches />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="courses/:id/analytics" element={<CourseAnalytics />} />
                    <Route path="instructors" element={<Instructors />} />
                    <Route path="announcements" element={<AdminAnnouncements />} />
                    <Route path="certificates" element={<AdminCertificates />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Instructor Routes */}
          <Route
            path="/instructor/*"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorLayout>
                  <Routes>
                    <Route path="dashboard" element={<InstructorDashboard />} />
                    <Route path="courses" element={<InstructorCourses />} />
                    <Route path="courses/:id" element={<CourseManagement />} />
                    <Route path="assessments" element={<InstructorAssessments />} />
                    <Route path="assessments/:assessmentId/submissions" element={<AssessmentSubmissions />} />
                    <Route path="assessments/:assessmentId/analytics" element={<AssessmentAnalytics />} />
                    <Route path="progress" element={<StudentProgress />} />
                    <Route path="*" element={<Navigate to="/instructor/dashboard" replace />} />
                  </Routes>
                </InstructorLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="courses" element={<StudentCourses />} />
                    <Route path="courses/:id" element={<CourseDetail />} />
                    <Route path="courses/:courseId/lessons/:lessonId" element={<LessonView />} />
                    <Route path="assessments" element={<StudentAssessments />} />
                    <Route path="assessments/:id" element={<AssessmentView />} />
                    <Route path="announcements" element={<StudentAnnouncements />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="sessions" element={<StudentSessions />} />
                    <Route path="certificates" element={<StudentCertificates />} />
                    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                  </Routes>
                </StudentLayout>
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root redirect */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

