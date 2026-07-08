import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: CardProps): React.ReactNode {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface p-4",
        className
      )}
    >
      {children}
    </div>
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
