# Build Progress

Tracks the phase checklist from the build plan. Check items off as they land; keep this file up to date so work can resume across sessions without re-deriving state.

Repo: https://github.com/SHAN0945/HealthFirst
DB: Neon Postgres (project connected, migration `20260820140629_init` applied)

## Phase 1 — Foundation ✅
- [x] `create-next-app` (TypeScript, App Router, Tailwind)
- [x] Prisma installed, full schema written (`prisma/schema.prisma`), client generates cleanly
- [x] `.env.example` with every var needed
- [x] Pushed to GitHub (`main`)
- [x] Neon Postgres provisioned, first migration run against it
- [x] Deployed to Vercel — https://healthcare-appointment-manager-three.vercel.app (project `shan0945s-projects/healthcare-appointment-manager`)
  - Note: early deploy attempts sat permanently BLOCKED with no error shown by `vercel deploy`'s streaming output — root cause (found via the Vercel REST API, not the CLI UI) was that git commit authorship didn't match a verified member of the Vercel team, which Vercel silently blocks as an anti-abuse measure. Fixed by setting `git config user.email/user.name` to the account's actual GitHub-linked identity before committing.

## Phase 2 — Auth & Roles ✅ verified end-to-end
- [x] NextAuth v5 credentials provider, bcrypt password hashing
- [x] Role on JWT/session (`src/auth.ts`, `src/types/next-auth.d.ts`)
- [x] `src/proxy.ts` (Next.js 16 middleware convention) protects `/admin`, `/doctor`, `/patient` by role
- [x] Patient self-registration (`/register`, `POST /api/auth/register`)
- [x] Admin bootstrap via `prisma/seed.ts` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- [x] Placeholder dashboard shells for all three roles
- [x] Smoke-tested against live Neon DB: register → sign in → role-based redirect all confirmed working

## Phase 3 — Admin: Doctor Management ✅ verified end-to-end
- [x] Admin CRUD for doctor profiles: create (`POST /api/admin/doctors`), update (`PATCH /api/admin/doctors/[id]`), list (server-rendered on `/admin`)
- [x] Working hours input (`src/lib/working-hours.ts`, `src/components/admin/working-hours-input.tsx`) — per-day HH:mm ranges, validated with zod
- [x] Admin marks leave days (`POST /api/admin/doctors/[id]/leave`, `DELETE .../leave/[leaveId]`)
- [x] Leave conflict handling (`src/lib/leave.ts`): marking leave on a date with existing bookings cancels those appointments and queues EMAIL + CALENDAR notifications per affected patient — runs synchronously in the same request
- [x] Notification queue (`src/lib/notifications.ts`) writes `NotificationLog` rows as PENDING; actual sending lands in Phase 6 (email) / Phase 7 (calendar) / Phase 8 (cron processes the queue)
- [x] Smoke-tested: created a doctor, marked a leave day, confirmed via `GET /api/admin/doctors` — all against live Neon DB (test fixtures cleaned up after)

## Phase 4 — Patient Booking Flow — not started
## Phase 5 — LLM Integration — not started
## Phase 6 — Email — not started
## Phase 7 — Google Calendar — not started
## Phase 8 — Background Jobs — not started
## Phase 9 — Leave Conflict Handling — not started (partially covered by Phase 3's leave.ts; revisit for anything left over)
## Phase 10 — Polish & Deploy Stability — not started
## Phase 11 — Deliverables — not started

## Still needed from you
- Vercel account connected (deploy step)
- Anthropic API key (Phase 5)
- Resend API key + verified sender (Phase 6)
- Google Cloud OAuth client ID/secret (Phase 7)
