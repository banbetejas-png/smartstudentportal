# Faculty + Student: Assignments, Attendance Reports & Notices

Adds a real cloud backend for everything teachers and students must share, keeps your existing
on-device student tracking untouched, and refreshes the look of both sides.

## Accounts and subjects

- Real sign-in replaces the hardcoded demo logins: everyone signs up / signs in with email and
  password, and each account is either a teacher or a student.
- The two demo logins (teacher@portal.edu / student@portal.edu) are kept as seeded accounts so you
  can still demo instantly.
- A teacher opens "My Subjects" and picks which subjects they teach (from the subject list, with
  semester). Everything a teacher sees — roster, assignments, submissions, notices — is filtered to
  only their chosen subjects. Two teachers picking different subjects never see each other's work.
- Students see assignments and notices for the subjects of their semester.

## New teacher pages

1. **Dashboard** — cleaner metric cards, quick links to the sections below.
2. **My Subjects** — pick/remove the subjects this teacher handles.
3. **Assignments** — publish with Title, Subject, Description, Max Marks, Upload date (auto), Due
   date & time, and a file attachment. List of published assignments with due-soon / overdue tags
   and a delete option.
4. **Submissions** — per assignment, the full class list showing Submitted / Not submitted, the
   student's attached file, a tick to confirm received, marks input and Save Feedback.
5. **Attendance** — subject + date selectors, roster with Present / Absent, red badge under 75%,
   and **Download PDF** and **Download CSV** buttons for the attendance sheet (per subject, whole
   class, with each student's percentage).
6. **Notices** — write an important message, choose subject or whole class, and send. Students see
   it as a notification.

## New student pages

- **Assignments** — list of assignments posted by faculty with due date, attachment to download,
  and an upload box to submit their own file. Shows Submitted / Pending and, once graded, the marks
  and feedback.
- **Notices** — inbox of teacher messages, with an unread dot on the existing bell icon in the
  header.

Existing student screens (dashboard, attendance tracker, academics/marks, fees, subjects, profile)
keep their current behaviour and stay on-device; only spacing, cards and typography get polished.

## Styling

Same palette (navy #1A3B8B header/buttons, teal #0FA497 accents, light canvas, white rounded
cards), same Lucide icons and rounded corners. Both teacher and student screens get a consistent
pass: tighter card rhythm, clearer section headers, better mobile tap targets, and desktop layouts
that use two/three columns instead of a stretched phone column.

## Technical notes

- Enable Lovable Cloud (database + auth + file storage).
- Tables: `profiles` (name, role, roll no, semester, branch), `user_roles` (separate role table with
  a `has_role` check), `subjects`, `teacher_subjects`, `assignments`, `submissions`,
  `class_attendance`, `notices`, `notice_reads`. Row-level security on every table: teachers can
  only write rows for subjects they own; students can only read what targets them and write their
  own submissions.
- Storage buckets for assignment attachments and student submissions, with per-user path policies.
- Data access through TanStack `createServerFn` with the authenticated middleware; protected pages
  live under the auth-gated route group, with `/teacher/*` additionally checking the teacher role.
- PDF export via a client-side jsPDF + autotable render; CSV built in the browser — no server job.
- Existing localStorage store stays as the student's personal tracker; nothing is migrated or
  deleted.

## Scope note

This is a large build. It will land in stages: backend + auth/roles first, then teacher assignments
and submissions, then attendance export and notices, then the student-side pages and the UI polish
pass.
