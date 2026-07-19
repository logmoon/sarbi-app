"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

export default function LoginPage(): React.ReactNode {
  const router = useRouter();
  const supabase = createClient();
  const { locale } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="p-6 sm:p-8">
      <CardHeader className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t(locale, "auth.welcome")}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t(locale, "auth.welcomeSub")}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t(locale, "auth.email")}
            type="email"
            placeholder={t(locale, "auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
          />
          <Input
            label={t(locale, "auth.password")}
            type="password"
            placeholder={t(locale, "auth.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
                {t(locale, "auth.signingIn")}
              </span>
            ) : (
              t(locale, "auth.signIn")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
