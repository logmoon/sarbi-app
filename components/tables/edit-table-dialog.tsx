"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateTableSchema } from "@/lib/validators";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import type { TableData } from "@/components/tables/table-card";

type EditTableDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { label?: string; is_active?: boolean }) => Promise<void>;
  table: TableData;
};

export function EditTableDialog({ open, onClose, onSave, table }: EditTableDialogProps) {
  const { locale } = useLanguage();
  const [label, setLabel] = useState(table.label);
  const [isActive, setIsActive] = useState(table.is_active);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLabel(table.label);
      setIsActive(table.is_active);
      setError(null);
    }
  }, [open, table]);

  const handleSubmit = async () => {
    setError(null);
    const data: { label?: string; is_active?: boolean } = {};
    if (label !== table.label) data.label = label;
    if (isActive !== table.is_active) data.is_active = isActive;

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }

    const result = updateTableSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? t(locale, "table.failedToUpdate"));
      return;
    }

    setSaving(true);
    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "table.failedToUpdate"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t(locale, "table.edit", { label: table.label })}>
      <div className="space-y-4">
        <Input
          label={t(locale, "table.label")}
          placeholder={t(locale, "table.labelPlaceholder")}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={saving}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-primary">{t(locale, "table.active")}</span>
          <Switch
            checked={isActive}
            onChange={setIsActive}
          />
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-status-error">{error}</p>
      )}
      <DialogActions>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          {t(locale, "common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? t(locale, "common.saving") : t(locale, "common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
