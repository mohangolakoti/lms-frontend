import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

const StudentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Lesson mode: hide global LMS sidebar and top bar padding
  const isLessonMode = location.pathname.includes('/lessons/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/courses', label: 'Courses', icon: '📚' },
    { path: '/student/assessments', label: 'Assessments', icon: '📝' },
    { path: '/student/announcements', label: 'Announcements', icon: '📢' },
    { path: '/student/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/student/sessions', label: 'Active Devices', icon: '🖥️' },
    { path: '/student/certificates', label: 'Certificates', icon: '🎓' },
  ];

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      menuItems={menuItems}
      userFallback="S"
      appLabel="LMS Student"
      lessonMode={isLessonMode}
    >
      {isLessonMode ? <main className="p-0">{children}</main> : children}
    </AppShell>
  );
};

export default StudentLayout;

