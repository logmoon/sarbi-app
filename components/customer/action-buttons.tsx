"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionButtonsProps = {
  onCallWaiter: () => Promise<void>;
  onRequestBill: () => Promise<void>;
  hasSession: boolean;
  hasOrders: boolean;
  waiterPending: boolean;
  billPending: boolean;
};

export function ActionButtons({
  onCallWaiter,
  onRequestBill,
  hasSession,
  hasOrders,
  waiterPending: initialWaiterPending,
  billPending: initialBillPending,
}: ActionButtonsProps) {
  const [calling, setCalling] = useState(false);
  const [requestingBill, setRequestingBill] = useState(false);
  const [waiterPending, setWaiterPending] = useState(initialWaiterPending);
  const [billPending, setBillPending] = useState(initialBillPending);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setWaiterPending(initialWaiterPending); }, [initialWaiterPending]);
  useEffect(() => { setBillPending(initialBillPending); }, [initialBillPending]);

  async function handleCallWaiter() {
    if (calling || waiterPending) return;
    setError(null);
    setCalling(true);
    try {
      await onCallWaiter();
      setWaiterPending(true);
    } catch {
      setError("Failed to call waiter.");
    } finally {
      setCalling(false);
    }
  }

  async function handleRequestBill() {
    if (requestingBill || billPending) return;
    setError(null);
    setRequestingBill(true);
    try {
      await onRequestBill();
      setBillPending(true);
    } catch {
      setError("Failed to request bill.");
    } finally {
      setRequestingBill(false);
    }
  }

  if (!hasSession) return null;

  return (
    <div className="fixed bottom-4 right-4 z-20 flex flex-col items-end gap-2">
      {error && (
        <div className="rounded-md bg-status-error/10 px-3 py-2 text-xs text-status-error shadow-md">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          onClick={handleCallWaiter}
          disabled={calling || waiterPending}
          className={cn(
            "rounded-full px-4 py-2.5 shadow-md",
            waiterPending && "opacity-60"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            {waiterPending ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            )}
          </svg>
          <span className="text-sm font-medium">
            {waiterPending ? "Called" : "Call Waiter"}
          </span>
        </Button>
        {hasOrders && (
          <Button
            variant="secondary"
            onClick={handleRequestBill}
            disabled={requestingBill || billPending}
            className={cn(
              "rounded-full px-4 py-2.5 shadow-md",
              billPending && "opacity-60"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1.5"
            >
              {billPending ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <rect x="2" y="3" width="20" height="18" rx="2" />
                  <line x1="12" y1="9" x2="12" y2="15" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                </>
              )}
            </svg>
            <span className="text-sm font-medium">
              {billPending ? "Requested" : "Request Bill"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
