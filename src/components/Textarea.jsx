const Textarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder,
  required = false,
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-base mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`input-field ${error ? 'border-danger-600 focus:ring-danger-600' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
};

export default Textarea;

