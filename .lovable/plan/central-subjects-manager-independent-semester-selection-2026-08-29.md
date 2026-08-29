# Central Subjects manager + independent semester selection

## 1. New "Subjects" screen from Home

- Add a "Manage Subjects" action card on the Dashboard (Home) that opens a new `/subjects` screen.
- The screen has:
  - A "Semester" dropdown (1-8) at the top — this is the subject-manager's own selection.
  - The list of subjects for that semester (name, code, type, credits) with a delete icon.
  - An "+ Add Subject" button opening the existing Add Subject modal, pre-filled with the selected semester.
- Subjects stay one global list, so anything added here shows up in Attendance and Academics for the matching semester.

## 2. Independent semester selection per tab

Today Attendance and Academics share a single semester value, so changing it in one moves the other. Split it into three separate selections that never affect each other:

- Subjects screen semester
- Attendance semester (Subjects tab, Timetable tab, and the daily marker)
- Academics semester (Marks sub-tab)

Example: picking Semester 2 in Academics to review marks leaves Attendance exactly where it was.

Each selection is remembered on the device across refreshes.

## 3. Attendance screen after the change

- Attendance keeps its own "Subjects" tab listing the subjects of the attendance semester, plus the inline "+ Add Subject" button (unchanged behaviour), so adding is possible from either place.
- Timetable and the daily marker keep following the attendance semester only.

## Technical notes

- `src/lib/store.ts`: replace the single `currentSemester` with `subjectsSemester`, `attendanceSemester`, and `academicsSemester` (all default 5), keeping `currentSemester` read on hydration as the fallback value so existing saved data migrates cleanly.
- New route `src/routes/subjects.tsx` with its own `head()` metadata, reusing `AddSubjectModal` and the same delete logic as Attendance (also clears that subject's marks and timetable entries).
- `src/routes/attendance.tsx`: `SubjectFeeder`, `TimetableGrid`, and `DailyMarker` read/write `attendanceSemester`.
- `src/routes/academics.tsx`: Marks sub-tab reads/writes `academicsSemester`.
- `src/routes/dashboard.tsx`: add the "Manage Subjects" action card linking to `/subjects`.
