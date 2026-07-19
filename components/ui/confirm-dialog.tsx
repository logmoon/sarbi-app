"use client";

import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loadingLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  loadingLabel,
  variant = "danger",
  loading,
}: ConfirmDialogProps) {
  const { locale } = useLanguage();
  const cancelLabel = t(locale, "common.cancel");
  const resolvedConfirmLabel = confirmLabel ?? t(locale, "common.delete");
  const resolvedLoadingLabel = loadingLabel ?? t(locale, "common.deleting");
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-sm text-text-secondary">{message}</p>
      <DialogActions>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? resolvedLoadingLabel : resolvedConfirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
