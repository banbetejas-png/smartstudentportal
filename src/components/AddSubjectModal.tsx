import { useState } from "react";
import { X } from "lucide-react";
import { setState, uid, type SubjectType } from "@/lib/store";

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-sky";

export function AddSubjectModal({
  open,
  defaultSemester,
  onClose,
}: {
  open: boolean;
  defaultSemester: number;
  onClose: () => void;
}) {
  const [semester, setSemester] = useState(defaultSemester);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<SubjectType>("Theory");
  const [credits, setCredits] = useState("3");

  if (!open) return null;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setState((s) => ({
      ...s,
      subjects: [
        ...s.subjects,
        {
          id: uid(),
          name: name.trim(),
          code: code.trim() || "—",
          semester: Number(semester),
          type,
          credits: Number(credits) || 0,
        },
      ],
    }));
    setName("");
    setCode("");
    setCredits("3");
    setType("Theory");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 backdrop-blur-sm sm:place-items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-2xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="truncate text-base font-extrabold text-navy">Add Subject</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={save} className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-muted-foreground">
            Target Semester
            <select
              className={`mt-1 ${field}`}
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Semester {n}
                </option>
              ))}
            </select>
          </label>

          <input
            className={field}
            placeholder="Subject Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={field}
            placeholder="Subject Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
            {(["Theory", "Lab"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg py-2 text-xs font-bold transition-colors ${
                  type === t ? "bg-navy text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            className={field}
            type="number"
            min="0"
            placeholder="Credits"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-primary-foreground"
          >
            Save Subject
          </button>
        </form>
      </div>
    </div>
  );
}
