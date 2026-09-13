import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarCheck, ClipboardList, Megaphone, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { dueLabel, formatDateTime, useAuth } from "@/lib/cloud";
import { useMySubjects, useStudents } from "@/lib/teacher-data";
import { TeacherShell, cardCls } from "@/components/TeacherShell";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({
    meta: [
      { title: "Faculty Dashboard — Smart Student Portal" },
      { name: "description", content: "Class overview: students, attendance average and pending reviews." },
      { property: "og:title", content: "Faculty Dashboard — Smart Student Portal" },
      { property: "og:description", content: "Class overview for faculty." },
    ],
  }),
  component: TeacherDashboard,
});

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
    <div className={cardCls}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${accent ? "text-teal" : "text-navy"}`}>{value}</p>
    </div>
  );
}

function TeacherDashboard() {
  const { userId, profile } = useAuth();
  const subjects = useMySubjects(userId);
  const students = useStudents();

  const attendance = useQuery({
    queryKey: ["teacher-attendance-summary", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("class_attendance")
        .select("status")
        .eq("teacher_id", userId!);
      const rows = data ?? [];
      const present = rows.filter((r) => r.status === "present").length;
      return rows.length ? Math.round((present / rows.length) * 100) : 0;
    },
  });

  const assignments = useQuery({
    queryKey: ["teacher-assignment-overview", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: list } = await supabase
        .from("assignments")
        .select("id, title, due_at, subject_id")
        .eq("teacher_id", userId!)
        .order("due_at", { ascending: true });
      const ids = (list ?? []).map((a) => a.id);
      let pending = 0;
      if (ids.length) {
        const { count } = await supabase
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .in("assignment_id", ids)
          .is("marks", null);
        pending = count ?? 0;
      }
      return { list: list ?? [], pending };
    },
  });

  const shortcuts = [
    { to: "/teacher/subjects", label: "My Subjects", icon: BookOpen },
    { to: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/teacher/notices", label: "Notices", icon: Megaphone },
  ] as const;

  return (
    <TeacherShell title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Faculty"}`}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Users} label="Enrolled students" value={String((students.data ?? []).length)} />
        <Metric
          icon={CalendarCheck}
          label="Class average attendance"
          value={`${attendance.data ?? 0}%`}
          accent
        />
        <Metric
          icon={ClipboardList}
          label="Pending reviews"
          value={String(assignments.data?.pending ?? 0)}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to} className={`${cardCls} flex items-center gap-3 hover:shadow-md`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy/10 text-navy">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold text-navy">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={cardCls}>
          <h2 className="text-sm font-bold text-navy">Upcoming assignments</h2>
          {(assignments.data?.list ?? []).length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">Nothing published yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(assignments.data?.list ?? []).slice(0, 5).map((a) => {
                const tag = dueLabel(a.due_at);
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(a.due_at)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tag.tone}`}>
                      {tag.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={cardCls}>
          <h2 className="text-sm font-bold text-navy">Subjects you teach</h2>
          {(subjects.data ?? []).length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Pick your subjects in <Link to="/teacher/subjects" className="font-semibold text-sky">My Subjects</Link>.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {(subjects.data ?? []).map((s) => (
                <li
                  key={s.id}
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-navy"
                >
                  {s.name} • Sem {s.semester}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </TeacherShell>
  );
}
