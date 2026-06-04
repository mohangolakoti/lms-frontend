import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

const InstructorLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/instructor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/instructor/courses', label: 'My Courses', icon: '📚' },
    { path: '/instructor/assessments', label: 'Assessments', icon: '📝' },
    { path: '/instructor/progress', label: 'Student Progress', icon: '📈' },
  ];

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      menuItems={menuItems}
      userFallback="I"
      appLabel="LMS Instructor"
    >
      {children}
    </AppShell>
  );
};

export default InstructorLayout;

