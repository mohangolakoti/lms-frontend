import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/students', label: 'Students', icon: '👥' },
    { path: '/admin/batches', label: 'Batches', icon: '🧩' },
    { path: '/admin/courses', label: 'Courses', icon: '📚' },
    { path: '/admin/instructors', label: 'Instructors', icon: '👨‍🏫' },
    { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { path: '/admin/certificates', label: 'Certificates', icon: '🎓' },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: '🕵️' },
  ];

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      menuItems={menuItems}
      userFallback="A"
      appLabel="LMS Admin"
    >
      {children}
    </AppShell>
  );
};

export default AdminLayout;

