"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    const t = token;
    if (!t) {
      setValid(false);
      return;
    }
    async function validateToken() {
      const res = await fetch(`/api/setup?token=${encodeURIComponent(t!)}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setValid(true);
      } else {
        setValid(false);
      }
    }
    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const { email } = await res.json();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (valid === null) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-text-secondary">Validating invite...</p>
        </CardContent>
      </Card>
    );
  }

  if (!valid) {
    return (
      <Card>
      <CardHeader>
        <h1 className="text-center text-xl font-bold text-text-primary">
          Invalid or expired invite
        </h1>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-text-secondary">
          This invite link is invalid or has expired. Contact your restaurant
          admin for a new one.
        </p>
      </CardContent>
    </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-center text-xl font-bold text-text-primary">
          Set up your account
        </h1>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
          {error && (
            <p className="text-sm text-status-error">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Setting up..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
