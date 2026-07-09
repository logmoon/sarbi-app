import { NextResponse } from "next/server";
import { getStaffTenantId } from "@/lib/api-helpers";
import { createCategorySchema, reorderCategoriesSchema } from "@/lib/validators";

export async function GET() {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const { data: categories, error: dbError } = await supabase
    .from("categories")
    .select("*, items(*)")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: "Failed to fetch categories", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const body = await request.json();
  const result = createCategorySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { data: maxOrder } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.sort_order ?? -1) + 1;

  const { data: category, error: dbError } = await supabase
    .from("categories")
    .insert({
      tenant_id: tenantId,
      name: result.data.name,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: "Failed to create category", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ data: category }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const body = await request.json();
  const result = reorderCategoriesSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const updates = result.data.items.map((item) =>
    supabase
      .from("categories")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id)
      .eq("tenant_id", tenantId)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Failed to reorder categories", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
