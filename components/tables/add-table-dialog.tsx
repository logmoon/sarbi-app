"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTableSchema } from "@/lib/validators";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type AddTableDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (label: string) => Promise<void>;
};

export function AddTableDialog({ open, onClose, onSave }: AddTableDialogProps) {
  const { locale } = useLanguage();
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
      setError(err instanceof Error ? err.message : t(locale, "table.failedToCreate"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t(locale, "table.addTableTitle")}>
      <Input
        label={t(locale, "table.label")}
        placeholder={t(locale, "table.labelPlaceholder")}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        error={error ?? undefined}
        disabled={saving}
      />
      <DialogActions>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          {t(locale, "common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !label.trim()}>
          {saving ? t(locale, "table.adding") : t(locale, "table.addTableTitle")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
