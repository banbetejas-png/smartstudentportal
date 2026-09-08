import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  CalendarCheck,
  ClipboardList,
  LogOut,
  GraduationCap,
  Paperclip,
  Check,
  X,
  Plus,
} from "lucide-react";
import { clearSession, useSession } from "@/lib/auth";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({
    meta: [
      { title: "Faculty Portal — Teacher Dashboard" },
      {
        name: "description",
        content:
          "Faculty dashboard to track class attendance, publish assignments and grade student submissions.",
      },
      { property: "og:title", content: "Faculty Portal — Teacher Dashboard" },
      {
        property: "og:description",
        content: "Class attendance tracking, assignment publishing and grading queue for faculty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherDashboard,
});

const SUBJECTS = [
  "Database Systems",
  "Operating Systems",
  "Software Engineering",
  "Computer Networks",
];

type RosterRow = { roll: string; name: string; percent: number };

const ROSTER: RosterRow[] = [
  { roll: "CE-01", name: "Aarav Deshmukh", percent: 91 },
  { roll: "CE-02", name: "Isha Kulkarni", percent: 68 },
  { roll: "CE-03", name: "Rohan Patil", percent: 84 },
  { roll: "CE-04", name: "Sanya Verma", percent: 72 },
  { roll: "CE-05", name: "Tejas Banbe", percent: 88 },
  { roll: "CE-06", name: "Meera Nair", percent: 79 },
];

const SUBMISSIONS = [
  { id: "s1", student: "Aarav Deshmukh", assignment: "DBMS Assignment 3", file: "aarav-dbms3.pdf" },
  { id: "s2", student: "Isha Kulkarni", assignment: "OS Journal 2", file: "isha-os-journal.pdf" },
  { id: "s3", student: "Rohan Patil", assignment: "SE Project Phase 1", file: "rohan-se-p1.pdf" },
  { id: "s4", student: "Meera Nair", assignment: "DBMS Assignment 3", file: "meera-dbms3.pdf" },
];

const card = "rounded-2xl bg-card p-4 shadow-sm";
const field =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-sky focus:ring-2 focus:ring-sky/25";

function TeacherDashboard() {
  const session = useSession();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, "present" | "absent">>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    subject: SUBJECTS[0],
    maxMarks: "20",
    due: "",
    description: "",
  });

  const classAverage = useMemo(
    () => Math.round(ROSTER.reduce((a, r) => a + r.percent, 0) / ROSTER.length),
    [],
  );

  function logout() {
    clearSession();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-background">
      <header className="sticky top-0 z-20 bg-navy px-4 py-4 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight">
            Faculty Portal
          </h1>
          <div className="hidden text-right sm:block">
            <p className="truncate text-xs font-semibold">{session?.name}</p>
            <p className="truncate text-[11px] text-white/60">{session?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-4 py-4">
        {/* Overview metrics */}
        <section className="grid gap-3 sm:grid-cols-3">
          <Metric icon={Users} label="Total Enrolled Students" value="68" />
          <Metric
            icon={CalendarCheck}
            label="Class Average Attendance"
            value={`${classAverage}%`}
            accent
          />
          <Metric icon={ClipboardList} label="Pending Assignment Reviews" value="14" />
        </section>

        {/* Attendance tracker */}
        <section className={card}>
          <h2 className="text-sm font-bold text-navy">Class Attendance Tracker</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">Subject</span>
              <select
                className={`${field} mt-1`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Date</span>
              <input
                type="date"
                className={`${field} mt-1`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <ul className="mt-4 space-y-2">
            {ROSTER.map((r) => {
              const mark = marks[r.roll];
              return (
                <li
                  key={r.roll}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">
                      {r.name}{" "}
                      <span className="text-xs font-normal text-muted-foreground">({r.roll})</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      Attendance {r.percent}%
                      {r.percent < 75 ? (
                        <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                          Below 75%
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => setMarks((m) => ({ ...m, [r.roll]: "present" }))}
                      className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold ${
                        mark === "present"
                          ? "bg-teal text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}
                      aria-label={`Mark ${r.name} present`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setMarks((m) => ({ ...m, [r.roll]: "absent" }))}
                      className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold ${
                        mark === "absent"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                      aria-label={`Mark ${r.name} absent`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Assignment manager */}
        <section className={card}>
          <h2 className="text-sm font-bold text-navy">Assignment Manager</h2>
          <form
            className="mt-3 grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPublished(`"${form.title}" published to ${form.subject}.`);
              setForm({ title: "", subject: SUBJECTS[0], maxMarks: "20", due: "", description: "" });
            }}
          >
            <input
              className={field}
              placeholder="Assignment title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className={field}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              className={field}
              type="number"
              min={1}
              placeholder="Max marks"
              required
              value={form.maxMarks}
              onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
            />
            <input
              className={field}
              type="datetime-local"
              required
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
            />
            <textarea
              className={`${field} sm:col-span-2`}
              rows={3}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-bold text-primary-foreground sm:col-span-2"
            >
              <Plus className="h-4 w-4" /> Publish Assignment
            </button>
          </form>
          {published ? <p className="mt-2 text-xs font-semibold text-teal">{published}</p> : null}
        </section>

        {/* Grading queue */}
        <section className={card}>
          <h2 className="text-sm font-bold text-navy">Submissions &amp; Grading Queue</h2>
          <ul className="mt-3 space-y-2">
            {SUBMISSIONS.map((s) => (
              <li key={s.id} className="rounded-xl border border-border p-3">
                <p className="truncate text-sm font-semibold text-navy">{s.student}</p>
                <p className="truncate text-xs text-muted-foreground">{s.assignment}</p>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky"
                >
                  <Paperclip className="h-3.5 w-3.5" /> {s.file}
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    className={`${field} max-w-28`}
                    type="number"
                    min={0}
                    placeholder="Marks"
                    value={grades[s.id] ?? ""}
                    onChange={(e) => setGrades((g) => ({ ...g, [s.id]: e.target.value }))}
                  />
                  <button
                    onClick={() => setSaved(s.id)}
                    className="rounded-xl bg-teal px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Save Feedback
                  </button>
                  {saved === s.id ? (
                    <span className="text-xs font-semibold text-teal">Saved</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={card}>
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary">
          <Icon className={`h-4.5 w-4.5 ${accent ? "text-teal" : "text-navy"}`} />
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${accent ? "text-teal" : "text-navy"}`}>
        {value}
      </p>
    </div>
  );
}
