import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, startIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors',
              'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600',
              startIcon && 'pl-10',
              error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
