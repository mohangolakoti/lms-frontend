import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard } from '../utils/roleRedirect';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthStatusDialog from '../components/AuthStatusDialog';
import AuthShell from '../components/AuthShell';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState(null); // 'PENDING_APPROVAL', 'BLOCKED', 'REJECTED', or null
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setAuthStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAuthStatus(null);
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Get user role from localStorage (set by login function)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.role) {
        navigate(getRoleDashboard(userData.role), { replace: true });
      } else {
        // Fallback: wait for context update
        setTimeout(() => {
          if (user?.role) {
            navigate(getRoleDashboard(user.role), { replace: true });
          }
        }, 500);
      }
    } else {
      // Map backend error to auth status
      const errorMsg = result.error || '';
      if (errorMsg.includes('pending admin approval')) {
        setAuthStatus('PENDING_APPROVAL');
      } else if (errorMsg.includes('batch is currently inactive')) {
        setAuthStatus('BATCH_INACTIVE');
      } else if (errorMsg.includes('blocked')) {
        setAuthStatus('BLOCKED');
      } else if (errorMsg.includes('rejected')) {
        setAuthStatus('REJECTED');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthStatus(null);
    setError('');
    setFormData({ email: '', password: '' });
  };

  return (
    <AuthShell
      title="Sign in to your account"
      altText="Or"
      altLink="/register"
      altLinkText="create a new account"
    >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {authStatus && <AuthStatusDialog status={authStatus} onRetry={handleRetry} />}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-line-soft rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-base">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-brand-700 hover:text-brand-800">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </Button>
          </div>
        </form>
    </AuthShell>
  );
};

export default Login;

