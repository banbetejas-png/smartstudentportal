import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/cloud";

export const Route = createFileRoute("/teacher")({
  ssr: false,
  component: TeacherLayout,
});

function TeacherLayout() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role !== "teacher") navigate({ to: "/login", replace: true });
  }, [loading, role, navigate]);

  if (loading || role !== "teacher") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          {loading ? "Loading faculty portal…" : "Faculty sign-in required. Redirecting…"}
        </p>
      </div>
    );
  }

  return <Outlet />;
}
