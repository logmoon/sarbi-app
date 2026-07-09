export const SESSION_COOKIE_NAME = "sarbi_session_id";

export function getSessionCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    `(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setSessionCookie(sessionId: string, timeoutMinutes: number = 150): void {
  const expires = new Date(
    Date.now() + timeoutMinutes * 60 * 1000
  ).toUTCString();
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; path=/; expires=${expires}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
