"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n";

type FileUploadProps = {
  locale: Locale;
  label?: string;
  accept?: string;
  currentUrl?: string | null;
  currentName?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove: () => void;
  disabled?: boolean;
};

export function FileUpload({
  locale,
  label,
  accept = "image/*",
  currentUrl,
  currentName,
  onUpload,
  onRemove,
  disabled,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeCurrent = () => {
    setSelectedFile(null);
    setError(null);
    onRemove();
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch {
      setError(t(locale, "common.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = currentUrl || (selectedFile && selectedFile.type.startsWith("image/"));

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-text-secondary">{label}</p>
      )}

      {currentUrl && isImage && (
        <div className="mb-2 overflow-hidden rounded-sm">
          <img
            src={currentUrl}
            alt={currentName ?? ""}
            className="h-32 w-full object-cover"
          />
        </div>
      )}

      {currentUrl && !isImage && currentName && (
        <p className="mb-2 truncate text-sm text-text-muted">{currentName}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {!selectedFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              setSelectedFile(file);
              setError(null);
            }
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed px-4 py-5 text-center transition-colors",
            dragOver
              ? "border-accent bg-accent-light"
              : "border-border hover:border-accent hover:bg-background",
            (disabled || uploading) && "pointer-events-none opacity-50"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-muted"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-sm text-text-secondary">
            {currentUrl
              ? t(locale, "common.replaceImage")
              : t(locale, "common.uploadImage")}
          </span>
          <span className="text-xs text-text-muted">
            {t(locale, "common.dragOrClick")}
          </span>
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
            {selectedFile.name}
          </span>
          <span className="shrink-0 text-xs text-text-muted">
            {formatFileSize(selectedFile.size)}
          </span>
          <button
            type="button"
            onClick={cancelSelection}
            disabled={uploading}
            className="shrink-0 rounded-sm p-1 text-text-muted hover:text-text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className={cn(
              "shrink-0 rounded-sm px-3 py-1 text-sm font-medium text-white",
              uploading ? "bg-accent opacity-50" : "bg-accent hover:bg-accent-hover"
            )}
          >
            {uploading ? t(locale, "common.uploading") : t(locale, "common.save")}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-status-error">{error}</p>
      )}

      {currentUrl && (
        <button
          type="button"
          onClick={removeCurrent}
          disabled={disabled || uploading}
          className="mt-2 rounded-sm border border-border px-3 py-1.5 text-sm text-status-error hover:bg-background disabled:opacity-50"
        >
          {t(locale, "common.remove")}
        </button>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
