import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Public pages (loaded eagerly or lazily)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

// Layouts (lazy loaded)
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const InstructorLayout = lazy(() => import('./layouts/InstructorLayout'));
const StudentLayout = lazy(() => import('./layouts/StudentLayout'));

// Admin Pages (lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Students = lazy(() => import('./pages/admin/Students'));
const StudentDetail = lazy(() => import('./pages/admin/StudentDetail'));
const AdminCourses = lazy(() => import('./pages/admin/Courses'));
const CourseAnalytics = lazy(() => import('./pages/admin/CourseAnalytics'));
const Instructors = lazy(() => import('./pages/admin/Instructors'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const Batches = lazy(() => import('./pages/admin/Batches'));
const AdminCertificates = lazy(() => import('./pages/admin/Certificates'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));

// Instructor Pages (lazy loaded)
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const InstructorCourses = lazy(() => import('./pages/instructor/Courses'));
const CourseManagement = lazy(() => import('./pages/instructor/CourseManagement'));
const InstructorAssessments = lazy(() => import('./pages/instructor/Assessments'));
const AssessmentSubmissions = lazy(() => import('./pages/instructor/AssessmentSubmissions'));
const AssessmentAnalytics = lazy(() => import('./pages/instructor/AssessmentAnalytics'));
const StudentProgress = lazy(() => import('./pages/instructor/StudentProgress'));

// Student Pages (lazy loaded)
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentCourses = lazy(() => import('./pages/student/Courses'));
const CourseDetail = lazy(() => import('./pages/student/CourseDetail'));
const LessonView = lazy(() => import('./pages/student/LessonView'));
const StudentAssessments = lazy(() => import('./pages/student/Assessments'));
const AssessmentView = lazy(() => import('./pages/student/AssessmentView'));
const StudentAnnouncements = lazy(() => import('./pages/student/Announcements'));
const Notifications = lazy(() => import('./pages/student/Notifications'));
const StudentCertificates = lazy(() => import('./pages/student/Certificates'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const StudentSessions = lazy(() => import('./pages/student/Sessions'));

// Reusable Loading Fallback
const PageLoader = () => (
  <LoadingSpinner fullscreen size="lg" label="Loading experience" />
);

// Redirect component for authenticated users
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen size="lg" label="Loading your workspace" />;
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

  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
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
                    <Suspense fallback={<PageLoader />}>
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
                    </Suspense>
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
                    <Suspense fallback={<PageLoader />}>
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
                    </Suspense>
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
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="courses" element={<StudentCourses />} />
                        <Route path="courses/:id" element={<CourseDetail />} />
                        <Route path="courses/:courseId/lessons/:lessonId" element={<LessonView />} />
                        <Route path="assessments" element={<StudentAssessments />} />
                        <Route path="assessments/:id" element={<AssessmentView />} />
                        <Route path="announcements" element={<StudentAnnouncements />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="profile" element={<StudentProfile />} />
                        <Route path="sessions" element={<StudentSessions />} />
                        <Route path="certificates" element={<StudentCertificates />} />
                        <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                      </Routes>
                    </Suspense>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
