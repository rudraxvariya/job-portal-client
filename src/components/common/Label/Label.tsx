import { type LabelHTMLAttributes } from "react";

const labelClass = "block text-sm font-medium text-gray-700";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  optional?: boolean;
}

export function Label({ optional, children, className = "", ...props }: LabelProps) {
  return (
    <label className={`${labelClass} ${className}`.trim()} {...props}>
      {children}
      {optional && (
        <span className="text-gray-400 font-normal"> (optional)</span>
      )}
    </label>
  );
}
