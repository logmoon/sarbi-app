"use client";

import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AreYouWithModalProps = {
  open: boolean;
  customerName: string;
  onYes: () => void;
  onNo: () => void;
};

export function AreYouWithModal({
  open,
  customerName,
  onYes,
  onNo,
}: AreYouWithModalProps) {
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      title={`Are you with ${customerName}?`}
    >
      <p className="text-sm text-text-secondary">
        There is an active session at this table. Are you with{" "}
        <strong className="text-text-primary">{customerName}</strong>?
      </p>
      <DialogActions>
        <Button variant="secondary" onClick={onNo}>
          No
        </Button>
        <Button onClick={onYes}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}
