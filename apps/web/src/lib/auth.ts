export interface ArcHiveSession {
  userId: string;
  username?: string;
  avatarUrl?: string;
  token?: string;
}

const SESSION_KEY = "archive_session";
const TOKEN_KEY = "archive_token";

export function saveSession(session: ArcHiveSession) {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  if (session.token) {
    localStorage.setItem(TOKEN_KEY, session.token);
  }
}

export function getSession(): ArcHiveSession | null {
  if (typeof window === "undefined") return null;

  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as ArcHiveSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function getUserId() {
  const session = getSession();

  return (
    session?.userId ||
    process.env.NEXT_PUBLIC_DEV_USER_ID ||
    ""
  );
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}