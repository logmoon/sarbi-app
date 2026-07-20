"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { brandStyleVars } from "@/lib/brand";

export type SettingsData = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    brand_colors: { primary: string };
  };
  locations: Array<{
    id: string;
    name: string;
    address: string | null;
    session_timeout: number;
  }>;
  canEdit: boolean;
};

type ApiErrorResponse = { error: string; code?: string };

type SectionStatus = "idle" | "saving" | "saved" | "error";

function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function SettingsForm({ data }: { data: SettingsData }) {
  const { locale } = useLanguage();

  const [name, setName] = useState(data.tenant.name);
  const [primary, setPrimary] = useState(data.tenant.brand_colors.primary);

  const [locName, setLocName] = useState(data.locations[0]?.name ?? "");
  const [locAddress, setLocAddress] = useState(
    data.locations[0]?.address ?? ""
  );
  const [sessionTimeout, setSessionTimeout] = useState(
    data.locations[0]?.session_timeout ?? 150
  );

  const [tenantStatus, setTenantStatus] = useState<SectionStatus>("idle");
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<SectionStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);

  const primaryValid = isValidHex(primary);

  // Live preview: apply the current `primary` to a small block that
  // mirrors the accent tokens the customer page will receive. Updates
  // the instant the user picks a color.
  const previewVars = brandStyleVars({ primary });

  async function handleSaveTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!data.canEdit) return;
    if (!primaryValid) {
      setTenantError(t(locale, "settings.invalidColor"));
      return;
    }
    setTenantStatus("saving");
    setTenantError(null);
    try {
      const res = await fetch(`/api/tenants/${data.tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          // `primary` is the single source of truth for brand color in
          // V1. lib/brand.ts#brandStyleVars derives --color-accent,
          // --color-accent-hover, --color-accent-light, --color-accent-dark,
          // and --color-border-focus from it on the customer page. The
          // `accent` field is kept in the schema for forward-compat
          // (lib/validators.ts#brandColorsSchema) but the customer UI
          // does not read it today.
          brand_colors: { primary },
        }),
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(err.error);
      }
      setTenantStatus("saved");
      setTimeout(() => setTenantStatus("idle"), 2000);
    } catch (err) {
      setTenantError(
        err instanceof Error
          ? err.message
          : t(locale, "settings.saveFailed")
      );
      setTenantStatus("error");
    }
  }

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!data.canEdit) return;
    if (data.locations.length === 0) return;
    setLocationStatus("saving");
    setLocationError(null);
    try {
      const res = await fetch(`/api/locations/${data.locations[0].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locName,
          address: locAddress || null,
          session_timeout: sessionTimeout,
        }),
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(err.error);
      }
      setLocationStatus("saved");
      setTimeout(() => setLocationStatus("idle"), 2000);
    } catch (err) {
      setLocationError(
        err instanceof Error
          ? err.message
          : t(locale, "settings.saveFailed")
      );
      setLocationStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t(locale, "settings.title")}
        </h1>
        <p className="text-sm text-text-secondary">
          {t(locale, "settings.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t(locale, "settings.restaurant")}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveTenant} className="space-y-5">
            <Input
              label={t(locale, "settings.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(locale, "settings.namePlaceholder")}
              disabled={!data.canEdit || tenantStatus === "saving"}
              required
            />

            <div>
              <Label className="mb-2 block">
                {t(locale, "settings.brandColor")}
              </Label>
              <div className="max-w-md">
                <ColorField
                  label={t(locale, "settings.brandColor")}
                  value={primary}
                  onChange={setPrimary}
                  valid={primaryValid}
                  disabled={!data.canEdit}
                />
              </div>
            </div>

            <div
              className="rounded-sm border border-border bg-background p-4"
              style={previewVars}
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                {t(locale, "settings.brandPreview")}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-sm bg-accent px-3 py-1.5 text-xs font-semibold text-white">
                  {t(locale, "settings.previewButton")}
                </span>
                <span className="rounded-sm bg-accent-light px-3 py-1.5 text-xs font-semibold text-accent-dark">
                  {t(locale, "settings.previewLight")}
                </span>
                <button
                  type="button"
                  className="rounded-sm border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  {t(locale, "settings.previewFocus")}
                </button>
              </div>
            </div>

            {tenantError && (
              <p className="text-xs text-status-error">{tenantError}</p>
            )}
            {tenantStatus === "saved" && (
              <p className="text-xs text-status-success">
                {t(locale, "settings.saved")}
              </p>
            )}

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                disabled={
                  !data.canEdit ||
                  tenantStatus === "saving" ||
                  !primaryValid ||
                  name.trim().length === 0
                }
              >
                {tenantStatus === "saving"
                  ? t(locale, "common.saving")
                  : t(locale, "settings.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {data.locations.length > 0 && (
        <Card>
          <CardHeader className="mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {t(locale, "settings.location")}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveLocation} className="space-y-5">
              <Input
                label={t(locale, "settings.locationName")}
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                placeholder={t(locale, "settings.locationNamePlaceholder")}
                disabled={!data.canEdit || locationStatus === "saving"}
                required
              />
              <Input
                label={t(locale, "settings.address")}
                value={locAddress}
                onChange={(e) => setLocAddress(e.target.value)}
                placeholder={t(locale, "settings.addressPlaceholder")}
                disabled={!data.canEdit || locationStatus === "saving"}
              />
              <div>
                <Input
                  label={t(locale, "settings.sessionTimeout")}
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  value={String(sessionTimeout)}
                  onChange={(e) =>
                    setSessionTimeout(
                      Math.max(5, Math.min(720, Number(e.target.value) || 5))
                    )
                  }
                  disabled={!data.canEdit || locationStatus === "saving"}
                />
                <p className="mt-1 text-xs text-text-muted">
                  {t(locale, "settings.sessionTimeoutHelp")}
                </p>
              </div>

              {locationError && (
                <p className="text-xs text-status-error">{locationError}</p>
              )}
              {locationStatus === "saved" && (
                <p className="text-xs text-status-success">
                  {t(locale, "settings.saved")}
                </p>
              )}

              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  disabled={
                    !data.canEdit ||
                    locationStatus === "saving" ||
                    locName.trim().length === 0
                  }
                >
                  {locationStatus === "saving"
                    ? t(locale, "common.saving")
                    : t(locale, "settings.save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!data.canEdit && (
        <p className="text-center text-xs text-text-muted">
          Only owners can edit settings.
        </p>
      )}
    </div>
  );
}

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  valid: boolean;
  disabled: boolean;
};

function ColorField({ label, value, onChange, valid, disabled }: ColorFieldProps) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={disabled}
          aria-label={label}
          className={cn(
            "h-10 w-12 cursor-pointer rounded-sm border border-border bg-surface p-0.5",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={`${label} hex`}
          className={cn(
            "flex-1 rounded-sm border bg-surface px-3 py-2 text-sm text-text-primary font-mono",
            "focus:outline-none focus:ring-2 focus:ring-border-focus",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            valid ? "border-border" : "border-status-error"
          )}
        />
      </div>
    </div>
  );
}
