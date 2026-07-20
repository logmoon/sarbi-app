import { NextResponse, type NextRequest } from "next/server";
import { SignJWT } from "jose";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { updateStaffSchema } from "@/lib/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInviteEmail } from "@/lib/email";
import { t, type Locale } from "@/lib/i18n";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function generateInviteToken(
  staffId: string,
  email: string,
  name: string,
  role: string
): Promise<string> {
  const jwtSecret = new TextEncoder().encode(getEnv("INVITE_SECRET"));
  return new SignJWT({ sub: staffId, email, name, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(jwtSecret);
}

function resolveLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("locale")?.value;
  if (cookieLocale === "ar" || cookieLocale === "fr" || cookieLocale === "en") {
    return cookieLocale;
  }
  const accept = request.headers.get("accept-language");
  if (accept) {
    if (accept.toLowerCase().includes("ar")) return "ar";
    if (accept.toLowerCase().includes("fr")) return "fr";
  }
  return "en";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, supabase, staffId, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { data: inviter } = await supabase
    .from("staff")
    .select("role")
    .eq("id", staffId)
    .single();

  if (!inviter || (inviter.role !== "owner" && inviter.role !== "super_admin")) {
    return NextResponse.json(
      { error: "Only owners can update staff", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const body = await request.json();
  const result = updateStaffSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: target, error: fetchErr } = await admin
    .from("staff")
    .select("id, tenant_id, email, name, role, auth_id, is_active, location_id")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (fetchErr || !target) {
    return NextResponse.json(
      { error: "Staff not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (target.id === staffId) {
    return NextResponse.json(
      { error: "You cannot change your own account", code: "SELF_TARGET" },
      { status: 400 }
    );
  }

  if (result.data.action === "toggle_active") {
    if (!target.auth_id) {
      return NextResponse.json(
        { error: "Pending invites cannot be deactivated — delete them instead", code: "NO_AUTH_ID" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateErr } = await admin
      .from("staff")
      .update({ is_active: result.data.is_active })
      .eq("id", id)
      .select("id, email, name, role, location_id, is_active, created_at")
      .single();

    if (updateErr || !updated) {
      return NextResponse.json(
        { error: "Failed to update staff", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updated });
  }

  // resend_invite
  if (target.auth_id) {
    return NextResponse.json(
      { error: "This account is already active", code: "ALREADY_ACTIVE" },
      { status: 400 }
    );
  }

  const { data: tenant } = await admin
    .from("tenants")
    .select("name")
    .eq("id", tenantId)
    .single();

  const inviteToken = await generateInviteToken(
    target.id,
    target.email,
    target.name,
    target.role
  );
  const inviteUrl = `${getEnv("NEXT_PUBLIC_APP_URL")}/setup?token=${encodeURIComponent(inviteToken)}`;

  const locale = resolveLocale(request);
  const emailResult = await sendInviteEmail({
    to: target.email,
    recipientName: target.name,
    tenantName: tenant?.name ?? "Sarbi",
    role: target.role,
    inviteUrl,
    locale,
  });

  return NextResponse.json({
    data: {
      id: target.id,
      email: target.email,
      name: target.name,
      role: target.role,
      location_id: target.location_id,
      is_active: target.is_active,
      invite_url: inviteUrl,
      email_sent: emailResult.ok,
      email_error: emailResult.ok ? null : emailResult.error,
    },
    message: emailResult.ok
      ? t(locale, "staff.inviteResent")
      : t(locale, "staff.inviteEmailFailed"),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, supabase, staffId, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { data: inviter } = await supabase
    .from("staff")
    .select("role")
    .eq("id", staffId)
    .single();

  if (!inviter || (inviter.role !== "owner" && inviter.role !== "super_admin")) {
    return NextResponse.json(
      { error: "Only owners can remove staff", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: target, error: fetchErr } = await admin
    .from("staff")
    .select("id, tenant_id, auth_id, email")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (fetchErr || !target) {
    return NextResponse.json(
      { error: "Staff not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (target.id === staffId) {
    return NextResponse.json(
      { error: "You cannot remove your own account", code: "SELF_TARGET" },
      { status: 400 }
    );
  }

  if (target.auth_id) {
    return NextResponse.json(
      { error: "Active accounts cannot be removed. Deactivate them instead.", code: "HAS_AUTH_ID" },
      { status: 400 }
    );
  }

  const { error: deleteErr } = await admin
    .from("staff")
    .delete()
    .eq("id", id);

  if (deleteErr) {
    return NextResponse.json(
      { error: "Failed to remove pending invite", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
