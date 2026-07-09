"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LocaleFields = {
  en: string;
  fr: string;
  ar: string;
};

type CategoryFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: LocaleFields) => Promise<void>;
  initialValues?: LocaleFields;
  title: string;
};

const DEFAULT_NAME: LocaleFields = { en: "", fr: "", ar: "" };

export function CategoryFormDialog({
  open,
  onClose,
  onSave,
  initialValues,
  title,
}: CategoryFormDialogProps) {
  const [name, setName] = useState<LocaleFields>(DEFAULT_NAME);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialValues ?? DEFAULT_NAME);
      setError(null);
      setSaving(false);
    }
  }, [open, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.en.trim() || !name.fr.trim() || !name.ar.trim()) {
      setError("Name is required in all three languages.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(name);
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="English"
            value={name.en}
            onChange={(e) => setName({ ...name, en: e.target.value })}
            placeholder="Category name in English"
          />
          <Input
            label="French"
            value={name.fr}
            onChange={(e) => setName({ ...name, fr: e.target.value })}
            placeholder="Nom de la catégorie en français"
          />
          <Input
            label="Arabic"
            value={name.ar}
            onChange={(e) => setName({ ...name, ar: e.target.value })}
            placeholder="اسم الفئة بالعربية"
            dir="rtl"
          />
          {error && (
            <p className="text-xs text-status-error">{error}</p>
          )}
        </div>
        <DialogActions>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
