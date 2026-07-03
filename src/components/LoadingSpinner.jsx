import Logo from './Logo';

const LoadingSpinner = ({ size = 'md', className = '', fullscreen = false, label = 'Loading' }) => {
  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const content = (
    <div className={`brand-loading-shell ${className}`.trim()} role="status" aria-live="polite" aria-label={label}>
      <Logo
        variant="logo-only"
        alt=""
        aria-hidden="true"
        className={`${sizes[size]} brand-loading-logo`}
      />
    </div>
  );

  if (fullscreen) {
    return <div className="app-loading-screen">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;

