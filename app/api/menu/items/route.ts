import { NextResponse } from "next/server";
import { getStaffTenantId } from "@/lib/api-helpers";
import { createItemSchema, reorderItemsSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");

  let query = supabase
    .from("items")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: items, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: "Failed to fetch items", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ data: items });
}

export async function POST(request: Request) {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const body = await request.json();
  const result = createItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { data: maxOrder } = await supabase
    .from("items")
    .select("sort_order")
    .eq("category_id", result.data.category_id)
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.sort_order ?? -1) + 1;

  const { data: item, error: dbError } = await supabase
    .from("items")
    .insert({
      tenant_id: tenantId,
      category_id: result.data.category_id,
      name: result.data.name,
      description: result.data.description ?? { en: "", fr: "", ar: "" },
      price: result.data.price,
      image_url: result.data.image_url ?? null,
      sort_order: result.data.sort_order ?? nextOrder,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: "Failed to create item", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ data: item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const body = await request.json();
  const result = reorderItemsSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const updates = result.data.items.map((item) =>
    supabase
      .from("items")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id)
      .eq("tenant_id", tenantId)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Failed to reorder items", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
