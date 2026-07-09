"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
  { key: "en" as const, label: "English", placeholder: "In English" },
  { key: "fr" as const, label: "French", placeholder: "En français" },
  { key: "ar" as const, label: "Arabic", placeholder: "بالعربية", dir: "rtl" as const },
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
  const [activeLang, setActiveLang] = useState<"en" | "fr" | "ar">("en");
  const [form, setForm] = useState<ItemFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialValues ?? DEFAULT_FORM);
      setActiveLang("en");
      setError(null);
      setSaving(false);
      setUploading(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch {
      setError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.en.trim() ||
      !form.name.fr.trim() ||
      !form.name.ar.trim()
    ) {
      setError("Name is required in all three languages.");
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setError("Price must be a positive number.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, price: price.toString() });
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
              {lang.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {languages.map((lang) =>
            activeLang === lang.key ? (
              <div key={lang.key} className="space-y-4">
                <Input
                  label={`Name (${lang.label})`}
                  value={form.name[lang.key]}
                  onChange={(e) =>
                    updateField(lang.key, "name", e.target.value)
                  }
                  placeholder={`Item name ${lang.placeholder}`}
                  dir={lang.dir}
                />
                <Input
                  label={`Description (${lang.label})`}
                  value={form.description[lang.key]}
                  onChange={(e) =>
                    updateField(lang.key, "description", e.target.value)
                  }
                  placeholder={`Description ${lang.placeholder}`}
                  dir={lang.dir}
                />
              </div>
            ) : null
          )}

          <Input
            label="Price (TND)"
            type="number"
            step="0.001"
            min="0"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder="e.g. 4.500"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Image
            </label>
            {form.image_url && (
              <div className="mb-2 overflow-hidden rounded-sm">
                <img
                  src={form.image_url}
                  alt="Item"
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-sm file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
              />
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image_url: null }))}
                  className="rounded-sm border border-border px-3 py-1.5 text-sm text-status-error hover:bg-background"
                >
                  Remove
                </button>
              )}
            </div>
            {uploading && (
              <p className="mt-1 text-xs text-text-muted">Uploading...</p>
            )}
          </div>

          <Switch
            checked={form.is_available}
            onChange={(checked) =>
              setForm((prev) => ({ ...prev, is_available: checked }))
            }
            label="Available"
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
            disabled={saving || uploading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
