import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import AppShell from '../components/AppShell';

const StudentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const isLessonMode = location.pathname.includes('/lessons/');

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await studentAPI.getUnreadNotificationCount();
        setUnreadCount(response.data.data?.count || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/courses', label: 'Courses', icon: '📚' },
    { path: '/student/assessments', label: 'Assessments', icon: '📝' },
    { path: '/student/announcements', label: 'Announcements', icon: '📢' },
    {
      path: '/student/notifications',
      label: unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications',
      icon: '🔔',
    },
    { path: '/student/certificates', label: 'Certificates', icon: '🎓' },
    { path: '/student/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      menuItems={menuItems}
      userFallback="S"
      lessonMode={isLessonMode}
    >
      {isLessonMode ? <main className="p-0">{children}</main> : children}
    </AppShell>
  );
};

export default StudentLayout;
