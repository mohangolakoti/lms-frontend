export const getRoleDashboard = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/login';
  }
};

