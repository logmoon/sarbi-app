"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

type LocaleFields = {
  en: string;
  fr: string;
  ar: string;
};

type ItemFormData = {
  name: LocaleFields;
  description: LocaleFields;
  price: string;
  image_url: string | null;
  is_available: boolean;
};

type ItemEditModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ItemFormData) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
  initialValues?: ItemFormData;
  title: string;
};

const languages = [
  {
    key: "en" as const,
    labelKey: "menu.english" as const,
    nameLabelKey: "menu.nameEnglish" as const,
    descLabelKey: "menu.descriptionEnglish" as const,
    placeholderKey: "menu.nameEnPlaceholder" as const,
    descPlaceholderKey: "menu.descriptionEnPlaceholder" as const,
  },
  {
    key: "fr" as const,
    labelKey: "menu.french" as const,
    nameLabelKey: "menu.nameFrench" as const,
    descLabelKey: "menu.descriptionFrench" as const,
    placeholderKey: "menu.nameFrPlaceholder" as const,
    descPlaceholderKey: "menu.descriptionFrPlaceholder" as const,
  },
  {
    key: "ar" as const,
    labelKey: "menu.arabic" as const,
    nameLabelKey: "menu.nameArabic" as const,
    descLabelKey: "menu.descriptionArabic" as const,
    placeholderKey: "menu.nameArPlaceholder" as const,
    descPlaceholderKey: "menu.descriptionArPlaceholder" as const,
    dir: "rtl" as const,
  },
];

const DEFAULT_FORM: ItemFormData = {
  name: { en: "", fr: "", ar: "" },
  description: { en: "", fr: "", ar: "" },
  price: "",
  image_url: null,
  is_available: true,
};

export function ItemEditModal({
  open,
  onClose,
  onSave,
  onUploadImage,
  initialValues,
  title,
}: ItemEditModalProps) {
  const { locale } = useLanguage();
  const [activeLang, setActiveLang] = useState<"en" | "fr" | "ar">("en");
  const [form, setForm] = useState<ItemFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialValues ?? DEFAULT_FORM);
      setActiveLang("en");
      setError(null);
      setSaving(false);
    }
  }, [open, initialValues]);

  const updateField = (
    locale: "en" | "fr" | "ar",
    field: "name" | "description",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [locale]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.en.trim() ||
      !form.name.fr.trim() ||
      !form.name.ar.trim()
    ) {
      setError(t(locale, "menu.nameRequired"));
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setError(t(locale, "menu.priceInvalid"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, price: price.toString() });
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
        <div className="mb-4 flex gap-1 border-b border-border">
          {languages.map((lang) => (
            <button
              key={lang.key}
              type="button"
              onClick={() => setActiveLang(lang.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeLang === lang.key
                  ? "border-b-2 border-accent text-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t(locale, lang.labelKey)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {languages.map((lang) =>
            activeLang === lang.key ? (
              <div key={lang.key} className="space-y-4">
                <Input
                  label={t(locale, lang.nameLabelKey)}
                  value={form.name[lang.key]}
                  onChange={(e) =>
                    updateField(lang.key, "name", e.target.value)
                  }
                  placeholder={t(locale, lang.placeholderKey)}
                  dir={lang.dir}
                />
                <Input
                  label={t(locale, lang.descLabelKey)}
                  value={form.description[lang.key]}
                  onChange={(e) =>
                    updateField(lang.key, "description", e.target.value)
                  }
                  placeholder={t(locale, lang.descPlaceholderKey)}
                  dir={lang.dir}
                />
              </div>
            ) : null
          )}

          <Input
            label={t(locale, "menu.price")}
            type="number"
            step="0.001"
            min="0"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder={t(locale, "menu.pricePlaceholder")}
          />

          <FileUpload
            locale={locale}
            label={t(locale, "menu.image")}
            currentUrl={form.image_url}
            onUpload={(file) => onUploadImage(file).then((url) => {
              setForm((prev) => ({ ...prev, image_url: url }));
              return url;
            })}
            onRemove={() => setForm((prev) => ({ ...prev, image_url: null }))}
            disabled={saving}
          />

          <Switch
            checked={form.is_available}
            onChange={(checked) =>
              setForm((prev) => ({ ...prev, is_available: checked }))
            }
            label={t(locale, "menu.available")}
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
