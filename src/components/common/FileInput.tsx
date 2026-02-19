import { forwardRef } from "react";

const labelClass = "block text-sm font-medium text-gray-700";
const inputClass =
  "mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg";
const errorClass = "mt-1 text-sm text-red-600";
const hintClass = "mt-1 text-sm text-gray-500";

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: string;
  error?: string;
  hint?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, hint, id, ...rest }, ref) => (
    <div className="space-y-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        ref={ref}
        type="file"
        id={id}
        className={inputClass}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
      {hint && (
        <span id={`${id}-hint`} className={hintClass}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className={errorClass} role="alert">
          {error}
        </span>
      )}
    </div>
  )
);

FileInput.displayName = "FileInput";
