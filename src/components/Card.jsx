const Card = ({ children, className = '', title, action, compact = false }) => {
  return (
    <div className={`card ${compact ? 'p-4' : ''} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-text-base">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

