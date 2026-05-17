# Life OS

A personal productivity web app — PWA (works on mobile + desktop)

## Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** Supabase
- **Styling:** Tailwind CSS

## Phase 1 — Local State ✅ COMPLETE

1. ✅ Daily Check-in (mood, energy, wins of the day)
2. ✅ Habit Tracker (daily habits with streak tracking)
3. ✅ Fitness Log (workout sessions, body weight)
4. ✅ Weekly Review (auto-summary of the week)

All modules use localStorage. Bottom nav wires all four together.

## Phase 2 — Integrations

1. ✅ Supabase — real persistence, all 4 tables live
2. Cloudinary — photo uploads (fitness progress photos)
3. ✅ Claude API — AI-generated weekly review via POST /api/review/generate
4. Twilio — WhatsApp delivery of weekly review

## Rules

- Mobile-first design
- Keep components under 150 lines
- One feature at a time, don't build everything at once
- Always ask before installing new dependencies
