import { useMemo, useState } from 'react';
import Badge from './Badge';

const MultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Search... ',
  helperText,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedSet = useMemo(() => new Set(value), [value]);
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  const handleToggle = (option) => {
    if (disabled) return;
    
    const next = new Set(selectedSet);
    const isCurrentlySelected = next.has(option.value);
    
    // Allow unchecking (removal) of inactive batches
    if (isCurrentlySelected) {
      next.delete(option.value);
    } 
    // Prevent adding inactive batches
    else if (option.disabled) {
      return;
    }
    // Allow adding active batches
    else {
      next.add(option.value);
    }
    
    onChange(Array.from(next));
  };

  const selectedLabels = options
    .filter((opt) => selectedSet.has(opt.value))
    .map((opt) => opt.label);

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={`border rounded-lg p-3 bg-white ${disabled ? 'opacity-60' : ''}`}>
        <input
          type="text"
          className="input-field mb-3"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />

        <div className="flex flex-wrap gap-2 mb-3">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((labelText) => (
              <Badge key={labelText} variant="info">
                {labelText}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500">No batches selected</span>
          )}
        </div>

        <div className="max-h-40 overflow-y-auto border rounded-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedSet.has(option.value);
              const isInactive = option.disabled;
              
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                  } ${isInactive && !isSelected ? 'text-gray-400' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option)}
                    disabled={disabled}
                  />
                  <span>{option.label}</span>
                  {isInactive && (
                    <span className="ml-auto text-xs text-gray-400">
                      {isSelected ? 'Inactive (Legacy)' : 'Inactive'}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
      </div>

      {helperText && (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default MultiSelect;
