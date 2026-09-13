import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Megaphone, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, useAuth } from "@/lib/cloud";
import { useMySubjects } from "@/lib/teacher-data";
import { TeacherShell, cardCls, fieldCls, primaryBtn } from "@/components/TeacherShell";

export const Route = createFileRoute("/teacher/notices")({
  head: () => ({
    meta: [
      { title: "Notices — Faculty Portal" },
      { name: "description", content: "Send important messages and announcements to your students." },
      { property: "og:title", content: "Notices — Faculty Portal" },
      { property: "og:description", content: "Send announcements to students." },
    ],
  }),
  component: TeacherNotices,
});

type NoticeRow = {
  id: string;
  title: string;
  message: string;
  subject_id: string | null;
  created_at: string;
};

function TeacherNotices() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const subjects = useMySubjects(userId);
  const [form, setForm] = useState({ title: "", message: "", subject_id: "" });
  const [busy, setBusy] = useState(false);

  const notices = useQuery({
    queryKey: ["notices", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("teacher_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NoticeRow[];
    },
  });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    await supabase.from("notices").insert({
      teacher_id: userId,
      title: form.title,
      message: form.message,
      subject_id: form.subject_id || null,
    });
    setForm({ title: "", message: "", subject_id: form.subject_id });
    setBusy(false);
    await qc.invalidateQueries({ queryKey: ["notices"] });
  }

  return (
    <TeacherShell title="Notices">
      <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className={cardCls}>
          <h2 className="text-sm font-bold text-navy">New notice</h2>
          <form onSubmit={send} className="mt-3 space-y-3">
            <input
              className={fieldCls}
              placeholder="Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className={fieldCls}
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            >
              <option value="">All students</option>
              {(subjects.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
            <textarea
              className={fieldCls}
              rows={4}
              placeholder="Message"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button disabled={busy} className={`${primaryBtn} w-full`}>
              <Megaphone className="h-4 w-4" /> {busy ? "Sending…" : "Send notice"}
            </button>
          </form>
        </section>

        <section className={cardCls}>
          <h2 className="text-sm font-bold text-navy">Sent</h2>
          {(notices.data ?? []).length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">No notices sent yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(notices.data ?? []).map((n) => (
                <li key={n.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{n.title}</p>
                    <button
                      onClick={async () => {
                        await supabase.from("notices").delete().eq("id", n.id);
                        await qc.invalidateQueries({ queryKey: ["notices"] });
                      }}
                      className="text-destructive"
                      aria-label="Delete notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-foreground/80">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDateTime(n.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </TeacherShell>
  );
}
