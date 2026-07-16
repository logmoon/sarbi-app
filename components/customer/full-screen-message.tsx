import { Button } from "@/components/ui/button";

type FullScreenMessageProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

/**
 * Full-page takeover for states where the customer menu itself can't be
 * shown yet — inactive table, blocked session pending staff check, etc.
 * Server-safe (no "use client"): usable directly from the SSR customer menu
 * page as well as from within client components like CustomerShell.
 */
export function FullScreenMessage({
  title,
  description,
  action,
}: FullScreenMessageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
        {action && (
          <Button className="mt-6" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
