"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type NamePromptModalProps = {
  open: boolean;
  title: string;
  placeholder: string;
  submitLabel: string;
  onConfirm: (name: string) => void;
};

export function NamePromptModal({
  open,
  title,
  placeholder,
  submitLabel,
  onConfirm,
}: NamePromptModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const noop = useCallback(() => {}, []);
  const { locale } = useLanguage();

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t(locale, "customer.nameRequired"));
      return;
    }
    if (trimmed.length > 100) {
      setError(t(locale, "customer.nameTooLong"));
      return;
    }
    onConfirm(trimmed);
    setName("");
    setError("");
  }

  return (
    <Dialog open={open} onClose={noop} title={title}>
      <Input
        label={title}
        placeholder={placeholder}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        error={error}
        autoComplete="name"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <DialogActions>
        <Button onClick={handleSubmit}>{submitLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}
