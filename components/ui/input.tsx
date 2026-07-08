import { cn } from "@/lib/utils";

type InputProps = {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
};

export function Input({
  label,
  error,
  className,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  autoComplete,
}: InputProps): React.ReactNode {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        className={cn(
          "rounded-sm border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-border-focus",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error ? "border-status-error" : "border-border"
        )}
      />
      {error && (
        <span className="text-xs text-status-error">{error}</span>
      )}
    </div>
  );
}
