import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fileUrl, formatDateTime, useAuth } from "@/lib/cloud";
import { useStudents } from "@/lib/teacher-data";
import { TeacherShell, cardCls, fieldCls } from "@/components/TeacherShell";

export const Route = createFileRoute("/teacher/submissions")({
  head: () => ({
    meta: [
      { title: "Submissions — Faculty Portal" },
      { name: "description", content: "Check who submitted, open their files and record marks and feedback." },
      { property: "og:title", content: "Submissions — Faculty Portal" },
      { property: "og:description", content: "Check submissions and grade them." },
    ],
  }),
  component: TeacherSubmissions,
});

type SubmissionRow = {
  id: string;
  student_id: string;
  file_path: string | null;
  submitted_at: string;
  received: boolean;
  marks: number | null;
  feedback: string | null;
};

function TeacherSubmissions() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const students = useStudents();
  const [assignmentId, setAssignmentId] = useState("");
  const [draft, setDraft] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  const assignments = useQuery({
    queryKey: ["assignments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("id, title, max_marks, due_at")
        .eq("teacher_id", userId!)
        .order("due_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!assignmentId && assignments.data?.[0]) setAssignmentId(assignments.data[0].id);
  }, [assignments.data, assignmentId]);

  const submissions = useQuery({
    queryKey: ["submissions", assignmentId],
    enabled: !!assignmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", assignmentId);
      if (error) throw error;
      return (data ?? []) as SubmissionRow[];
    },
  });

  const byStudent = new Map((submissions.data ?? []).map((s) => [s.student_id, s]));
  const selected = assignments.data?.find((a) => a.id === assignmentId);

  async function save(sub: SubmissionRow) {
    const d = draft[sub.id];
    await supabase
      .from("submissions")
      .update({
        marks: d?.marks ? Number(d.marks) : sub.marks,
        feedback: d?.feedback ?? sub.feedback,
      })
      .eq("id", sub.id);
    setSavedId(sub.id);
    await qc.invalidateQueries({ queryKey: ["submissions", assignmentId] });
  }

  async function toggleReceived(sub: SubmissionRow) {
    await supabase.from("submissions").update({ received: !sub.received }).eq("id", sub.id);
    await qc.invalidateQueries({ queryKey: ["submissions", assignmentId] });
  }

  return (
    <TeacherShell title="Submissions & Grading">
      <section className={cardCls}>
        <label className="block max-w-md">
          <span className="text-xs text-muted-foreground">Assignment</span>
          <select
            className={`${fieldCls} mt-1`}
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
          >
            {(assignments.data ?? []).length === 0 ? <option value="">No assignments yet</option> : null}
            {(assignments.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </label>

        <ul className="mt-4 space-y-2">
          {(students.data ?? []).map((st) => {
            const sub = byStudent.get(st.id);
            const d = sub ? (draft[sub.id] ?? { marks: sub.marks?.toString() ?? "", feedback: sub.feedback ?? "" }) : null;
            return (
              <li key={st.id} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
                    {st.full_name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({st.roll_no || "—"})
                    </span>
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      sub ? "bg-teal/10 text-teal" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {sub ? "Submitted" : "Not submitted"}
                  </span>
                </div>

                {sub ? (
                  <>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(sub.submitted_at)}
                      {selected ? ` • out of ${selected.max_marks}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {sub.file_path ? (
                        <button
                          onClick={async () => {
                            const url = await fileUrl("submissions", sub.file_path!);
                            if (url) window.open(url, "_blank");
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky"
                        >
                          <Paperclip className="h-3.5 w-3.5" /> Open file
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No file attached</span>
                      )}
                      <button
                        onClick={() => toggleReceived(sub)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                          sub.received ? "bg-teal text-white" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" /> {sub.received ? "Received" : "Mark received"}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        className={`${fieldCls} max-w-24`}
                        type="number"
                        min={0}
                        placeholder="Marks"
                        value={d?.marks ?? ""}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            [sub.id]: { marks: e.target.value, feedback: d?.feedback ?? "" },
                          }))
                        }
                      />
                      <input
                        className={`${fieldCls} max-w-xs flex-1`}
                        placeholder="Feedback"
                        value={d?.feedback ?? ""}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            [sub.id]: { marks: d?.marks ?? "", feedback: e.target.value },
                          }))
                        }
                      />
                      <button
                        onClick={() => save(sub)}
                        className="rounded-xl bg-teal px-4 py-2.5 text-xs font-bold text-white"
                      >
                        Save feedback
                      </button>
                      {savedId === sub.id ? (
                        <span className="text-xs font-semibold text-teal">Saved</span>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </li>
            );
          })}
          {(students.data ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No student accounts yet.</p>
          ) : null}
        </ul>
      </section>
    </TeacherShell>
  );
}
