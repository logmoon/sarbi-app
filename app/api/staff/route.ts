import { NextResponse, type NextRequest } from "next/server";
import { SignJWT } from "jose";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { inviteStaffSchema } from "@/lib/validators";
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

export async function GET() {
  const { tenantId, locationId, supabase, staffId, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { data: staff } = await supabase
    .from("staff")
    .select("role")
    .eq("id", staffId)
    .single();

  if (!staff || (staff.role !== "owner" && staff.role !== "location_manager" && staff.role !== "super_admin")) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  let query = supabase
    .from("staff")
    .select("id, email, name, role, location_id, is_active, auth_id, created_at, locations(name)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });

  if (locationId !== null && staff.role === "location_manager") {
    query = query.eq("location_id", locationId);
  }

  const { data, error: dbErr } = await query;

  if (dbErr) {
    return NextResponse.json(
      { error: "Failed to fetch staff", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: (data ?? []).map((row) => {
      // Supabase returns the joined relationship as either an object (single
      // row) or null. Normalize to a flat `location_name` string so the
      // client doesn't have to know about the join shape. `has_auth` flags
      // whether the invite was accepted, derived from auth_id presence —
      // used by the client to render pending vs active status without
      // exposing the auth_id itself.
      const { locations, auth_id, ...rest } = row as typeof row & {
        locations: { name: string } | null;
      };
      return {
        ...rest,
        location_name: locations?.name ?? null,
        has_auth: Boolean(auth_id),
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  const { tenantId, supabase, staffId, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { data: inviter } = await supabase
    .from("staff")
    .select("role, tenant_id, locations(name)")
    .eq("id", staffId)
    .single();

  if (!inviter || (inviter.role !== "owner" && inviter.role !== "super_admin")) {
    return NextResponse.json(
      { error: "Only owners can invite staff", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const result = inviteStaffSchema.safeParse(body);

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

  const { email, name, role, location_id } = result.data;

  if (role !== "owner" && !location_id) {
    return NextResponse.json(
      { error: "location_id is required for non-owner roles", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: tenant } = await admin
    .from("tenants")
    .select("id, name")
    .eq("id", tenantId)
    .single();

  const tenantName = tenant?.name ?? "Sarbi";

  const { data: existing } = await admin
    .from("staff")
    .select("id, auth_id, name, role, is_active")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.auth_id) {
      if (!existing.is_active) {
        return NextResponse.json(
          {
            error: "This email belongs to a deactivated account. Reactivate it from the staff list instead of inviting again.",
            code: "ACCOUNT_INACTIVE",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "This email already has an active account", code: "CONFLICT" },
        { status: 409 }
      );
    }
  }

  let staffRecordId: string;
  let staffRecordName: string;
  let staffRecordRole: string;

  if (existing) {
    const { error: updateErr } = await admin
      .from("staff")
      .update({
        tenant_id: tenantId,
        location_id: location_id ?? null,
        name,
        role,
        is_active: true,
      })
      .eq("id", existing.id);

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update pending staff record", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    staffRecordId = existing.id;
    staffRecordName = name;
    staffRecordRole = role;
  } else {
    const { data: inserted, error: insertErr } = await admin
      .from("staff")
      .insert({
        tenant_id: tenantId,
        location_id: location_id ?? null,
        email,
        name,
        role,
      })
      .select("id, name, role")
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json(
        { error: "Failed to create staff record", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    staffRecordId = inserted.id;
    staffRecordName = inserted.name;
    staffRecordRole = inserted.role;
  }

  const inviteToken = await generateInviteToken(
    staffRecordId,
    email,
    staffRecordName,
    staffRecordRole
  );
  const inviteUrl = `${getEnv("NEXT_PUBLIC_APP_URL")}/setup?token=${encodeURIComponent(inviteToken)}`;

  const locale = resolveLocale(request);
  const emailResult = await sendInviteEmail({
    to: email,
    recipientName: staffRecordName,
    tenantName,
    role: staffRecordRole,
    inviteUrl,
    locale,
  });

  return NextResponse.json({
    data: {
      id: staffRecordId,
      email,
      name: staffRecordName,
      role: staffRecordRole,
      location_id: location_id ?? null,
      is_active: true,
      invite_url: inviteUrl,
      email_sent: emailResult.ok,
      email_error: emailResult.ok ? null : emailResult.error,
    },
    // localizable toast for the UI (in the caller's locale)
    message: emailResult.ok
      ? t(locale, "staff.inviteSent")
      : t(locale, "staff.inviteEmailFailed"),
  });
}
