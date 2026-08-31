# Homepage redesign (today-first) + remove demo login

## 1. Remove the demo button

- `src/routes/index.tsx`: remove the "Try demo — skip login" button and its `loginAsDemo` import. The welcome screen keeps only "Get Started" (signup) and "I already have an account" (login).
- `src/lib/store.ts`: remove the now-unused `demoStudent` and `loginAsDemo` exports (the placeholder profile stays, since it's used as the default profile data).

## 2. Today-first homepage

Rework `src/routes/dashboard.tsx` so the day itself is the hero, not a grid of navigation cards:

```text
┌─────────────────────────────────┐
│ Hi, Tejas          [ring 68%]   │
│ Mon, 31 Aug · 4 classes today   │
├─────────────────────────────────┤
│ TODAY'S SCHEDULE                │
│ 09:00  Database Systems   [P][A]│
│ 10:00  Operating Systems  [P][A]│
│ ...                             │
├─────────────────────────────────┤
│ UPCOMING DEADLINES              │
│ Assignment 3: DBMS — due 2 Sep  │
│ Journal: OS — due 5 Sep         │
├─────────────────────────────────┤
│ [Manage Subjects]  [Marks & Fees]│
└─────────────────────────────────┘
```

- **Header card**: greeting + date and class count, with the attendance `ProgressRing` beside it (smaller, ~110px) — the four action tiles are removed.
- **Today's Schedule becomes the main section**: each class for today (from the timetable) is a row showing the subject name/code with inline **P / A / Off** buttons that mark today's attendance directly from the dashboard — no need to open the Attendance tab for daily marking.
- **Upcoming Deadlines**: the 3 nearest pending tasks with due dates, plus a "See all" link to `/tasks`.
- **Bottom shortcuts**: two compact link cards — "Manage Subjects" (existing `/subjects` link card, kept) and "Marks & Fees" (`/academics`).
- The old "Quick Access" stat cards are removed (class count moves into the header; deadlines become the real list).

## Technical notes

- Marking attendance from the dashboard reuses the same state shape as the daily marker in `src/routes/attendance.tsx`: `attendance[todayKey][subjectId] = "present" | "absent" | "off"` via `setState` — no store changes needed.
- The dashboard's today list already reads `state.timetable[dayName()]`; only days without classes show the empty state with a link to the Timetable tab.
- No changes to navigation, subjects, academics, or fees screens.
