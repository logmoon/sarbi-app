"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ActionButtonsProps = {
  onCallWaiter: () => Promise<void>;
  onRequestBill: () => Promise<void>;
  hasSession: boolean;
};

export function ActionButtons({
  onCallWaiter,
  onRequestBill,
  hasSession,
}: ActionButtonsProps) {
  const [calling, setCalling] = useState(false);
  const [requestingBill, setRequestingBill] = useState(false);
  const [called, setCalled] = useState(false);
  const [billed, setBilled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCallWaiter() {
    if (calling || called) return;
    setError(null);
    setCalling(true);
    try {
      await onCallWaiter();
      setCalled(true);
      setTimeout(() => setCalled(false), 30000);
    } catch {
      setError("Failed to call waiter. Please try again.");
    } finally {
      setCalling(false);
    }
  }

  async function handleRequestBill() {
    if (requestingBill || billed) return;
    setError(null);
    setRequestingBill(true);
    try {
      await onRequestBill();
      setBilled(true);
    } catch {
      setError("Failed to request bill. Please try again.");
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
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={handleCallWaiter}
          disabled={calling || called}
          className="h-12 w-12 rounded-full p-0 shadow-md"
          aria-label={called ? "Waiter Called" : "Call Waiter"}
        >
          {called ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={handleRequestBill}
          disabled={requestingBill || billed}
          className="h-12 w-12 rounded-full p-0 shadow-md"
          aria-label={billed ? "Bill Requested" : "Request Bill"}
        >
          {billed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <line x1="12" y1="9" x2="12" y2="15" />
              <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
