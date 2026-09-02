# Smart Student Portal

A mobile-first Progressive Web App (PWA) built for university students to manage attendance, subjects, marks, fees, tasks, and timetable — all offline in the browser using device storage.

**Live app:** https://smartstudentportal.lovable.app

## Features

- **Student onboarding** — Create a local profile (name, student ID, email, branch, year, semester). No email verification or cloud account required.
- **Today-first dashboard** — Greeting, attendance progress ring, today's schedule with inline Present/Absent/Off marking, upcoming deadlines, and quick links.
- **Subject manager** — Add subjects per semester with name, code, type (Theory/Lab), credits, and custom exam scheme (IA + External max marks). Subjects sync across Attendance and Academics.
- **Attendance tracker** — Semester-filtered subject list and weekly timetable grid with daily attendance markers.
- **Academics hub** —
  - **Marks:** IA 1, IA 2, and External marks per subject with automatic pass/fail based on each subject's exam scheme.
  - **Fees:** 8-semester fee cards with paid/total amounts and receipt upload.
- **Tasks & reminders** — Active and completed task lists with due-soon warnings.
- **Profile** — View/edit profile details, About Us card, and logout.
- **PWA / offline** — Installable on phones, works offline after first load (service worker activates on the published domain, not inside the Lovable preview).

## Tech Stack

- [React 19](https://react.dev/)
- [TanStack Start](https://tanstack.com/start/) + [TanStack Router](https://tanstack.com/router/)
- [Vite 8](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) components
- [date-fns](https://date-fns.org/), [lucide-react](https://lucide.dev/), [recharts](https://recharts.org/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the service worker and manifest

## Local Development

This project uses `bun`. If you don't have it installed, get it from [bun.sh](https://bun.sh/).

```bash
# 1. Clone the repository
git clone <this-repository-url>
cd <repository-name>

# 2. Install dependencies
bun install

# 3. Start the dev server
bun run dev
```

The app will be available at `http://localhost:8080` by default.

### Other useful commands

```bash
# Build for production
bun run build

# Preview the production build
bun run preview

# Lint
bun run lint

# Format code
bun run format
```

> **Note:** If you prefer npm, you can run `npm install` and `npm run dev` instead. The lockfile is `bun.lock`.

## Project Structure

```text
src/
  components/        # Reusable UI components (AppShell, ProgressRing, AddSubjectModal, etc.)
  hooks/             # Custom React hooks
  lib/               # State/store, helpers, and utilities
  routes/            # TanStack Start file-based routes
  router.tsx         # Router configuration
  server.ts          # SSR server entry wrapper
  start.ts           # App start configuration
  styles.css         # Global styles and Tailwind theme tokens
public/              # Static assets (PWA icons, favicon, robots.txt)
vite.config.ts       # Vite + PWA configuration
```

## How Data Works

All data is stored locally in the browser (`localStorage`). This means:

- ✅ Works fully offline after first load.
- ✅ No login, backend, or database setup needed.
- ⚠️ Data is tied to the device/browser. Clearing browser data will erase it.

## PWA / Offline Notes

- The service worker is **disabled in the Lovable preview** to avoid caching issues during development.
- To test offline installation, open the **published URL** on your phone, then use **Add to Home Screen** (Chrome/Safari).
- After installing, the app can be opened from the home screen icon and works offline.

## Exporting to GitHub from Lovable

This repo is synced from the Lovable editor. To reconnect or export:

1. Open the project in Lovable.
2. Click the **Plus (+)** menu in the chat input (bottom left).
3. Go to **GitHub → Connect project**.
4. Authorize the Lovable GitHub App and pick the account/organization.
5. Click **Create Repository**.

Changes pushed to `main` on GitHub sync back into Lovable, and changes made in Lovable push to GitHub automatically.

## Developers

- Tejas Banbe
- Atharva Bahulekar
- Mayur Bhoi
- Soham Bendal

**Version:** 1.0 (NEP Compliant)

---

Built with [Lovable](https://lovable.dev).
