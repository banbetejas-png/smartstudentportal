import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { GraduationCap, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { signOutEverywhere, useAuth } from "@/lib/cloud";

const TABS = [
  { to: "/teacher/dashboard", label: "Overview" },
  { to: "/teacher/subjects", label: "My Subjects" },
  { to: "/teacher/assignments", label: "Assignments" },
  { to: "/teacher/submissions", label: "Submissions" },
  { to: "/teacher/attendance", label: "Attendance" },
  { to: "/teacher/notices", label: "Notices" },
] as const;

export const cardCls = "rounded-2xl bg-card p-4 shadow-sm sm:p-5";
export const fieldCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-sky focus:ring-2 focus:ring-sky/25";
export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60";

export function TeacherShell({ title, children }: { title: string; children: ReactNode }) {
  const { profile, email } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function logout() {
    await signOutEverywhere();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-navy text-primary-foreground shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10">
            <GraduationCap className="h-5 w-5" />
          </div>
          <p className="min-w-0 flex-1 truncate text-base font-bold tracking-tight">Faculty Portal</p>
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-xs font-semibold">{profile?.full_name || "Faculty"}</p>
            <p className="truncate text-[11px] text-white/60">{email}</p>
          </div>
          <button
            onClick={logout}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-2 pb-2">
          <ul className="flex gap-1">
            {TABS.map((t) => (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={`block whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    pathname === t.to ? "bg-white text-navy" : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5">
        <h1 className="mb-4 text-lg font-extrabold text-navy">{title}</h1>
        {children}
      </main>
    </div>
  );
}
