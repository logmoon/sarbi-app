"use client";

import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type AreYouWithModalProps = {
  open: boolean;
  customerName: string;
  onYes: () => void;
  onNo: () => void;
};

export function AreYouWithModal({
  open,
  customerName,
  onYes,
  onNo,
}: AreYouWithModalProps) {
  const { locale } = useLanguage();

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      title={t(locale, "customer.areYouWith", { name: customerName })}
    >
      <p className="text-sm text-text-secondary">
        {t(locale, "customer.areYouWithDesc", { name: customerName })}
      </p>
      <DialogActions>
        <Button variant="secondary" onClick={onNo}>
          {t(locale, "common.no")}
        </Button>
        <Button onClick={onYes}>{t(locale, "common.yes")}</Button>
      </DialogActions>
    </Dialog>
  );
}
