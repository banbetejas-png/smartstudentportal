# Add README and Export to GitHub

## Goal
Prepare the project for GitHub export by adding a helpful README, then guide the user through the Lovable GitHub sync steps.

## What will be done
1. Create `README.md` at the project root with:
   - App name and short description (Smart Student Portal)
   - Tech stack (React, TanStack Start, Vite, Tailwind CSS, PWA)
   - Local setup instructions (`bun install` / `bun run dev`)
   - Build command (`bun run build`)
   - Notes about offline/PWA behavior and the service worker guard
   - Folder structure summary
2. No other source files will be changed.
3. After the README is added, provide the GitHub export steps in chat.

## Out of scope
- No UI or backend changes.
- No new dependencies.
- The actual GitHub connection/repo creation is performed by the user inside the Lovable editor; this plan only prepares the codebase.
