import { useSyncExternalStore } from "react";

export type Role = "teacher" | "student";
export type Session = { role: Role; email: string; name: string } | null;

const KEY = "smart-student-portal-session";

export const CREDENTIALS: Record<
  string,
  { password: string; role: Role; name: string }
> = {
  "teacher@portal.edu": { password: "Teacher@123", role: "teacher", name: "Prof. R. Sharma" },
  "student@portal.edu": { password: "Student@123", role: "student", name: "Tejas Banbe" },
};

let session: Session = null;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) session = JSON.parse(raw) as Session;
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function setSession(next: Session) {
  session = next;
  if (typeof window !== "undefined") {
    try {
      if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
  emit();
}

/** Returns the session when email/password match a known account, else null. */
export function authenticate(email: string, password: string): Session {
  const account = CREDENTIALS[email.trim().toLowerCase()];
  if (!account || account.password !== password) return null;
  return { role: account.role, email: email.trim().toLowerCase(), name: account.name };
}

export function clearSession() {
  setSession(null);
}

export function useSession(): Session {
  return useSyncExternalStore(
    (cb) => {
      hydrate();
      listeners.add(cb);
      cb();
      return () => listeners.delete(cb);
    },
    () => session,
    () => null,
  );
}
