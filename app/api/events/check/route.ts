import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const type = request.nextUrl.searchParams.get("type");

  if (!sessionId || !type) {
    return NextResponse.json(
      { error: "Missing session_id or type", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: session, error: sessionErr } = await admin
    .from("sessions")
    .select("tenant_id")
    .eq("id", sessionId)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json(
      { error: "Session not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: event, error: eventErr } = await admin
    .from("table_events")
    .select("id")
    .eq("tenant_id", session.tenant_id)
    .eq("session_id", sessionId)
    .eq("type", type)
    .eq("status", "pending")
    .maybeSingle();

  if (eventErr) {
    return NextResponse.json(
      { error: "Failed to check event", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    pending: !!event,
    eventId: event?.id ?? null,
  });
}
