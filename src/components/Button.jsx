import { LoaderCircle } from "lucide-react";

export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <LoaderCircle size={18} className="spinner" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
