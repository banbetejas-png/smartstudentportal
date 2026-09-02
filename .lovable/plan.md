# Consolidate files for easier export to VS Code

Goal: fewer files to copy around, with zero change to the app's look, behaviour or data.

## What can be merged safely

- **Shared UI** — `AppShell.tsx` and `AddSubjectModal.tsx` become one file `src/components/ui-kit.tsx` (both exports kept, same names).
- **Helpers** — `lib/utils.ts` and `lib/pwa.ts` fold into `src/lib/app-utils.ts`.
- **Error plumbing** — `lib/error-capture.ts`, `lib/error-page.ts`, `lib/lovable-error-reporting.ts` fold into `src/lib/error-handling.ts`.
- `src/routes/fees.tsx` (7 lines, just a redirect to Academics) can be deleted and the redirect handled by pointing existing links straight at `/academics`.

Result: 23 source files down to about 16, no visual or logic change. All imports across the app get updated in the same pass.

## What must stay separate

The app uses file-based routing: every screen's path comes from its filename in `src/routes/`. Merging `dashboard.tsx`, `attendance.tsx`, `academics.tsx`, etc. into one file would break the URLs and the bottom navigation, so those 10 route files stay as they are. Same for `router.tsx`, `server.ts`, `start.ts`, `routeTree.gen.ts` (auto-generated) and `store.ts` — each is required to be its own file by the framework, or is already the single shared state file.

## Getting the code into VS Code

Rather than restructuring for the copy, the simplest route is the GitHub export in Lovable (Project settings → GitHub), then `git clone` in VS Code — that brings every file over in one step regardless of count. The merge above is still worth doing if you want a leaner tree to read.

## Technical notes

- Merges are pure moves: file contents are pasted into the combined module unchanged, with duplicate imports de-duplicated.
- Every `@/components/AppShell`, `@/components/AddSubjectModal`, `@/lib/utils`, `@/lib/pwa` and error-module import is rewritten to the new path.
- After the merge, a build check confirms no broken imports and the preview is spot-checked on Dashboard, Attendance, Academics and Subjects.
