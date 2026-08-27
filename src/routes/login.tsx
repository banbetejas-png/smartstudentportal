import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Smart Student Portal" },
      { name: "description", content: "Sign in to your Smart Student Portal account." },
      { property: "og:title", content: "Login — Smart Student Portal" },
      { property: "og:description", content: "Sign in to your student portal account." },
    ],
  }),
  component: LoginPage,
});

const field =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-sky focus:ring-2 focus:ring-sky/25";

function LoginPage() {
  const { student } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!student) {
      setError("No account found on this device. Please sign up first.");
      return;
    }
    if (student.email.toLowerCase() !== email.trim().toLowerCase() || student.password !== password) {
      setError("Incorrect email or password.");
      return;
    }
    setState((s) => ({ ...s, loggedIn: true }));
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <div className="bg-navy px-6 pt-14 pb-10 text-primary-foreground">
        <h1 className="text-2xl font-extrabold">Welcome back!</h1>
        <p className="mt-1 text-sm text-white/70">Sign in to continue to your portal.</p>
      </div>

      <form onSubmit={submit} className="-mt-6 space-y-4 rounded-t-3xl bg-background px-6 pt-8 pb-12">
        <input
          className={field}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={field}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-right">
          <button
            type="button"
            onClick={() => setError("Password reset is not available in this offline demo.")}
            className="text-xs font-semibold text-sky"
          >
            Forgot Password?
          </button>
        </div>
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-primary-foreground"
        >
          Login
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-sky">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
