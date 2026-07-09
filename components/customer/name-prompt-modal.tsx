"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name");
      return;
    }
    if (trimmed.length > 100) {
      setError("Name is too long");
      return;
    }
    onConfirm(trimmed);
    setName("");
    setError("");
  }

  return (
    <Dialog open={open} onClose={() => {}} title={title}>
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
