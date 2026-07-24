"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  type MenuTheme,
  type SurfaceTone,
  type FontPreset,
  type LayoutPreset,
} from "@/lib/brand";
import { MenuThemePreview } from "@/components/settings/menu-theme-preview";

export type SettingsData = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    cover_url: string | null;
    brand_colors: MenuTheme;
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

const SURFACE_OPTIONS: { value: SurfaceTone; labelKey: string; swatch: string }[] = [
  { value: "light", labelKey: "settings.surfaceLight", swatch: "#F8F9FA" },
  { value: "warm", labelKey: "settings.surfaceWarm", swatch: "#FAF5EC" },
  { value: "sage", labelKey: "settings.surfaceSage", swatch: "#F3F6F1" },
  { value: "blush", labelKey: "settings.surfaceBlush", swatch: "#FAF1F0" },
  { value: "slate", labelKey: "settings.surfaceSlate", swatch: "#F1F3F5" },
  { value: "dark", labelKey: "settings.surfaceDark", swatch: "#111827" },
];

const FONT_OPTIONS: { value: FontPreset; labelKey: string; cssVar: string }[] = [
  { value: "modern", labelKey: "settings.fontModern", cssVar: "var(--font-inter)" },
  { value: "classic", labelKey: "settings.fontClassic", cssVar: "var(--font-playfair)" },
  { value: "playful", labelKey: "settings.fontPlayful", cssVar: "var(--font-quicksand)" },
  { value: "bold", labelKey: "settings.fontBold", cssVar: "var(--font-fraunces)" },
];

const LAYOUT_OPTIONS: { value: LayoutPreset; labelKey: string }[] = [
  { value: "grid", labelKey: "settings.layoutGrid" },
  { value: "compact", labelKey: "settings.layoutCompact" },
  { value: "magazine", labelKey: "settings.layoutMagazine" },
];

export function SettingsForm({ data }: { data: SettingsData }) {
  const { locale } = useLanguage();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState(data.tenant.name);
  const [nameStatus, setNameStatus] = useState<SectionStatus>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [primary, setPrimary] = useState(data.tenant.brand_colors.primary);
  const [surface, setSurface] = useState<SurfaceTone>(
    data.tenant.brand_colors.surface ?? "light"
  );
  const [font, setFont] = useState<FontPreset>(
    data.tenant.brand_colors.font ?? "modern"
  );
  const [layout, setLayout] = useState<LayoutPreset>(
    data.tenant.brand_colors.layout ?? "grid"
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(data.tenant.logo_url);
  const [coverUrl, setCoverUrl] = useState<string | null>(data.tenant.cover_url);
  const [themeStatus, setThemeStatus] = useState<SectionStatus>("idle");
  const [themeError, setThemeError] = useState<string | null>(null);

  const [locName, setLocName] = useState(data.locations[0]?.name ?? "");
  const [locAddress, setLocAddress] = useState(
    data.locations[0]?.address ?? ""
  );
  const [sessionTimeout, setSessionTimeout] = useState(
    data.locations[0]?.session_timeout ?? 150
  );
  const [locationStatus, setLocationStatus] = useState<SectionStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);

  const primaryValid = isValidHex(primary);
  const previewTheme: MenuTheme = { primary, surface, font, layout };

  async function uploadTenantImage(file: File, prefix: "logos" | "covers"): Promise<string> {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { data: uploadData, error } = await supabase.storage
      .from("menu-images")
      .upload(`${prefix}/${fileName}`, file, {
        contentType: file.type,
        upsert: true,
      });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage
      .from("menu-images")
      .getPublicUrl(uploadData.path);
    return urlData.publicUrl;
  }

  async function handleUploadLogo(file: File): Promise<string> {
    const url = await uploadTenantImage(file, "logos");
    setLogoUrl(url);
    return url;
  }

  async function handleUploadCover(file: File): Promise<string> {
    const url = await uploadTenantImage(file, "covers");
    setCoverUrl(url);
    return url;
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!data.canEdit) return;
    setNameStatus("saving");
    setNameError(null);
    try {
      const res = await fetch(`/api/tenants/${data.tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(err.error);
      }
      setNameStatus("saved");
      setTimeout(() => setNameStatus("idle"), 2000);
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : t(locale, "settings.saveFailed")
      );
      setNameStatus("error");
    }
  }

  async function handleSaveTheme(e: React.FormEvent) {
    e.preventDefault();
    if (!data.canEdit) return;
    if (!primaryValid) {
      setThemeError(t(locale, "settings.invalidColor"));
      return;
    }
    setThemeStatus("saving");
    setThemeError(null);
    try {
      const res = await fetch(`/api/tenants/${data.tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // `primary` is the single source of truth for brand color.
          // lib/brand.ts#themeStyleVars derives --color-accent,
          // --color-accent-hover, --color-accent-light, --color-accent-dark,
          // --color-border-focus, the surface-tone overrides, and
          // --font-heading from these four fields on the customer page.
          brand_colors: { primary, surface, font, layout },
          logo_url: logoUrl,
          cover_url: coverUrl,
        }),
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(err.error);
      }
      setThemeStatus("saved");
      setTimeout(() => setThemeStatus("idle"), 2000);
    } catch (err) {
      setThemeError(
        err instanceof Error ? err.message : t(locale, "settings.saveFailed")
      );
      setThemeStatus("error");
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
    <div className="mx-auto max-w-5xl space-y-6">
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
          <form onSubmit={handleSaveName} className="space-y-5">
            <Input
              label={t(locale, "settings.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(locale, "settings.namePlaceholder")}
              disabled={!data.canEdit || nameStatus === "saving"}
              required
            />

            {nameError && (
              <p className="text-xs text-status-error">{nameError}</p>
            )}
            {nameStatus === "saved" && (
              <p className="text-xs text-status-success">
                {t(locale, "settings.saved")}
              </p>
            )}

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                disabled={
                  !data.canEdit ||
                  nameStatus === "saving" ||
                  name.trim().length === 0
                }
              >
                {nameStatus === "saving"
                  ? t(locale, "common.saving")
                  : t(locale, "settings.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t(locale, "settings.menuTheme")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t(locale, "settings.menuThemeDesc")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveTheme} className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">
                    {t(locale, "settings.brandColor")}
                  </Label>
                  <ColorField
                    label={t(locale, "settings.brandColor")}
                    value={primary}
                    onChange={setPrimary}
                    valid={primaryValid}
                    disabled={!data.canEdit}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    {t(locale, "settings.surfaceTone")}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SURFACE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!data.canEdit}
                        onClick={() => setSurface(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-sm border px-2 py-2.5 text-xs",
                          surface === opt.value
                            ? "border-accent bg-accent-light text-accent-dark"
                            : "border-border bg-surface text-text-primary hover:bg-background",
                          !data.canEdit && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-border"
                          style={{ backgroundColor: opt.swatch }}
                        />
                        {t(locale, opt.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    {t(locale, "settings.fontPreset")}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!data.canEdit}
                        onClick={() => setFont(opt.value)}
                        style={{ fontFamily: opt.cssVar }}
                        className={cn(
                          "rounded-sm border px-3 py-2.5 text-sm",
                          font === opt.value
                            ? "border-accent bg-accent-light text-accent-dark"
                            : "border-border bg-surface text-text-primary hover:bg-background",
                          !data.canEdit && "cursor-not-allowed opacity-50"
                        )}
                      >
                        {t(locale, opt.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    {t(locale, "settings.layoutStyle")}
                  </Label>
                  <div className="flex gap-2">
                    {LAYOUT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!data.canEdit}
                        onClick={() => setLayout(opt.value)}
                        className={cn(
                          "flex-1 rounded-sm border px-3 py-2.5 text-sm",
                          layout === opt.value
                            ? "border-accent bg-accent-light text-accent-dark"
                            : "border-border bg-surface text-text-primary hover:bg-background",
                          !data.canEdit && "cursor-not-allowed opacity-50"
                        )}
                      >
                        {t(locale, opt.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FileUpload
                    locale={locale}
                    label={t(locale, "settings.logo")}
                    currentUrl={logoUrl}
                    onUpload={handleUploadLogo}
                    onRemove={() => setLogoUrl(null)}
                    disabled={!data.canEdit}
                  />
                  <FileUpload
                    locale={locale}
                    label={t(locale, "settings.coverImage")}
                    currentUrl={coverUrl}
                    onUpload={handleUploadCover}
                    onRemove={() => setCoverUrl(null)}
                    disabled={!data.canEdit}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">
                  {t(locale, "settings.livePreview")}
                </Label>
                <MenuThemePreview
                  theme={previewTheme}
                  tenantName={name}
                  logoUrl={logoUrl}
                  coverUrl={coverUrl}
                />
              </div>
            </div>

            {themeError && (
              <p className="text-xs text-status-error">{themeError}</p>
            )}
            {themeStatus === "saved" && (
              <p className="text-xs text-status-success">
                {t(locale, "settings.saved")}
              </p>
            )}

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                disabled={
                  !data.canEdit || themeStatus === "saving" || !primaryValid
                }
              >
                {themeStatus === "saving"
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
  );
}
