"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TableData = {
  id: string;
  label: string;
  public_code: string;
  qr_code_url: string | null;
  is_active: boolean;
  has_active_session: boolean;
};

type TableCardProps = {
  table: TableData;
  onEdit: (table: TableData) => void;
  onDelete: (id: string) => void;
};

function getStatus(table: TableData) {
  if (!table.is_active) return "inactive" as const;
  if (table.has_active_session) return "occupied" as const;
  return "available" as const;
}

type Status = ReturnType<typeof getStatus>;

const statusConfig: Record<Status, { label: string; badge: string; border: string; dim: boolean }> = {
  occupied: {
    label: "Occupied",
    badge: "bg-status-success/10 text-status-success",
    border: "border-l-status-success",
    dim: false,
  },
  available: {
    label: "Available",
    badge: "bg-text-muted/10 text-text-muted",
    border: "border-l-border",
    dim: false,
  },
  inactive: {
    label: "Inactive",
    badge: "bg-text-muted/10 text-text-muted",
    border: "border-l-text-muted",
    dim: true,
  },
};

export function TableCard({ table, onEdit, onDelete }: TableCardProps) {
  const [qrSvg, setQrSvg] = useState<string>("");
  const [qrError, setQrError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = getStatus(table);
  const config = statusConfig[status];

  useEffect(() => {
    if (!table.qr_code_url) {
      setQrError("No QR code URL");
      return;
    }
    let cancelled = false;
    QRCode.toString(table.qr_code_url, {
      type: "svg",
      width: 200,
      margin: 1,
      color: { dark: "#111827", light: "#FFFFFF" },
    })
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setQrError("Failed to load QR");
      });
    return () => { cancelled = true; };
  }, [table.qr_code_url]);

  const downloadPNG = async () => {
    if (!table.qr_code_url) return;
    try {
      const url = await QRCode.toDataURL(table.qr_code_url, {
        width: 400,
        margin: 2,
      });
      const link = document.createElement("a");
      link.href = url;
      link.download = `${table.label.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
      link.click();
    } catch {
      setQrError("Failed to generate PNG");
    }
  };

  const downloadSVG = async () => {
    if (!table.qr_code_url) return;
    try {
      const svg = await QRCode.toString(table.qr_code_url, {
        type: "svg",
        width: 400,
        margin: 2,
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${table.label.replace(/\s+/g, "-").toLowerCase()}-qr.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setQrError("Failed to generate SVG");
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(table.public_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col border-l-4 transition-opacity",
        config.border,
        config.dim && "opacity-60"
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            {table.label}
          </h3>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
              config.badge
            )}
          >
            {config.label}
          </span>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            className="h-8 w-8 min-w-0 p-0"
            onClick={() => onEdit(table)}
            aria-label={`Edit ${table.label}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 min-w-0 p-0 text-status-error hover:text-status-error"
            onClick={() => onDelete(table.id)}
            aria-label={`Delete ${table.label}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-col items-center justify-center">
        {qrError ? (
          <div className="flex h-28 w-28 items-center justify-center rounded-sm bg-status-error/10">
            <span className="text-xs text-status-error">{qrError}</span>
          </div>
        ) : qrSvg ? (
          <div
            className="flex h-28 w-28 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-sm bg-background">
            <span className="text-xs text-text-muted">Loading...</span>
          </div>
        )}

        <button
          onClick={() => setShowCode(!showCode)}
          className="mt-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>

        {showCode && (
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-xs text-text-muted">
              {table.public_code}
            </span>
            <button
              onClick={copyCode}
              className="rounded-sm p-0.5 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <Button
          variant="secondary"
          className="flex-1 text-xs"
          onClick={downloadPNG}
        >
          PNG
        </Button>
        <Button
          variant="secondary"
          className="flex-1 text-xs"
          onClick={downloadSVG}
        >
          SVG
        </Button>
      </div>
    </Card>
  );
}
