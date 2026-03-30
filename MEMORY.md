# MEMORY.md - Long-Term Memory

## Finance Tracker Project
- **Status:** v5 (Savings Goals) is live in Production. v6 (CSV Uploads) is in PR #18. v7 (Vertex AI Auto-Categorization) in progress.
- **Features:** 
  - Expense breakdown (Doughnut chart)
  - Spending magnitude (Bar chart)
  - Savings goals tracking and API.
  - **New:** CSV Statement Bulk Import (v1 Foundation).
  - **New:** AI-Powered Auto-Categorization (Vertex AI Gemini) - one-click category suggestions and batch processing for CSV imports.
- **CI/CD:** Full pipeline established (`feat` -> `development` -> `main` -> Vercel).
- **Automation:** Uses persistent Cron Jobs for PR monitoring and CodeRabbit for AI reviews.

## Infrastructure & Configuration
- **Database:** Supabase PostgreSQL. Using Connection Pooler to resolve Vercel IPv6 outbound connection issues.
- **Telegram Integration:** User ID redacted. Cron jobs configured with `delivery.channel="telegram"` for real-time notifications.
- **Voice/Feedback:** System beep triggers before every final response.

## Core Principles & User Preferences
- **Persona:** Chill, casual, straight to the point (BroBot).
- **Tech Stack:** Next.js (TypeScript), Prisma, Supabase, Vercel, CodeRabbit, Papaparse, Google Cloud Vertex AI (Gemini).
- **Verification:** Always verify DB status and logs before reporting success.
