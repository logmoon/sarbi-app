"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import type { CancelReasonCode } from "@/lib/validators";

type CancelOrderModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reasonCode: CancelReasonCode, reasonNote?: string) => void;
  loading?: boolean;
  tableLabel: string;
};

const REASONS: { value: CancelReasonCode; i18nKey: string }[] = [
  { value: "out_of_stock", i18nKey: "kds.cancelReason.outOfStock" },
  { value: "kitchen_error", i18nKey: "kds.cancelReason.kitchenError" },
  { value: "other", i18nKey: "kds.cancelReason.other" },
];

export function CancelOrderModal({
  open,
  onClose,
  onConfirm,
  loading,
  tableLabel,
}: CancelOrderModalProps): React.ReactNode {
  const [reasonCode, setReasonCode] = useState<CancelReasonCode>("out_of_stock");
  const [reasonNote, setReasonNote] = useState("");
  const { locale } = useLanguage();

  const handleClose = () => {
    setReasonCode("out_of_stock");
    setReasonNote("");
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reasonCode, reasonCode === "other" ? reasonNote : undefined);
  };

  const canConfirm = reasonCode !== "other" || reasonNote.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleClose} title={t(locale, "kds.cancelTitle", { table: tableLabel })}>
      <p className="mb-4 text-sm text-text-secondary">
        {t(locale, "kds.cancelBody")}
      </p>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label={t(locale, "kds.cancelReasonAria")}>
        {REASONS.map((reason) => (
          <label
            key={reason.value}
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 text-sm",
              reasonCode === reason.value
                ? "border-accent bg-accent-light text-text-primary"
                : "border-border text-text-secondary hover:bg-background"
            )}
          >
            <input
              type="radio"
              name="cancel-reason"
              value={reason.value}
              checked={reasonCode === reason.value}
              onChange={() => setReasonCode(reason.value)}
              className="h-4 w-4 accent-accent"
            />
            {t(locale, reason.i18nKey)}
          </label>
        ))}
      </div>

      {reasonCode === "other" && (
        <div className="mt-3">
          <Input
            label={t(locale, "kds.cancelDetails")}
            placeholder={t(locale, "kds.cancelDetailsPlaceholder")}
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
          />
        </div>
      )}

      <DialogActions>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          {t(locale, "kds.keepOrder")}
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={loading || !canConfirm}
        >
          {loading ? t(locale, "kds.cancelling") : t(locale, "kds.cancelOrder")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
