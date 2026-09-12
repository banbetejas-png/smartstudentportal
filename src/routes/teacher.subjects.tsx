import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/cloud";
import { useAllSubjects, useMySubjects } from "@/lib/teacher-data";
import { TeacherShell, cardCls, fieldCls, primaryBtn } from "@/components/TeacherShell";

export const Route = createFileRoute("/teacher/subjects")({
  head: () => ({
    meta: [
      { title: "My Subjects — Faculty Portal" },
      { name: "description", content: "Choose the subjects you teach to filter your faculty tools." },
      { property: "og:title", content: "My Subjects — Faculty Portal" },
      { property: "og:description", content: "Choose the subjects you teach." },
    ],
  }),
  component: TeacherSubjects,
});

function TeacherSubjects() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const all = useAllSubjects();
  const mine = useMySubjects(userId);
  const [form, setForm] = useState({ name: "", code: "", semester: "5" });
  const [busy, setBusy] = useState(false);

  const mineIds = new Set((mine.data ?? []).map((s) => s.id));

  async function refresh() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["subjects"] }),
      qc.invalidateQueries({ queryKey: ["my-subjects"] }),
    ]);
  }

  async function toggle(subjectId: string, teaching: boolean) {
    if (!userId) return;
    if (teaching) {
      await supabase
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", userId)
        .eq("subject_id", subjectId);
    } else {
      await supabase.from("teacher_subjects").insert({ teacher_id: userId, subject_id: subjectId });
    }
    await refresh();
  }

  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    const { data } = await supabase
      .from("subjects")
      .insert({
        name: form.name,
        code: form.code,
        semester: Number(form.semester),
        created_by: userId,
      })
      .select("id")
      .single();
    if (data?.id) {
      await supabase.from("teacher_subjects").insert({ teacher_id: userId, subject_id: data.id });
    }
    setForm({ name: "", code: "", semester: form.semester });
    setBusy(false);
    await refresh();
  }

  return (
    <TeacherShell title="My Subjects">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className={cardCls}>
          <h2 className="text-sm font-bold text-navy">Add a subject</h2>
          <form onSubmit={addSubject} className="mt-3 space-y-3">
            <input
              className={fieldCls}
              placeholder="Subject name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={fieldCls}
              placeholder="Subject code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <select
              className={fieldCls}
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
            <button disabled={busy} className={`${primaryBtn} w-full`}>
              <Plus className="h-4 w-4" /> Add &amp; teach this
            </button>
          </form>
        </section>

        <section className={cardCls}>
          <h2 className="text-sm font-bold text-navy">All subjects</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tick the ones you teach — everything else in your portal is filtered to these.
          </p>
          {all.isLoading ? (
            <p className="mt-4 text-xs text-muted-foreground">Loading…</p>
          ) : (all.data ?? []).length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">No subjects yet. Add your first one.</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {(all.data ?? []).map((s) => {
                const teaching = mineIds.has(s.id);
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.code || "—"} • Semester {s.semester}
                      </p>
                    </div>
                    <button
                      onClick={() => toggle(s.id, teaching)}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        teaching ? "bg-teal text-white" : "bg-secondary text-muted-foreground"
                      }`}
                      aria-label={teaching ? `Stop teaching ${s.name}` : `Teach ${s.name}`}
                    >
                      {teaching ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                    {s.created_by === userId ? (
                      <button
                        onClick={async () => {
                          await supabase.from("subjects").delete().eq("id", s.id);
                          await refresh();
                        }}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </TeacherShell>
  );
}
