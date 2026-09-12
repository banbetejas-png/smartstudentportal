import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, SubjectRow } from "@/lib/cloud";

export function useAllSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("semester")
        .order("name");
      if (error) throw error;
      return (data ?? []) as SubjectRow[];
    },
  });
}

/** Subjects this teacher has picked in "My Subjects". */
export function useMySubjects(teacherId: string | null) {
  return useQuery({
    queryKey: ["my-subjects", teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_subjects")
        .select("subject_id, subjects(*)")
        .eq("teacher_id", teacherId!);
      if (error) throw error;
      return (data ?? [])
        .map((r) => r.subjects as unknown as SubjectRow)
        .filter(Boolean)
        .sort((a, b) => a.semester - b.semester || a.name.localeCompare(b.name));
    },
  });
}

/** Every student account, with profile details. */
export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");
      if (rolesError) throw rolesError;
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [] as Profile[];
      const { data, error } = await supabase.from("profiles").select("*").in("id", ids);
      if (error) throw error;
      return ((data ?? []) as Profile[]).sort((a, b) =>
        (a.roll_no ?? "").localeCompare(b.roll_no ?? "") || a.full_name.localeCompare(b.full_name),
      );
    },
  });
}
