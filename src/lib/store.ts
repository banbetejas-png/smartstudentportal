import { useSyncExternalStore } from "react";

export type Student = {
  fullName: string;
  studentId: string;
  email: string;
  branch: string;
  year: string;
  semester: string;
  password: string;
};

export type SubjectType = "Theory" | "Lab";
export type Subject = {
  id: string;
  name: string;
  code: string;
  semester: number;
  type: SubjectType;
  credits: number;
};
export type AttendanceMark = "present" | "absent" | "off";
export type Task = {
  id: string;
  title: string;
  subject: string;
  due: string;
  done: boolean;
};
export type FeeSemester = {
  semester: number;
  total: number;
  paid: number;
  receipt?: string;
};

export type Marks = {
  ia1: number | null;
  ia2: number | null;
  external: number | null;
};

export type AppState = {
  student: Student | null;
  loggedIn: boolean;
  subjectsSemester: number;
  attendanceSemester: number;
  academicsSemester: number;
  subjects: Subject[];
  timetable: Record<string, string[]>;
  attendance: Record<string, Record<string, AttendanceMark>>;
  tasks: Task[];
  fees: FeeSemester[];
  marks: Record<string, Marks>;
};

export const IA_MAX = 20;
export const IA_TOTAL_MAX = 40;
export const IA_PASS = 16;
export const EXTERNAL_MAX = 60;
export const EXTERNAL_PASS = 24;

export const emptyMarks: Marks = { ia1: null, ia2: null, external: null };

export function iaTotal(m: Marks) {
  if (m.ia1 == null && m.ia2 == null) return null;
  return (m.ia1 ?? 0) + (m.ia2 ?? 0);
}

export type MarkStatus = "pass" | "fail" | "incomplete";

export function markStatus(m: Marks): MarkStatus {
  if (m.ia1 == null || m.ia2 == null || m.external == null) return "incomplete";
  return (m.ia1 + m.ia2 >= IA_PASS && m.external >= EXTERNAL_PASS) ? "pass" : "fail";
}

export function totalMarks(m: Marks) {
  const ia = iaTotal(m);
  if (ia == null && m.external == null) return null;
  return (ia ?? 0) + (m.external ?? 0);
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const KEY = "smart-student-portal";

export const placeholderProfile: Student = {
  fullName: "Tejas Banbe",
  studentId: "DMCE2026001",
  email: "tejas@dmce.ac.in",
  branch: "Computer Engineering",
  year: "Third Year",
  semester: "5",
  password: "",
};

const defaultState: AppState = {
  student: placeholderProfile,
  loggedIn: false,
  currentSemester: 5,
  subjects: [],
  timetable: {},
  attendance: {},
  tasks: [
    {
      id: "t1",
      title: "Assignment 3: DBMS",
      subject: "Database Systems",
      due: "2026-09-02",
      done: false,
    },
    {
      id: "t2",
      title: "Journal Submission: OS",
      subject: "Operating Systems",
      due: "2026-09-05",
      done: false,
    },
    {
      id: "t3",
      title: "Project Phase 1: SE",
      subject: "Software Engineering",
      due: "2026-09-12",
      done: false,
    },
  ],
  fees: Array.from({ length: 8 }, (_, i) => ({
    semester: i + 1,
    total: 60000,
    paid: i < 3 ? 60000 : 0,
  })),
  marks: {},
};


let state: AppState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...defaultState, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function setState(update: (prev: AppState) => AppState) {
  state = update(state);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
  emit();
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  cb();
  return () => listeners.delete(cb);
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => defaultState,
  );
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function dayName(d = new Date()) {
  return (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] ?? "Mon") as string;
}

export function overallAttendance(s: AppState) {
  let total = 0;
  let present = 0;
  Object.values(s.attendance).forEach((day) => {
    Object.values(day).forEach((mark) => {
      if (mark === "off") return;
      total += 1;
      if (mark === "present") present += 1;
    });
  });
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

export function subjectAttendance(s: AppState, subjectId: string) {
  let total = 0;
  let present = 0;
  Object.values(s.attendance).forEach((day) => {
    const mark = day[subjectId];
    if (!mark || mark === "off") return;
    total += 1;
    if (mark === "present") present += 1;
  });
  return total === 0 ? null : Math.round((present / total) * 100);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const demoStudent: Student = {
  fullName: "Demo Student",
  studentId: "DMCE2026001",
  email: "demo@student.app",
  branch: "Computer Engineering",
  year: "3rd Year",
  semester: "5",
  password: "demo1234",
};

export function loginAsDemo() {
  setState((s) => ({ ...s, student: s.student ?? demoStudent, loggedIn: true }));
}
