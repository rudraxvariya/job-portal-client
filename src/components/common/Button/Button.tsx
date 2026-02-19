import { type ButtonHTMLAttributes } from "react";

const baseClass =
  "inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={`${baseClass} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
