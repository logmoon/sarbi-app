"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export type StaffMember = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "owner" | "location_manager" | "kitchen" | "floor";
  location_id: string | null;
  is_active: boolean;
  has_auth: boolean;
  created_at: string;
  location_name: string | null;
};

export type StaffLocation = {
  id: string;
  name: string;
};

type StaffManagerProps = {
  members: StaffMember[];
  locations: StaffLocation[];
  canManage: boolean;
  currentUserId: string;
  tenantId: string;
};

type InviteResult = {
  id: string;
  email: string;
  name: string;
  role: string;
  location_id: string | null;
  invite_url: string;
  email_sent: boolean;
  email_error: string | null;
};

type ApiErrorResponse = { error: string; code?: string };

function translateError(
  locale: ReturnType<typeof useLanguage>["locale"],
  code?: string
): string {
  if (!code) return t(locale, "staff.error.GENERIC");
  const key = `staff.error.${code}`;
  const value = t(locale, key);
  // t() returns the key itself when missing — fall back to a generic
  // translated message so the user never sees a raw key in the UI.
  if (value === key) return t(locale, "staff.error.GENERIC");
  return value;
}

const ROLES: Array<StaffMember["role"]> = [
  "owner",
  "location_manager",
  "kitchen",
  "floor",
];

export function StaffManager({
  members: initialMembers,
  locations,
  canManage,
  currentUserId,
  tenantId,
}: StaffManagerProps) {
  const { locale } = useLanguage();
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffMember["role"]>("kitchen");
  const [inviteLocationId, setInviteLocationId] = useState(locations[0]?.id ?? "");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(translateError(locale, err.code));
      }
      const json: { data: StaffMember[] } = await res.json();
      setMembers(json.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t(locale, "staff.failedToLoad")
      );
    }
  }, [locale]);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<
      ReturnType<typeof createClient>["channel"]
    > | null = null;

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`staff-tenant-${tenantId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "staff",
            filter: `tenant_id=eq.${tenantId}`,
          },
          () => {
            fetchMembers();
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tenantId, fetchMembers]);

  useEffect(() => {
    if (inviteOpen) {
      setInviteEmail("");
      setInviteName("");
      setInviteRole("kitchen");
      setInviteLocationId(locations[0]?.id ?? "");
      setInviteResult(null);
      setLinkCopied(false);
      setError(null);
    }
  }, [inviteOpen, locations]);

  const needsLocation = inviteRole !== "owner";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviting(true);
    try {
      const body: {
        email: string;
        name: string;
        role: string;
        location_id?: string;
      } = {
        email: inviteEmail.trim(),
        name: inviteName.trim(),
        role: inviteRole,
      };
      if (needsLocation && inviteLocationId) {
        body.location_id = inviteLocationId;
      }
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(translateError(locale, err.code));
      }
      const json: { data: InviteResult; message: string } = await res.json();
      setInviteResult(json.data);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "staff.failedToInvite"));
    } finally {
      setInviting(false);
    }
  }

  async function handleToggleActive(member: StaffMember) {
    setActionLoadingId(member.id);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_active",
          is_active: !member.is_active,
        }),
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(translateError(locale, err.code));
      }
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "staff.failedToUpdate"));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleResendInvite(member: StaffMember) {
    setActionLoadingId(member.id);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_invite" }),
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(translateError(locale, err.code));
      }
      const json: { data: InviteResult; message: string } = await res.json();
      setInviteResult(json.data);
      setInviteOpen(true);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "staff.failedToUpdate"));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemoveInvite() {
    if (!removeTarget) return;
    setRemoving(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${removeTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(translateError(locale, err.code));
      }
      setRemoveTarget(null);
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "staff.failedToRemove"));
    } finally {
      setRemoving(false);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Some browsers in non-secure contexts (or no clipboard API) — fall through
    }
  }

  function statusOf(member: StaffMember): "active" | "pending" | "inactive" {
    if (!member.is_active) return "inactive";
    return member.has_auth ? "active" : "pending";
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-sm border border-status-error bg-status-error/10 p-3 text-sm text-status-error">
          {error}
          <button
            className="ms-2 underline"
            onClick={() => setError(null)}
          >
            {t(locale, "common.dismiss")}
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t(locale, "staff.title")}
          </h1>
          <p className="text-sm text-text-secondary">
            {t(locale, "staff.subtitle")}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteOpen(true)}>
            {t(locale, "staff.add")}
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-text-primary">
            {t(locale, "staff.empty")}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {t(locale, "staff.emptyDesc")}
          </p>
          {canManage && (
            <Button className="mt-4" onClick={() => setInviteOpen(true)}>
              {t(locale, "staff.add")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const isYou = member.id === currentUserId;
            const status = statusOf(member);
            const isLoading = actionLoadingId === member.id;
            return (
              <Card key={member.id}>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary">
                          {member.name}
                          {isYou && (
                            <span className="ms-2 text-xs font-normal text-text-muted">
                              (you)
                            </span>
                          )}
                        </p>
                        <StatusBadge status={status} locale={locale} />
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {member.email}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        <RoleLabel role={member.role} locale={locale} />
                        {member.location_name && (
                          <> · {member.location_name}</>
                        )}
                      </p>
                    </div>
                    {canManage && !isYou && (
                      <div className="flex flex-wrap gap-2">
                        {status === "active" && (
                          <Button
                            variant="secondary"
                            onClick={() => handleToggleActive(member)}
                            disabled={isLoading}
                            className="text-xs"
                          >
                            {t(locale, "staff.deactivate")}
                          </Button>
                        )}
                        {status === "inactive" && (
                          <Button
                            variant="secondary"
                            onClick={() => handleToggleActive(member)}
                            disabled={isLoading}
                            className="text-xs"
                          >
                            {t(locale, "staff.activate")}
                          </Button>
                        )}
                        {status === "pending" && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => handleResendInvite(member)}
                              disabled={isLoading}
                              className="text-xs"
                            >
                              {t(locale, "staff.resendInvite")}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setRemoveTarget(member)}
                              disabled={isLoading}
                              className="text-xs"
                            >
                              {t(locale, "staff.removeInvite")}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t(locale, "staff.inviteTitle")}
      >
        {inviteResult ? (
          <div className="space-y-4">
            <div
              className={cn(
                "rounded-sm border px-3 py-2 text-sm",
                inviteResult.email_sent
                  ? "border-status-success bg-status-success/10 text-status-success"
                  : "border-status-warning bg-status-warning/10 text-status-warning"
              )}
            >
              {inviteResult.email_sent
                ? t(locale, "staff.inviteSent")
                : t(locale, "staff.inviteEmailFailed")}
            </div>
            <div>
              <Label className="mb-1.5 block">
                {t(locale, "staff.inviteLink")}
              </Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteResult.invite_url}
                  className="flex-1 rounded-sm border border-border bg-surface px-3 py-2 text-xs text-text-primary font-mono"
                />
                <Button
                  variant="secondary"
                  onClick={() => copyLink(inviteResult.invite_url)}
                  className="shrink-0 text-xs"
                >
                  {linkCopied
                    ? t(locale, "staff.linkCopied")
                    : t(locale, "staff.copyLink")}
                </Button>
              </div>
            </div>
            <DialogActions>
              <Button onClick={() => setInviteOpen(false)}>
                {t(locale, "common.close")}
              </Button>
            </DialogActions>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <Input
              label={t(locale, "staff.email")}
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t(locale, "staff.emailPlaceholder")}
              required
              disabled={inviting}
            />
            <Input
              label={t(locale, "staff.name")}
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder={t(locale, "staff.namePlaceholder")}
              required
              disabled={inviting}
            />
            <div>
              <Label className="mb-1.5 block">
                {t(locale, "staff.role")}
              </Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as StaffMember["role"])}
                disabled={inviting}
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus disabled:opacity-50"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(locale, `staff.role.${r}`)}
                  </option>
                ))}
              </select>
            </div>
            {needsLocation && (
              <div>
                <Label className="mb-1.5 block">
                  {t(locale, "staff.location")}
                </Label>
                <select
                  value={inviteLocationId}
                  onChange={(e) => setInviteLocationId(e.target.value)}
                  disabled={inviting || locations.length === 0}
                  required
                  className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus disabled:opacity-50"
                >
                  <option value="" disabled>
                    {t(locale, "staff.locationPlaceholder")}
                  </option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {error && (
              <p className="text-xs text-status-error">{error}</p>
            )}
            <DialogActions>
              <Button
                variant="secondary"
                onClick={() => setInviteOpen(false)}
                disabled={inviting}
              >
                {t(locale, "common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  inviting ||
                  inviteEmail.trim().length === 0 ||
                  inviteName.trim().length === 0 ||
                  (needsLocation && !inviteLocationId)
                }
              >
                {inviting
                  ? t(locale, "staff.sending")
                  : t(locale, "staff.send")}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveInvite}
        title={t(locale, "staff.confirmRemoveTitle")}
        message={t(locale, "staff.confirmRemove")}
        confirmLabel={t(locale, "staff.removeInvite")}
        loadingLabel={t(locale, "staff.removing")}
        variant="danger"
        loading={removing}
      />
    </div>
  );
}

function StatusBadge({
  status,
  locale,
}: {
  status: "active" | "pending" | "inactive";
  locale: ReturnType<typeof useLanguage>["locale"];
}) {
  const config = {
    active: {
      label: t(locale, "staff.status.active"),
      cls: "bg-status-success/10 text-status-success",
    },
    pending: {
      label: t(locale, "staff.status.pending"),
      cls: "bg-status-warning/10 text-status-warning",
    },
    inactive: {
      label: t(locale, "staff.status.inactive"),
      cls: "bg-text-muted/10 text-text-muted",
    },
  }[status];

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        config.cls
      )}
    >
      {config.label}
    </span>
  );
}

function RoleLabel({
  role,
  locale,
}: {
  role: StaffMember["role"];
  locale: ReturnType<typeof useLanguage>["locale"];
}) {
  if (role === "super_admin") {
    return <>Super Admin</>;
  }
  return <>{t(locale, `staff.role.${role}`)}</>;
}
