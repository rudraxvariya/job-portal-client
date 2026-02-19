import { forwardRef } from "react";

const inputClass =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-sm text-red-600";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
  optionalLabel?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, optionalLabel, id, ...rest }, ref) => (
    <div className="space-y-0">
      <label htmlFor={id} className={labelClass}>
        {label}
        {optionalLabel && (
          <span className="text-gray-400 font-normal"> {optionalLabel}</span>
        )}
      </label>
      <input
        ref={ref}
        id={id}
        className={inputClass}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} className={errorClass} role="alert">
          {error}
        </span>
      )}
    </div>
  )
);

Input.displayName = "Input";
