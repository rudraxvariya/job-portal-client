import { forwardRef } from "react";

const inputBaseClass =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
const fileInputClass =
  "mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100";

type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>;
type CustomInputProps = {
  label?: string;
  error?: string;
  /** Show "(optional)" after the label text */
  labelOptional?: boolean;
  className?: string;
};
export type InputProps = Omit<NativeInputProps, keyof CustomInputProps> & CustomInputProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, labelOptional, className = "", type = "text", id, ...props }, ref) => {
    const isFile = type === "file";
    const inputClassName = isFile
      ? `${fileInputClass} ${className}`.trim()
      : `${inputBaseClass} ${className}`.trim();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {labelOptional && (
              <span className="text-gray-400 font-normal"> (optional)</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={inputClassName}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={id ? `${id}-error` : undefined} className="mt-1 block text-sm text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
