"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CancelReasonCode } from "@/lib/validators";

type CancelOrderModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reasonCode: CancelReasonCode, reasonNote?: string) => void;
  loading?: boolean;
  tableLabel: string;
};

const REASONS: { value: CancelReasonCode; label: string }[] = [
  { value: "out_of_stock", label: "Out of stock" },
  { value: "kitchen_error", label: "Kitchen error" },
  { value: "other", label: "Other" },
];

export function CancelOrderModal({
  open,
  onClose,
  onConfirm,
  loading,
  tableLabel,
}: CancelOrderModalProps): React.ReactNode {
  const [reasonCode, setReasonCode] = useState<CancelReasonCode>("out_of_stock");
  const [reasonNote, setReasonNote] = useState("");

  const handleClose = () => {
    setReasonCode("out_of_stock");
    setReasonNote("");
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reasonCode, reasonCode === "other" ? reasonNote : undefined);
  };

  const canConfirm = reasonCode !== "other" || reasonNote.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleClose} title={`Cancel order — ${tableLabel}`}>
      <p className="mb-4 text-sm text-text-secondary">
        This order will be removed from the kitchen queue. Choose a reason:
      </p>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Cancellation reason">
        {REASONS.map((reason) => (
          <label
            key={reason.value}
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 text-sm",
              reasonCode === reason.value
                ? "border-accent bg-accent-light text-text-primary"
                : "border-border text-text-secondary hover:bg-background"
            )}
          >
            <input
              type="radio"
              name="cancel-reason"
              value={reason.value}
              checked={reasonCode === reason.value}
              onChange={() => setReasonCode(reason.value)}
              className="h-4 w-4 accent-accent"
            />
            {reason.label}
          </label>
        ))}
      </div>

      {reasonCode === "other" && (
        <div className="mt-3">
          <Input
            label="Details"
            placeholder="What happened?"
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
          />
        </div>
      )}

      <DialogActions>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Keep order
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={loading || !canConfirm}
        >
          {loading ? "Cancelling..." : "Cancel order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
