import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileUp, CheckCircle2, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { setState, useAppState, type FeeSemester } from "@/lib/store";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Fee Manager — Smart Student Portal" },
      {
        name: "description",
        content: "Track fees paid and pending across all 8 semesters and upload payment receipts.",
      },
      { property: "og:title", content: "Fee Manager — Smart Student Portal" },
      {
        property: "og:description",
        content: "Semester-wise fee tracking with receipt uploads.",
      },
    ],
  }),
  component: FeesPage,
});

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function FeesPage() {
  const { fees } = useAppState();
  const totalPaid = fees.reduce((a, f) => a + f.paid, 0);
  const totalDue = fees.reduce((a, f) => a + Math.max(0, f.total - f.paid), 0);

  return (
    <AppShell title="Fee Management">
      <section className="grid grid-cols-2 gap-3 rounded-2xl bg-navy p-4 text-primary-foreground">
        <div>
          <p className="text-[11px] text-white/70">Total Paid</p>
          <p className="text-xl font-extrabold">{inr(totalPaid)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/70">Total Due</p>
          <p className="text-xl font-extrabold text-teal">{inr(totalDue)}</p>
        </div>
      </section>

      <div className="mt-4 space-y-3">
        {fees.map((f) => (
          <SemesterCard key={f.semester} fee={f} />
        ))}
      </div>
    </AppShell>
  );
}

function SemesterCard({ fee }: { fee: FeeSemester }) {
  const paidFull = fee.paid >= fee.total;
  const fileRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");

  function update(patch: Partial<FeeSemester>) {
    setState((s) => ({
      ...s,
      fees: s.fees.map((x) => (x.semester === fee.semester ? { ...x, ...patch } : x)),
    }));
  }

  return (
    <article
      className={`rounded-2xl p-4 shadow-sm ${paidFull ? "bg-teal text-accent-foreground" : "bg-card"}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h3 className={`truncate text-sm font-bold ${paidFull ? "" : "text-navy"}`}>
          Semester {fee.semester}
        </h3>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            paidFull ? "bg-white/20" : "bg-secondary text-muted-foreground"
          }`}
        >
          {paidFull ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {paidFull ? "Paid" : "Pending"}
        </span>
      </div>

      <div className={`mt-2 flex gap-4 text-[11px] ${paidFull ? "text-white/85" : "text-muted-foreground"}`}>
        <span>Total: {inr(fee.total)}</span>
        <span>Paid: {inr(fee.paid)}</span>
        <span>Due: {inr(Math.max(0, fee.total - fee.paid))}</span>
      </div>

      {!paidFull ? (
        <div className="mt-3 flex gap-2">
          <input
            inputMode="numeric"
            placeholder="Add payment ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-sky"
          />
          <button
            onClick={() => {
              const n = Number(amount);
              if (!Number.isFinite(n) || n <= 0) return;
              update({ paid: Math.min(fee.total, fee.paid + n) });
              setAmount("");
            }}
            className="shrink-0 rounded-xl bg-sky px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            Save
          </button>
        </div>
      ) : null}

      <button
        onClick={() => fileRef.current?.click()}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold ${
          paidFull ? "bg-white/20" : "bg-navy text-primary-foreground"
        }`}
      >
        <FileUp className="h-4 w-4" />
        {fee.receipt ? `Receipt: ${fee.receipt}` : "Upload Receipt"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) update({ receipt: file.name });
        }}
      />
    </article>
  );
}
