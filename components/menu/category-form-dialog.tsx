"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

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
  const { locale } = useLanguage();
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
      setError(t(locale, "menu.nameRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(name);
      onClose();
    } catch {
      setError(t(locale, "menu.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label={t(locale, "menu.english")}
            value={name.en}
            onChange={(e) => setName({ ...name, en: e.target.value })}
            placeholder={t(locale, "menu.categoryNameEn")}
          />
          <Input
            label={t(locale, "menu.french")}
            value={name.fr}
            onChange={(e) => setName({ ...name, fr: e.target.value })}
            placeholder={t(locale, "menu.categoryNameFr")}
          />
          <Input
            label={t(locale, "menu.arabic")}
            value={name.ar}
            onChange={(e) => setName({ ...name, ar: e.target.value })}
            placeholder={t(locale, "menu.categoryNameAr")}
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
            {t(locale, "common.cancel")}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? t(locale, "common.saving") : t(locale, "common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
