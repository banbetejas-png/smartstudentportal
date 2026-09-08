import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/teacher")({
  ssr: false,
  component: TeacherLayout,
});

function TeacherLayout() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session || session.role !== "teacher") {
      navigate({ to: "/login", replace: true });
    }
  }, [session, navigate]);

  if (!session || session.role !== "teacher") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Faculty sign-in required. Redirecting to login…
        </p>
      </div>
    );
  }

  return <Outlet />;
}
