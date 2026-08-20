# Healthcare Appointment & Follow-up Manager

A clinic appointment platform with separate patient, doctor, and admin portals: symptom intake with AI pre-visit summaries, post-visit AI patient summaries, medication reminders, email notifications, and Google Calendar sync.

> **Status:** under active development. This README is filled in incrementally as each phase lands; see `PROGRESS.md` for the current build status. The final submission README (setup guide, API docs, DB schema, LLM prompts, Google Calendar setup) lands in the last phase.

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Database:** PostgreSQL (Neon), via Prisma ORM
- **Auth:** NextAuth.js (Auth.js) v5, credentials provider, role-based (patient / doctor / admin)
- **LLM:** Anthropic Claude API — pre-visit and post-visit summaries
- **Email:** Resend
- **Calendar:** Google Calendar API (OAuth 2.0)
- **Background jobs:** Vercel Cron
- **UI:** Tailwind CSS + shadcn/ui
- **Deploy:** Vercel

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum to run migrations
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000.

## Environment variables

See [.env.example](.env.example) for the full list (DB, NextAuth, Anthropic, Resend, Google OAuth, cron secret).

## Database schema

Defined in [prisma/schema.prisma](prisma/schema.prisma). Core entities: `User`, `DoctorProfile`, `PatientProfile`, `Leave`, `Appointment`, `SymptomForm`, `VisitNotes`, `MedicationReminder`, `NotificationLog`, `GoogleCalendarToken`.

Double-booking is prevented at the database level via a unique constraint on `(doctorId, slotStart)` on `Appointment` — see the system design write-up (added in the final phase) for details.
