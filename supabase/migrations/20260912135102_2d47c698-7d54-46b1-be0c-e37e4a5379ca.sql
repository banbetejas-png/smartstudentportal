CREATE TYPE public.app_role AS ENUM ('teacher', 'student');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  roll_no TEXT,
  branch TEXT,
  semester INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own role insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  semester INT NOT NULL DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects readable" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "teachers add subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') AND created_by = auth.uid());
CREATE POLICY "teachers edit own subjects" ON public.subjects FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "teachers delete own subjects" ON public.subjects FOR DELETE TO authenticated USING (created_by = auth.uid());

-- teacher_subjects
CREATE TABLE public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, subject_id)
);
GRANT SELECT, INSERT, DELETE ON public.teacher_subjects TO authenticated;
GRANT ALL ON public.teacher_subjects TO service_role;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher subjects readable" ON public.teacher_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "teacher manages own subject links" ON public.teacher_subjects FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid() AND public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "teacher removes own subject links" ON public.teacher_subjects FOR DELETE TO authenticated USING (teacher_id = auth.uid());

CREATE OR REPLACE FUNCTION public.teaches_subject(_user_id UUID, _subject_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.teacher_subjects WHERE teacher_id = _user_id AND subject_id = _subject_id)
$$;

-- assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  max_marks INT NOT NULL DEFAULT 20,
  due_at TIMESTAMPTZ NOT NULL,
  attachment_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments readable" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "teacher creates assignment" ON public.assignments FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid() AND public.teaches_subject(auth.uid(), subject_id));
CREATE POLICY "teacher updates own assignment" ON public.assignments FOR UPDATE TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "teacher deletes own assignment" ON public.assignments FOR DELETE TO authenticated USING (teacher_id = auth.uid());
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  file_path TEXT,
  note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  received BOOLEAN NOT NULL DEFAULT false,
  marks INT,
  feedback TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student reads own submission" ON public.submissions FOR SELECT TO authenticated USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid())
);
CREATE POLICY "student creates own submission" ON public.submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "student or teacher updates submission" ON public.submissions FOR UPDATE TO authenticated USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid())
) WITH CHECK (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.teacher_id = auth.uid())
);
CREATE POLICY "student deletes own submission" ON public.submissions FOR DELETE TO authenticated USING (student_id = auth.uid());
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- class attendance
CREATE TABLE public.class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL,
  class_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subject_id, student_id, class_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_attendance TO authenticated;
GRANT ALL ON public.class_attendance TO service_role;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance readable by owner or teacher" ON public.class_attendance FOR SELECT TO authenticated USING (
  student_id = auth.uid() OR public.teaches_subject(auth.uid(), subject_id)
);
CREATE POLICY "teacher records attendance" ON public.class_attendance FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid() AND public.teaches_subject(auth.uid(), subject_id));
CREATE POLICY "teacher updates attendance" ON public.class_attendance FOR UPDATE TO authenticated USING (public.teaches_subject(auth.uid(), subject_id)) WITH CHECK (public.teaches_subject(auth.uid(), subject_id));
CREATE POLICY "teacher deletes attendance" ON public.class_attendance FOR DELETE TO authenticated USING (public.teaches_subject(auth.uid(), subject_id));
CREATE TRIGGER class_attendance_updated_at BEFORE UPDATE ON public.class_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- notices
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notices readable" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "teacher posts notice" ON public.notices FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid() AND public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "teacher deletes own notice" ON public.notices FOR DELETE TO authenticated USING (teacher_id = auth.uid());

CREATE TABLE public.notice_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (notice_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.notice_reads TO authenticated;
GRANT ALL ON public.notice_reads TO service_role;
ALTER TABLE public.notice_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notice reads" ON public.notice_reads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "mark notice read" ON public.notice_reads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());