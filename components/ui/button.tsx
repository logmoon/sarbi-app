import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-background",
  danger:
    "bg-status-error text-white hover:opacity-90",
  ghost:
    "bg-transparent text-text-secondary hover:bg-background",
};

export function Button({
  variant = "primary",
  className,
  children,
  disabled,
  type = "button",
  onClick,
}: ButtonProps): React.ReactNode {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium transition-colors",
        "min-h-10 min-w-10",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
