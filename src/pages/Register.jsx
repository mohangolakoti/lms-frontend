import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard } from '../utils/roleRedirect';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthStatusDialog from '../components/AuthStatusDialog';
import AuthShell from '../components/AuthShell';

const Register = () => {
  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    role: 'student',
    batch: 'longTerm',
  });
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState(null); // 'EMAIL_EXISTS', 'PENDING_APPROVAL', or null
  const [loading, setLoading] = useState(false);
  const { register, user, isAuthenticated } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!strongPasswordPattern.test(formData.password)) {
      setError('Password must be 8-64 characters with uppercase, lowercase, number, and symbol');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      // Check if student with pending approval
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.role === 'student' && userData.approvalStatus === 'pending') {
        setAuthStatus('PENDING_APPROVAL');
        setLoading(false);
      } else if (userData.role) {
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
      if (errorMsg.includes('already exists') || errorMsg.includes('email')) {
        setAuthStatus('EMAIL_EXISTS');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthStatus(null);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      role: 'student',
      batch: 'longTerm',
    });
  };

  return (
    <AuthShell
      title="Create your account"
      altText="Already have an account?"
      altLink="/login"
      altLinkText="Sign in"
    >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {authStatus && <AuthStatusDialog status={authStatus} onRetry={handleRetry} onNavigate={navigate} />}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
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
              label="Mobile (Optional)"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter your mobile number"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Type
              </label>
              <div className="input-field bg-surface-muted text-text-muted">Student</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-base mb-2">
                Batch
              </label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="longTerm">Long Term</option>
                <option value="shortTerm">Short Term</option>
              </select>
            </div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8-64 chars, uppercase, lowercase, number, symbol"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Create account'}
            </Button>
          </div>
        </form>
    </AuthShell>
  );
};

export default Register;

