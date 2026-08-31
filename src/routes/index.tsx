import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, CalendarCheck, Receipt, ListTodo } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Student Portal — Attendance, Fees & Tasks" },
      {
        name: "description",
        content:
          "Track attendance, timetable, semester fees and assignment deadlines in one clean student app.",
      },
      { property: "og:title", content: "Smart Student Portal" },
      {
        property: "og:description",
        content: "One app for university attendance, fees and assignment deadlines.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between bg-navy px-6 py-14 text-primary-foreground">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/20">
          <GraduationCap className="h-12 w-12" />
        </div>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight">Smart Student Portal</h1>
        <p className="mt-3 max-w-xs text-sm text-white/70">
          Attendance, timetable, fees and deadlines — organised in one place for your whole degree.
        </p>

        <ul className="mt-10 grid w-full gap-3 text-left">
          {[
            { icon: CalendarCheck, text: "Mark daily attendance in seconds" },
            { icon: Receipt, text: "Track 8 semesters of fees & receipts" },
            { icon: ListTodo, text: "Never miss an assignment deadline" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
              <Icon className="h-5 w-5 shrink-0 text-teal" />
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <Link
          to="/signup"
          className="block rounded-2xl bg-teal py-3.5 text-center text-sm font-bold text-accent-foreground"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="block rounded-2xl border border-white/25 py-3.5 text-center text-sm font-semibold"
        >
          I already have an account
        </Link>
      </div>
    </div>
  );
}
