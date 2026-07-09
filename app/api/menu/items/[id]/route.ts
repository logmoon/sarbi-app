import { NextResponse } from "next/server";
import { getStaffTenantId } from "@/lib/api-helpers";
import { updateItemSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const body = await request.json();
  const result = updateItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { data: item, error: dbError } = await supabase
    .from("items")
    .update(result.data)
    .eq("id", params.id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: "Failed to update item", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ data: item });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { tenantId, supabase, error } = await getStaffTenantId();
  if (error) return error;

  const { error: dbError } = await supabase
    .from("items")
    .delete()
    .eq("id", params.id)
    .eq("tenant_id", tenantId);

  if (dbError) {
    return NextResponse.json({ error: "Failed to delete item", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
