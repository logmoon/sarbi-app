import { NextResponse } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { createTableSchema } from "@/lib/validators";
import { createAdminClient } from "@/lib/supabase/admin";

function generatePublicCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  const { locationId, supabase, error } = await getStaffTenantAndLocation();
  if (error) return error;

  const { data: tables, error: dbError } = await supabase
    .from("tables")
    .select(`
      *,
      sessions_relation: sessions!left(
        id,
        closed_at
      )
    `)
    .eq("location_id", locationId)
    .order("label", { ascending: true });

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to fetch tables", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  const data = tables.map((table) => {
    const { sessions_relation, ...rest } = table;
    const openSession = (sessions_relation ?? []).find(
      (s: { id: string; closed_at: string | null }) => s.closed_at === null
    );
    return {
      ...rest,
      has_active_session: !!openSession,
      active_session_id: openSession?.id ?? null,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const { tenantId, locationId, supabase, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const body = await request.json();
  const result = createTableSchema.safeParse(body);

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

  const { data: tenant } = await admin
    .from("tenants")
    .select("slug")
    .eq("id", tenantId)
    .single();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // public_code must be globally unique across all tenants (it's an 8-char
  // random string, not scoped by tenant_id). The tenant-scoped `supabase`
  // client's RLS only lets it see this tenant's own tables, so it can't
  // actually detect a collision with another tenant's table — use the admin
  // client here so the pre-check is meaningful. The real backstop is the
  // DB-level UNIQUE constraint + the retry-on-conflict loop below.
  let table = null;
  let dbError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    const publicCode = generatePublicCode();
    const { data: existing } = await admin
      .from("tables")
      .select("id")
      .eq("public_code", publicCode)
      .maybeSingle();
    if (existing) continue;

    const qrCodeUrl = `${baseUrl}/${tenant?.slug ?? "unknown"}/table/${publicCode}`;

    const { data: inserted, error: insertErr } = await supabase
      .from("tables")
      .insert({
        tenant_id: tenantId,
        location_id: locationId,
        label: result.data.label,
        public_code: publicCode,
        qr_code_url: qrCodeUrl,
      })
      .select()
      .single();

    if (!insertErr) {
      table = inserted;
      dbError = null;
      break;
    }

    // 23505 = unique_violation: another request grabbed this exact code
    // between our check and the insert. Try again with a fresh code.
    if (insertErr.code === "23505") {
      dbError = insertErr;
      continue;
    }

    dbError = insertErr;
    break;
  }

  if (!table) {
    return NextResponse.json(
      { error: dbError?.message ?? "Failed to create table", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data: { ...table, has_active_session: false, active_session_id: null } },
    { status: 201 }
  );
}
