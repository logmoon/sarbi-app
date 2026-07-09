import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug parameter", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, name, slug, plan, logo_url, brand_colors")
    .eq("slug", slug)
    .single();

  if (tenantErr || !tenant) {
    return NextResponse.json(
      { error: "Tenant not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select(
      `
      id,
      name,
      sort_order,
      is_available,
      items!inner (
        id,
        name,
        description,
        price,
        image_url,
        is_available,
        sort_order
      )
    `
    )
    .eq("tenant_id", tenant.id)
    .eq("is_available", true)
    .eq("items.is_available", true)
    .order("sort_order", { ascending: true });

  if (catErr) {
    return NextResponse.json(
      { error: "Failed to fetch menu", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: categories ?? [] });
}
