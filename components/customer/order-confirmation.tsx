"use client";

import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type OrderConfirmationProps = {
  open: boolean;
  onClose: () => void;
};

export function OrderConfirmation({
  open,
  onClose,
}: OrderConfirmationProps) {
  const { locale } = useLanguage();

  return (
    <Dialog open={open} onClose={onClose} title={t(locale, "order.confirmation.title")}>
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-success/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-center text-sm text-text-secondary">
          {t(locale, "order.confirmation.body")}
        </p>
      </div>
      <DialogActions>
        <Button onClick={onClose}>{t(locale, "order.continueBrowsing")}</Button>
      </DialogActions>
    </Dialog>
  );
}
