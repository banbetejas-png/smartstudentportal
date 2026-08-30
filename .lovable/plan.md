# Per-Subject Exam Schemes

## Problem
Marks entry currently assumes one fixed scheme for every subject: IA 1 + IA 2 out of 20 each (pass 16/40) and External out of 60 (pass 24/60). Some subjects use different totals, e.g. internals out of 15 or 10, and externals out of 45.

## What we'll build
Each subject gets its own **exam scheme** chosen when adding the subject. Marks entry, totals, and pass/fail status in the Academics tab then follow that subject's scheme.

### 1. Scheme field on subjects
- Add an `Exam Scheme` dropdown to the Add Subject modal with presets:
  - **20 + 20 IA / 60 External** (current default)
  - **15 + 15 IA / 45 External**
  - **10 + 10 IA / 30 External**
  - **Custom** — enter IA max (per IA), External max manually
- Pass marks auto-computed at 40% of each total (e.g. 12/30 IA, 18/45 external).

### 2. Marks screen uses the subject's scheme
- Input placeholders/limits show the correct max per subject.
- IA Total and External lines show the right denominators (e.g. 18/45).
- Pass/Fail uses that subject's 40% thresholds.
- Marks inputs validate: values above the scheme max are rejected/clamped.

### 3. Backward compatibility
- Subjects added before this change (no scheme stored) fall back to the default 20/40/60 scheme, so existing data keeps working.

## Technical notes
- `src/lib/store.ts`: add `scheme?: { iaMax: number; externalMax: number }` to `Subject`; replace fixed `IA_MAX/IA_TOTAL_MAX/EXTERNAL_MAX/IA_PASS/EXTERNAL_PASS` constants with a `schemeOf(subject)` helper returning maxes and pass marks; update `marksStatus`, `iaTotal`, `grandTotal` to take the scheme.
- `src/components/AddSubjectModal.tsx`: add scheme preset dropdown + custom max inputs.
- `src/routes/academics.tsx`: read each subject's scheme for labels, validation, and status; update summary counts unchanged.
