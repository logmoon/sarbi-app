import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SignJWT } from "jose";
import { createInviteSchema } from "@/lib/validators";

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

export async function POST(request: Request) {
  const secret = request.headers.get("x-invite-secret");
  if (secret !== getEnv("INVITE_SECRET")) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const result = createInviteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { tenant_id, location_id, email, name, role } = result.data;

  if (role !== "owner" && !location_id) {
    return NextResponse.json(
      { error: "location_id is required for non-owner roles", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("staff")
    .select("id, auth_id, name, role")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.auth_id) {
      return NextResponse.json(
        { error: "This email already has an active account", code: "CONFLICT" },
        { status: 409 }
      );
    }

    const inviteToken = await generateInviteToken(existing.id, email, existing.name, existing.role);
    const inviteUrl = `${getEnv("NEXT_PUBLIC_APP_URL")}/setup?token=${encodeURIComponent(inviteToken)}`;

    return NextResponse.json({
      staff: { id: existing.id, email, name: existing.name, role: existing.role },
      invite_url: inviteUrl,
    });
  }

  const { data: staffRecord, error: insertError } = await admin
    .from("staff")
    .insert({
      tenant_id,
      location_id: location_id || null,
      email,
      name,
      role,
    })
    .select("id, email, name, role")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create staff record", code: "INSERT_ERROR" },
      { status: 500 }
    );
  }

  const inviteToken = await generateInviteToken(
    staffRecord.id,
    staffRecord.email,
    staffRecord.name,
    staffRecord.role
  );
  const inviteUrl = `${getEnv("NEXT_PUBLIC_APP_URL")}/setup?token=${encodeURIComponent(inviteToken)}`;

  return NextResponse.json({
    staff: staffRecord,
    invite_url: inviteUrl,
  });
}
