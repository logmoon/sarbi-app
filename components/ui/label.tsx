import { cn } from "@/lib/utils";

type LabelProps = {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
};

export function Label({ className, children, htmlFor }: LabelProps): React.ReactNode {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-text-secondary",
        className
      )}
    >
      {children}
    </label>
  );
}
