import { Link } from 'react-router-dom';

const AuthShell = ({ title, subtitle, altText, altLink, altLinkText, children }) => {
  return (
    <div className="auth-shell">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-card">
              <span className="text-white text-2xl font-bold">LMS</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-text-base">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-text-muted">{subtitle}</p>
          )}
          {altText && altLink && (
            <p className="mt-2 text-center text-sm text-text-muted">
              {altText}{' '}
              <Link to={altLink} className="font-medium text-brand-700 hover:text-brand-800">
                {altLinkText}
              </Link>
            </p>
          )}
        </div>
        <div className="auth-panel">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
