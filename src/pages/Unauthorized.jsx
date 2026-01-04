import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-6xl">🔒</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <Link to="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

