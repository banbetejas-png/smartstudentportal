import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell, ProgressRing } from "@/components/AppShell";
import {
  DAYS,
  dayName,
  setState,
  subjectAttendance,
  todayKey,
  uid,
  useAppState,
  type AttendanceMark,
} from "@/lib/store";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance Center — Smart Student Portal" },
      {
        name: "description",
        content: "Mark daily attendance, manage subjects and build your weekly timetable grid.",
      },
      { property: "og:title", content: "Attendance Center — Smart Student Portal" },
      {
        property: "og:description",
        content: "Daily marker, subject list and weekly timetable in one place.",
      },
    ],
  }),
  component: AttendancePage,
});

const TABS = ["Today", "Subjects", "Timetable"] as const;

function AttendancePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Today");

  return (
    <AppShell title="Attendance">
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-xs font-bold transition-colors ${
              tab === t ? "bg-navy text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Today" ? <DailyMarker /> : tab === "Subjects" ? <SubjectFeeder /> : <TimetableGrid />}
      </div>
    </AppShell>
  );
}

const MARKS: { key: AttendanceMark | "clear"; label: string; cls: string }[] = [
  { key: "present", label: "Present", cls: "bg-teal text-accent-foreground" },
  { key: "absent", label: "Absent", cls: "bg-destructive text-destructive-foreground" },
  { key: "off", label: "Off", cls: "bg-sky text-primary-foreground" },
  { key: "clear", label: "Clear", cls: "bg-secondary text-muted-foreground" },
];

function DailyMarker() {
  const state = useAppState();
  const today = dayName();
  const key = todayKey();
  const ids: string[] = state.timetable[today] ?? [];

  function mark(subjectId: string, value: AttendanceMark | "clear") {
    setState((s) => {
      const day = { ...(s.attendance[key] ?? {}) };
      if (value === "clear") delete day[subjectId];
      else day[subjectId] = value;
      return { ...s, attendance: { ...s.attendance, [key]: day } };
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "short",
        })}
      </p>

      {ids.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-sm">
          No classes scheduled today. Add them in the Timetable tab.
        </p>
      ) : (
        ids.map((id: string) => {
          const subject = state.subjects.find((s) => s.id === id);
          if (!subject) return null;
          const current = state.attendance[key]?.[id];
          const pct = subjectAttendance(state, id);
          return (
            <article key={id} className="rounded-2xl bg-card p-3 shadow-sm">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-navy">{subject.name}</h3>
                  <p
                    className={`text-[11px] font-semibold ${
                      current === "absent"
                        ? "text-destructive"
                        : current === "present"
                          ? "text-teal"
                          : "text-muted-foreground"
                    }`}
                  >
                    {current ? current.charAt(0).toUpperCase() + current.slice(1) : "Not marked"}
                  </p>
                </div>
                <ProgressRing value={pct ?? 0} size={52} stroke={6} />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {MARKS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => mark(id, m.key)}
                    className={`rounded-lg py-1.5 text-[11px] font-bold ${
                      current === m.key ? m.cls : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

function SubjectFeeder() {
  const state = useAppState();
  const { subjects } = state;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setState((s) => ({
      ...s,
      subjects: [...s.subjects, { id: uid(), name: name.trim(), code: code.trim() || "—" }],
    }));
    setName("");
    setCode("");
  }

  function remove(id: string) {
    setState((s) => ({
      ...s,
      subjects: s.subjects.filter((x) => x.id !== id),
      timetable: Object.fromEntries(
        Object.entries(s.timetable).map(([d, list]) => [d, list.filter((x) => x !== id)]),
      ),
    }));
  }

  return (
    <div className="space-y-3">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject name"
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-xs outline-none focus:border-sky"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          className="w-20 shrink-0 rounded-xl border border-border bg-card px-3 py-2.5 text-xs outline-none focus:border-sky"
        />
        <button
          type="submit"
          aria-label="Add subject"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {subjects.map((s) => {
        const pct = subjectAttendance(state, s.id);
        return (
          <div
            key={s.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {s.code} · {pct === null ? "No data" : `${pct}% attendance`}
              </p>
            </div>
            <button
              onClick={() => remove(s.id)}
              aria-label={`Remove ${s.name}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TimetableGrid() {
  const { subjects, timetable } = useAppState();

  function toggle(day: string, subjectId: string) {
    setState((s) => {
      const list = s.timetable[day] ?? [];
      const next = list.includes(subjectId)
        ? list.filter((x) => x !== subjectId)
        : [...list, subjectId];
      return { ...s, timetable: { ...s.timetable, [day]: next } };
    });
  }

  return (
    <div className="space-y-3">
      {DAYS.map((day) => (
        <section key={day} className="rounded-2xl bg-card p-3 shadow-sm">
          <h3 className="text-sm font-bold text-navy">{day}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subjects.map((s) => {
              const active = (timetable[day] ?? []).includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(day, s.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                    active ? "bg-sky text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
