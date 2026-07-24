"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: DialogProps) {
  const { locale } = useLanguage();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Callers typically pass `onClose={() => setOpen(false)}` inline, so its
  // identity changes on every parent re-render (e.g. every keystroke in a
  // form inside the dialog). Reading it through a ref — instead of putting
  // it in the effect's dependency array — keeps the open/close-only effect
  // below from re-running (and re-stealing focus) on unrelated re-renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      trapFocus(e);
    };

    document.addEventListener("keydown", handleKeyDown);

    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const input = dialog.querySelector<HTMLElement>("input:not([disabled]), textarea:not([disabled])");
      if (input) {
        input.focus();
      } else {
        dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
      }
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
    // Intentionally only re-runs on open/close transitions — see onCloseRef
    // comment above for why onClose is deliberately excluded here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, trapFocus]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-5 shadow-lg",
          className
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-sm p-1 text-text-muted hover:bg-background hover:text-text-primary"
              aria-label={t(locale, "common.close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

type DialogActionsProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogActions({
  className,
  children,
}: DialogActionsProps) {
  return (
    <div
      className={cn("mt-6 flex items-center justify-end gap-2", className)}
    >
      {children}
    </div>
  );
}
