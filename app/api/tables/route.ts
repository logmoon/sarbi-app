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
      has_active_session: sessions!left(
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

  const data = tables.map((table) => ({
    ...table,
    has_active_session: (table.has_active_session ?? []).some(
      (s: { closed_at: string | null }) => s.closed_at === null
    ),
  }));

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

  let publicCode = "";
  let attempts = 0;
  while (attempts < 10) {
    publicCode = generatePublicCode();
    const { data: existing } = await supabase
      .from("tables")
      .select("id")
      .eq("public_code", publicCode)
      .maybeSingle();
    if (!existing) break;
    attempts++;
  }

  if (attempts >= 10) {
    return NextResponse.json(
      { error: "Failed to generate unique code", code: "COLLISION" },
      { status: 500 }
    );
  }

  const qrCodeUrl = `${baseUrl}/${tenant?.slug ?? "unknown"}/table/${publicCode}`;

  const { data: table, error: dbError } = await supabase
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

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to create table", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { ...table, has_active_session: false } }, { status: 201 });
}
