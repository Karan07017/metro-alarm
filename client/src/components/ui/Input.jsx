import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, icon: Icon, error, className = '', containerClassName = '', endAdornment, ...props },
  ref
) {
  const id = useId();
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full bg-surface-2 border rounded-xl text-text placeholder:text-faint px-4 py-3 text-sm outline-none transition-colors duration-150
            ${Icon ? 'pl-10' : ''} ${endAdornment ? 'pr-11' : ''}
            ${error ? 'border-danger/50 focus:border-danger' : 'border-border focus:border-gps-from/60'}
            ${className}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{endAdornment}</div>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
});

export default Input;
