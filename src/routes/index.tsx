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
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-navy text-primary-foreground">
      {/* Portal glow ring that bursts open on app launch */}
      <div
        aria-hidden
        className="animate-portal-ring pointer-events-none absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
      {/* Screen content revealed through an expanding iris */}
      <div className="animate-portal-iris flex min-h-screen flex-col justify-between px-6 py-14">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-portal-logo grid h-24 w-24 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/20">
            <GraduationCap className="h-12 w-12" />
          </div>
          <h1 className="animate-fade-in mt-8 text-3xl font-extrabold tracking-tight [animation-delay:600ms] [animation-fill-mode:both]">
            Smart Student Portal
          </h1>
          <p className="animate-fade-in mt-3 max-w-xs text-sm text-white/70 [animation-delay:750ms] [animation-fill-mode:both]">
            Attendance, timetable, fees and deadlines — organised in one place for your whole degree.
          </p>

          <ul className="mt-10 grid w-full gap-3 text-left">
            {[
              { icon: CalendarCheck, text: "Mark daily attendance in seconds" },
              { icon: Receipt, text: "Track 8 semesters of fees & receipts" },
              { icon: ListTodo, text: "Never miss an assignment deadline" },
            ].map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="animate-fade-in flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 [animation-fill-mode:both]"
                style={{ animationDelay: `${900 + i * 120}ms` }}
              >
                <Icon className="h-5 w-5 shrink-0 text-teal" />
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-in space-y-3 [animation-delay:1300ms] [animation-fill-mode:both]">
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
    </div>
  );
}
