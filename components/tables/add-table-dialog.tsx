"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTableSchema } from "@/lib/validators";

type AddTableDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (label: string) => Promise<void>;
};

export function AddTableDialog({ open, onClose, onSave }: AddTableDialogProps) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const result = createTableSchema.safeParse({ label });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    try {
      await onSave(label);
      setLabel("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create table");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Table">
      <Input
        label="Table Label"
        placeholder="e.g. Table 5, Terrasse A"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        error={error ?? undefined}
        disabled={saving}
      />
      <DialogActions>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !label.trim()}>
          {saving ? "Adding..." : "Add Table"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
