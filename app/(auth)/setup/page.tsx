"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

export default function SetupPage(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { locale } = useLanguage();

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
      setError(t(locale, "auth.setup.passwordMin"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t(locale, "auth.setup.passwordMismatch"));
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
      setError(data.error || t(locale, "auth.setup.somethingWrong"));
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
      <Card className="p-6 sm:p-8">
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-text-secondary">{t(locale, "auth.setup.validating")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!valid) {
    return (
      <Card className="p-6 sm:p-8">
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-status-error/10 text-status-error">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <h1 className="text-xl font-bold text-text-primary">
              {t(locale, "auth.setup.invalidInvite")}
            </h1>
            <p className="text-sm text-text-secondary">
              {t(locale, "auth.setup.invalidInviteDesc")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <CardHeader className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t(locale, "auth.setup.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {name
            ? t(locale, "auth.setup.welcome", { name })
            : t(locale, "auth.setup.welcomeFallback")}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t(locale, "auth.setup.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <Input
            label={t(locale, "auth.password")}
            type="password"
            placeholder={t(locale, "auth.setup.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
          <Input
            label={t(locale, "auth.setup.confirmPassword")}
            type="password"
            placeholder={t(locale, "auth.setup.confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-status-error/10 px-3 py-2 text-sm text-status-error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t(locale, "auth.setup.creatingAccount")}
              </span>
            ) : (
              t(locale, "auth.setup.createAccount")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
