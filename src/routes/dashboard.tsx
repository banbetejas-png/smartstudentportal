import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CalendarDays,
  Receipt,
  ListTodo,
  ChevronRight,
  BookPlus,
} from "lucide-react";
import { AppShell, ProgressRing } from "@/components/AppShell";
import { DAYS, dayName, overallAttendance, useAppState } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Student Portal" },
      {
        name: "description",
        content: "See your total attendance percentage, today's classes and upcoming deadlines.",
      },
      { property: "og:title", content: "Dashboard — Smart Student Portal" },
      {
        property: "og:description",
        content: "Total attendance, today's classes and upcoming deadlines at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const TABS = [
  { to: "/attendance", label: "Mark Today's Attendance", icon: CalendarCheck, tone: "navy" },
  { to: "/attendance", label: "My Timetable", icon: CalendarDays, tone: "sky" },
  { to: "/academics", label: "Academics — Marks & Fees", icon: Receipt, tone: "teal" },
  { to: "/tasks", label: "Assignments & Journals", icon: ListTodo, tone: "soft" },
] as const;

const tone: Record<string, string> = {
  navy: "bg-navy text-primary-foreground",
  sky: "bg-sky text-primary-foreground",
  teal: "bg-teal text-accent-foreground",
  soft: "bg-card text-navy border border-border",
};

function Dashboard() {
  const state = useAppState();
  const pct = overallAttendance(state);
  const today = dayName();
  const todaysClasses: string[] = (DAYS as readonly string[]).includes(today)
    ? (state.timetable[today] ?? [])
    : [];
  const pending = state.tasks.filter((t) => !t.done);

  return (
    <AppShell>
      <section className="rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-navy">Dashboard</h2>
        <p className="text-xs text-muted-foreground">
          {state.student?.fullName ? `Hi, ${state.student.fullName.split(" ")[0]}` : "Homepage"}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <ProgressRing value={pct} size={132} stroke={13} label="Attendance" />
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            {TABS.map(({ to, label, icon: Icon, tone: t }) => (
              <Link
                key={label}
                to={to}
                className={`flex h-[62px] flex-col justify-between rounded-2xl p-2 ${tone[t]}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-[10px] leading-tight font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/subjects"
          className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-navy p-3 text-primary-foreground"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <BookPlus className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">Add / Manage Subjects</span>
            <span className="block truncate text-[11px] text-white/70">
              Semester-wise, synced with attendance &amp; marks
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      </section>

      <section className="mt-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h3 className="truncate text-sm font-bold text-navy">Quick Access</h3>
          <Link to="/tasks" className="shrink-0 text-xs font-semibold text-sky">
            See All
          </Link>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <Link to="/attendance" className="rounded-2xl bg-card p-3 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">Today&apos;s Classes</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">{todaysClasses.length}</p>
            <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky">
              Mark now <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
          <Link to="/tasks" className="rounded-2xl bg-card p-3 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">Upcoming Deadlines</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">{pending.length}</p>
            <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-teal">
              View tasks <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </section>

      <section className="mt-5 rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="text-sm font-bold text-navy">Today&apos;s Schedule ({today})</h3>
        <ul className="mt-3 space-y-2">
          {todaysClasses.length === 0 ? (
            <li className="text-xs text-muted-foreground">No classes scheduled today.</li>
          ) : (
            todaysClasses.map((id: string) => {
              const subject = state.subjects.find((s) => s.id === id);
              if (!subject) return null;
              return (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5"
                >
                  <span className="truncate text-sm font-semibold text-navy">{subject.name}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{subject.code}</span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </AppShell>
  );
}
