import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jwtVerify } from "jose";
import { setupAccountSchema } from "@/lib/validators";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing token", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  try {
    const jwtSecret = new TextEncoder().encode(getEnv("INVITE_SECRET"));
    const { payload } = await jwtVerify(token, jwtSecret);

    const admin = createAdminClient();
    const { data: staffRecord } = await admin
      .from("staff")
      .select("id, name, email, role")
      .eq("id", payload.sub)
      .is("auth_id", null)
      .single();

    if (!staffRecord) {
      return NextResponse.json(
        { error: "Invite already used or invalid", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: staffRecord.name,
      email: staffRecord.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token", code: "TOKEN_INVALID" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = setupAccountSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", code: "VALIDATION_ERROR", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { token, name, password } = result.data;

  try {
    const jwtSecret = new TextEncoder().encode(getEnv("INVITE_SECRET"));
    const { payload } = await jwtVerify(token, jwtSecret);

    const admin = createAdminClient();

    const { data: staffRecord } = await admin
      .from("staff")
      .select("id, email, name, role")
      .eq("id", payload.sub)
      .is("auth_id", null)
      .single();

    if (!staffRecord) {
      return NextResponse.json(
        { error: "Invite already used or invalid", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const { data: authUser, error: createUserError } = await admin.auth.admin.createUser({
      email: staffRecord.email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { user_role: staffRecord.role },
    });

    if (createUserError) {
      return NextResponse.json(
        { error: createUserError.message, code: "AUTH_CREATE_ERROR" },
        { status: 500 }
      );
    }

    const { error: updateError } = await admin
      .from("staff")
      .update({
        auth_id: authUser.user.id,
        name,
      })
      .eq("id", staffRecord.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to link auth account", code: "UPDATE_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      email: staffRecord.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token", code: "TOKEN_INVALID" },
      { status: 401 }
    );
  }
}
