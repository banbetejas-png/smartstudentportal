import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Paperclip, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { dueLabel, fileUrl, formatDateTime, useAuth } from "@/lib/cloud";
import { useMySubjects } from "@/lib/teacher-data";
import { TeacherShell, cardCls, fieldCls, primaryBtn } from "@/components/TeacherShell";

export const Route = createFileRoute("/teacher/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — Faculty Portal" },
      { name: "description", content: "Publish assignments with attachments and due dates for your classes." },
      { property: "og:title", content: "Assignments — Faculty Portal" },
      { property: "og:description", content: "Publish assignments with attachments and due dates." },
    ],
  }),
  component: TeacherAssignments,
});

type AssignmentRow = {
  id: string;
  title: string;
  description: string;
  max_marks: number;
  due_at: string;
  created_at: string;
  attachment_path: string | null;
  subject_id: string;
};

function TeacherAssignments() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const subjects = useMySubjects(userId);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    subject_id: "",
    max_marks: "20",
    due_at: "",
    description: "",
  });

  const list = useQuery({
    queryKey: ["assignments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("teacher_id", userId!)
        .order("due_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AssignmentRow[];
    },
  });

  const subjectName = (id: string) =>
    subjects.data?.find((s) => s.id === id)?.name ?? "Subject";

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !form.subject_id) return;
    setBusy(true);
    let attachment_path: string | null = null;
    if (file) {
      const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("assignments").upload(path, file);
      if (!error) attachment_path = path;
    }
    await supabase.from("assignments").insert({
      teacher_id: userId,
      subject_id: form.subject_id,
      title: form.title,
      description: form.description,
      max_marks: Number(form.max_marks),
      due_at: new Date(form.due_at).toISOString(),
      attachment_path,
    });
    setForm({ title: "", subject_id: form.subject_id, max_marks: "20", due_at: "", description: "" });
    setFile(null);
    setBusy(false);
    await qc.invalidateQueries({ queryKey: ["assignments"] });
  }

  async function openFile(path: string) {
    const url = await fileUrl("assignments", path);
    if (url) window.open(url, "_blank");
  }

  return (
    <TeacherShell title="Assignments">
      {(subjects.data ?? []).length === 0 ? (
        <p className={`${cardCls} text-xs text-muted-foreground`}>
          Pick the subjects you teach in "My Subjects" first.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className={cardCls}>
            <h2 className="text-sm font-bold text-navy">Publish new assignment</h2>
            <form onSubmit={publish} className="mt-3 space-y-3">
              <input
                className={fieldCls}
                placeholder="Title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <select
                className={fieldCls}
                required
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              >
                <option value="">Select subject</option>
                {(subjects.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Sem {s.semester})
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={fieldCls}
                  type="number"
                  min={1}
                  placeholder="Max marks"
                  required
                  value={form.max_marks}
                  onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
                />
                <input
                  className={fieldCls}
                  type="datetime-local"
                  required
                  value={form.due_at}
                  onChange={(e) => setForm({ ...form, due_at: e.target.value })}
                />
              </div>
              <textarea
                className={fieldCls}
                rows={3}
                placeholder="Description / instructions"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                {file ? file.name : "Attach a file (optional)"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <button disabled={busy} className={`${primaryBtn} w-full`}>
                <Plus className="h-4 w-4" /> {busy ? "Publishing…" : "Publish assignment"}
              </button>
            </form>
          </section>

          <section className={cardCls}>
            <h2 className="text-sm font-bold text-navy">Published</h2>
            {list.isLoading ? (
              <p className="mt-3 text-xs text-muted-foreground">Loading…</p>
            ) : (list.data ?? []).length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">Nothing published yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {(list.data ?? []).map((a) => {
                  const tag = dueLabel(a.due_at);
                  return (
                    <li key={a.id} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
                          {a.title}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tag.tone}`}>
                          {tag.text}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {subjectName(a.subject_id)} • {a.max_marks} marks • due {formatDateTime(a.due_at)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Posted {formatDateTime(a.created_at)}
                      </p>
                      {a.description ? (
                        <p className="mt-1.5 text-xs text-foreground/80">{a.description}</p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-3">
                        {a.attachment_path ? (
                          <button
                            onClick={() => openFile(a.attachment_path!)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky"
                          >
                            <Paperclip className="h-3.5 w-3.5" /> Attachment
                          </button>
                        ) : null}
                        <button
                          onClick={async () => {
                            await supabase.from("assignments").delete().eq("id", a.id);
                            await qc.invalidateQueries({ queryKey: ["assignments"] });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </TeacherShell>
  );
}
