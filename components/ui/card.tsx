import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export function Card({ className, children, onClick }: CardProps): React.ReactNode {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "rounded-md border border-border bg-surface p-4 text-left",
        onClick && "cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, children }: CardProps): React.ReactNode {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardContent({ className, children }: CardProps): React.ReactNode {
  return <div className={cn("", className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps): React.ReactNode {
  return <div className={cn("mt-4 flex items-center gap-2", className)}>{children}</div>;
}
