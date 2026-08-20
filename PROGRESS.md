# Build Progress

Tracks the phase checklist from the build plan. Check items off as they land; keep this file up to date so work can resume across sessions without re-deriving state.

## Phase 1 — Foundation ✅
- [x] `create-next-app` (TypeScript, App Router, Tailwind)
- [x] Prisma installed, full schema written (`prisma/schema.prisma`), client generates cleanly
- [x] `.env.example` with every var needed
- [ ] Push to GitHub, deploy to Vercel — **blocked on account access, see below**
- [ ] Neon Postgres provisioned, first migration run against it

## Phase 2 — Auth & Roles ✅ (code complete, untested against a real DB)
- [x] NextAuth v5 credentials provider, bcrypt password hashing
- [x] Role on JWT/session (`src/auth.ts`, `src/types/next-auth.d.ts`)
- [x] `src/proxy.ts` (Next.js 16 middleware convention) protects `/admin`, `/doctor`, `/patient` by role
- [x] Patient self-registration (`/register`, `POST /api/auth/register`)
- [x] Admin bootstrap via `prisma/seed.ts` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- [x] Placeholder dashboard shells for all three roles
- [ ] **Not yet tested end-to-end** — needs a real `DATABASE_URL` to run `prisma migrate dev` and actually log in

## Phase 3 — Admin: Doctor Management — not started
## Phase 4 — Patient Booking Flow — not started
## Phase 5 — LLM Integration — not started
## Phase 6 — Email — not started
## Phase 7 — Google Calendar — not started
## Phase 8 — Background Jobs — not started
## Phase 9 — Leave Conflict Handling — not started
## Phase 10 — Polish & Deploy Stability — not started
## Phase 11 — Deliverables — not started

## Blocked on account access

The sandbox this was built in has no `gh` CLI and no authenticated `vercel`/Neon session — these need your own accounts. Nothing else is blocked on this; code-only phases can keep going in parallel. See the chat for the specific asks (GitHub repo, Neon connection string, Anthropic/Resend/Google API keys).
