import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Smart Student Portal" },
      {
        name: "description",
        content: "Register with your student ID, branch, year and semester to start tracking.",
      },
      { property: "og:title", content: "Create Account — Smart Student Portal" },
      {
        property: "og:description",
        content: "Register with your student ID, branch, year and semester.",
      },
    ],
  }),
  component: SignupPage,
});

const field =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-sky focus:ring-2 focus:ring-sky/25";

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    branch: "",
    year: "",
    semester: "",
    password: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setState((s) => ({ ...s, student: { ...form }, loggedIn: true }));
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <div className="bg-navy px-6 pt-14 pb-10 text-primary-foreground">
        <h1 className="text-2xl font-extrabold">Welcome!</h1>
        <p className="mt-1 text-sm text-white/70">Create your student account.</p>
      </div>

      <form onSubmit={submit} className="-mt-6 space-y-3.5 rounded-t-3xl bg-background px-6 pt-8 pb-12">
        <input className={field} placeholder="Full Name" value={form.fullName} onChange={set("fullName")} required />
        <input className={field} placeholder="Student ID" value={form.studentId} onChange={set("studentId")} required />
        <input className={field} type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input className={field} placeholder="Branch" value={form.branch} onChange={set("branch")} required />
        <select className={field} value={form.year} onChange={set("year")} required>
          <option value="">Year</option>
          {["First Year", "Second Year", "Third Year", "Final Year"].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <select className={field} value={form.semester} onChange={set("semester")} required>
          <option value="">Semester</option>
          {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          className={field}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={set("password")}
          required
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-primary-foreground"
        >
          Create Account
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-sky">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
