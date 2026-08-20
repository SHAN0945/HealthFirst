# Build Progress

Tracks the phase checklist from the build plan. Check items off as they land; keep this file up to date so work can resume across sessions without re-deriving state.

Repo: https://github.com/SHAN0945/HealthFirst
DB: Neon Postgres (project connected, migration `20260820140629_init` applied)
Live: https://healthcare-appointment-manager-three.vercel.app — verified working (login/session/role-gating tested against production)

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

## Phase 4 — Patient Booking Flow ✅ verified end-to-end
- [x] Fixed a real correctness bug before building on it: `@@unique([doctorId, slotStart])` would have permanently locked a slot after cancellation. Replaced with a hand-written **partial unique index** — `CREATE UNIQUE INDEX ... WHERE status IN ('PENDING','CONFIRMED')` (migration `20260820150751_partial_unique_active_slot`) — since Prisma's schema DSL can't express a filtered unique constraint. `src/lib/db-errors.ts` catches the violation via Prisma's P2002 *or* raw Postgres 23505, since Prisma doesn't statically know about a constraint not declared in schema.prisma.
- [x] Slot generation (`src/lib/slots.ts`): working hours → candidate slots, minus leave days, minus active (PENDING-with-live-hold or CONFIRMED) appointments, minus anything already past
- [x] Slot hold mechanism: `POST /api/patient/appointments` creates a PENDING row with a 5-minute `holdExpiresAt` (`src/lib/constants.ts`); the unique-violation catch — not a pre-check query — is the actual double-booking guard under concurrent requests
- [x] Symptom form confirms the hold → CONFIRMED (`POST /api/patient/appointments/[id]/confirm`), cancel endpoint releases it back
- [x] Patient booking UI (`/patient/book`) and appointment list (`/patient`) with cancel
- [x] **Load-tested the actual race**: concurrent double-booking attempt on the same slot correctly returns 409 from the second request
- [x] Expired-hold sweep is a Phase 8 cron job (not yet built — see below)

## Phase 5 — LLM Integration ✅ verified end-to-end (including the failure path)
- [x] `src/lib/llm.ts`: Anthropic SDK, `claude-opus-5`, structured output via `messages.parse()` + `zodOutputFormat` (no manual JSON parsing/regex)
- [x] Pre-visit summary uses the spec's exact prompt wording; post-visit summary prompt additionally asks for a normalized `intervalHours` per medication, so the same LLM call doubles as the data source for Phase 8's medication reminders (no second parsing pass over prescription text)
- [x] Every call wrapped: on failure, `aiSummaryFailed: true` + `aiSummaryError` stored, booking/visit flow proceeds unaffected — **this was actually exercised in testing** (no `ANTHROPIC_API_KEY` set yet) rather than just written defensively: confirmed a booking and completed a visit with the LLM absent, both succeeded with the failure flags set correctly and zero medication reminders created (documented as the correct fallback — no structured schedule, no reminders, raw prescription text still saved)
- [x] Doctor UI shows urgency/chief-complaint/questions (or "AI summary unavailable"); patient UI shows the post-visit summary (or the same fallback)

## Phase 6 — Email — not started
## Phase 7 — Google Calendar — not started
## Phase 8 — Background Jobs — not started
## Phase 9 — Leave Conflict Handling — not started (partially covered by Phase 3's leave.ts; revisit for anything left over)
## Phase 10 — Polish & Deploy Stability — not started
## Phase 11 — Deliverables — not started

## Still needed from you
- Anthropic API key (Phase 5)
- Resend API key + verified sender (Phase 6)
- Google Cloud OAuth client ID/secret (Phase 7)
- Optional: connect the GitHub repo in the Vercel dashboard (Project → Settings → Git) for auto-deploy on push — the CLI's `vercel git connect` can't do this itself, it needs the Vercel GitHub App authorized on the repo. Not blocking; I redeploy manually with `vercel deploy --prod` in the meantime.
