# Subject entry cleanup + combined Academics (Marks + Fees)

## 1. Attendance — smaller subject entry

- Remove the big floating "+" button from the Subjects tab.
- Put a small "+ Add Subject" pill button in the Subjects tab header, inline next to the "Current Semester" dropdown.
- The Add Subject modal stays the same (Semester 1-8, Name, Code, Theory/Lab, Credits) and pre-fills the semester currently selected.
- Subjects saved there stay global, so picking a semester in Attendance immediately shows those subjects in:
  - the Subjects list,
  - the Timetable day dropdowns,
  - the daily Present / Absent / Off / Clear marker (via the timetable),
  - the new Marks screen.

## 2. New combined "Academics" tab (replaces the Fees tab)

Bottom navigation stays at four items: Home, Attendance, Academics, Profile.
The Academics screen has two sub-tabs:

### Marks sub-tab
- "Current Semester" dropdown at the top (shares the same selection as Attendance).
- One card per subject of that semester, taken from the global subject list.
- Inputs per subject:
  - IA 1 — out of 20
  - IA 2 — out of 20
  - External — out of 60
- Auto-computed per subject:
  - IA Total = IA1 + IA2, out of 40. Pass at 16/40.
  - External pass at 24/60.
  - Overall total out of 100.
  - Status badge: Pass only when IA total >= 16 AND external >= 24; otherwise Fail / Incomplete when marks are missing.
- Semester summary strip at the top: subjects passed, subjects at risk, average percentage.
- Empty state when the semester has no subjects, with the same "+ Add Subject" button.

### Fees sub-tab
- The existing 8-semester fee cards, payment entry and receipt upload, moved here unchanged.

## 3. Persistence

Marks are stored on the device alongside attendance, subjects and fees, keyed by subject id, so they survive refresh. Deleting a subject also removes its marks.

## Technical notes

- `src/lib/store.ts`: add `Marks = { ia1, ia2, external }` and `marks: Record<subjectId, Marks>` to `AppState`; helpers `iaTotal`, `isPass` (IA >= 16/40 and external >= 24/60), plus cleanup of marks on subject delete.
- `src/components/AppShell.tsx`: change the Fees nav entry to Academics pointing at `/academics` (GraduationCap icon).
- New route `src/routes/academics.tsx` with Marks / Fees sub-tabs, own `head()` metadata; fee card UI moves in from `src/routes/fees.tsx`.
- `src/routes/fees.tsx` stays as a thin redirect to `/academics` so old links and the dashboard card keep working.
- `src/routes/attendance.tsx`: drop the fixed FAB, add the inline add-subject button in `SubjectFeeder`.
- Dashboard action cards updated to point at the new Academics tab.
