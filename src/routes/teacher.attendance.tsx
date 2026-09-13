import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/cloud";
import { useMySubjects, useStudents } from "@/lib/teacher-data";
import { TeacherShell, cardCls, fieldCls } from "@/components/TeacherShell";

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({
    meta: [
      { title: "Class Attendance — Faculty Portal" },
      { name: "description", content: "Mark class attendance and export student reports as PDF or CSV." },
      { property: "og:title", content: "Class Attendance — Faculty Portal" },
      { property: "og:description", content: "Mark attendance and export reports." },
    ],
  }),
  component: TeacherAttendance,
});

type AttRow = { id: string; student_id: string; class_date: string; status: string };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function TeacherAttendance() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const subjects = useMySubjects(userId);
  const students = useStudents();
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    if (!subjectId && subjects.data?.[0]) setSubjectId(subjects.data[0].id);
  }, [subjects.data, subjectId]);

  const records = useQuery({
    queryKey: ["class-attendance", subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_attendance")
        .select("id, student_id, class_date, status")
        .eq("subject_id", subjectId);
      if (error) throw error;
      return (data ?? []) as AttRow[];
    },
  });

  const rows = records.data ?? [];
  const roster = students.data ?? [];
  const subject = subjects.data?.find((s) => s.id === subjectId);

  const stats = (studentId: string) => {
    const mine = rows.filter((r) => r.student_id === studentId);
    const present = mine.filter((r) => r.status === "present").length;
    const total = mine.length;
    return { present, total, pct: total ? Math.round((present / total) * 100) : 0 };
  };

  const statusFor = (studentId: string) =>
    rows.find((r) => r.student_id === studentId && r.class_date === date)?.status ?? null;

  async function mark(studentId: string, status: "present" | "absent") {
    if (!userId || !subjectId) return;
    await supabase.from("class_attendance").upsert(
      { subject_id: subjectId, teacher_id: userId, student_id: studentId, class_date: date, status },
      { onConflict: "subject_id,student_id,class_date" },
    );
    await qc.invalidateQueries({ queryKey: ["class-attendance", subjectId] });
  }

  function tableData() {
    return roster.map((st) => {
      const s = stats(st.id);
      return [st.roll_no || "—", st.full_name, `${s.present}/${s.total}`, `${s.pct}%`];
    });
  }

  function exportCsv() {
    const header = ["Roll No", "Name", "Present/Total", "Percentage"];
    const csv = [header, ...tableData()]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${subject?.name ?? "subject"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Attendance — ${subject?.name ?? "Subject"}`, 14, 16);
    doc.setFontSize(10);
    doc.text(`Semester ${subject?.semester ?? "-"} • generated ${new Date().toLocaleDateString()}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [["Roll No", "Name", "Present/Total", "Percentage"]],
      body: tableData(),
      headStyles: { fillColor: [26, 59, 139] },
    });
    doc.save(`attendance-${subject?.name ?? "subject"}.pdf`);
  }

  return (
    <TeacherShell title="Class Attendance">
      <section className={cardCls}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-48 flex-1">
            <span className="text-xs text-muted-foreground">Subject</span>
            <select
              className={`${fieldCls} mt-1`}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {(subjects.data ?? []).length === 0 ? <option value="">No subjects picked</option> : null}
              {(subjects.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-40">
            <span className="text-xs text-muted-foreground">Date</span>
            <input
              type="date"
              className={`${fieldCls} mt-1`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-3.5 py-2.5 text-xs font-bold text-primary-foreground"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-3.5 py-2.5 text-xs font-bold text-white"
          >
            <FileSpreadsheet className="h-4 w-4" /> CSV
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {roster.map((st) => {
            const s = stats(st.id);
            const status = statusFor(st.id);
            return (
              <li
                key={st.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">
                    {st.full_name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({st.roll_no || "—"})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.present}/{s.total} classes
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    s.total && s.pct < 75 ? "bg-destructive/10 text-destructive" : "bg-teal/10 text-teal"
                  }`}
                >
                  {s.pct}%
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => mark(st.id, "present")}
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${
                      status === "present" ? "bg-teal text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => mark(st.id, "absent")}
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${
                      status === "absent"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </li>
            );
          })}
          {roster.length === 0 ? (
            <p className="text-xs text-muted-foreground">No student accounts yet.</p>
          ) : null}
        </ul>
      </section>
    </TeacherShell>
  );
}
