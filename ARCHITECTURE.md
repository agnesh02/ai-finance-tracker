# AI Finance Tracker - Architecture

This document tracks the technical evolution of the Finance Tracker app through our iterative SDLC.

## v1: Foundation (Secure Authentication)
- **Framework:** Next.js (App Router)
- **Database:** Supabase (PostgreSQL) + Prisma ORM
- **Auth:** NextAuth.js with Credentials & Google providers.
- **Security:** Built-in tenant isolation (userId filtering).

## v2: Core Transactions (Ledger Engine)
- **Features:** Unified transaction entry (Income/Expense), category tags, and historical ledger view.
- **Logic:** Server-side aggregation for net balance, total income, and total expenses.

## v3: Budgets & Recurring (Active Monitoring)
- **Features:** 
  - **Monthly Budgets:** Visual progress bars per category with over-budget alerts.
  - **Subscriptions:** Recurring bill manager with billing-day tracking and automatic monthly burn ($/mo) calculation.
- **Logic:** Cross-references `Budget` and `Subscription` tables against `Transaction` ledger in real-time.

## v4: AI-Powered Auto-Categorization (Vertex AI)
- **Features:**
  - One-click "✨ Auto-categorize" button in transaction form using Gemini model.
  - Automatic batch categorization during CSV import for uncategorized transactions.
  - Fallback to keyword-based categorization when Vertex AI is unavailable.
- **Architecture:**
  - New API endpoint: `POST /api/transactions/categorize` (supports single text and batch).
  - New library: `src/lib/vertexai.ts` wraps Vertex AI Gemini with error handling and fallback.
  - Frontend integration in `Dashboard.tsx` with loading states and suggestions.
- **Env:** Requires `VERTEX_AI_PROJECT` and `VERTEX_AI_LOCATION` (optional, default us-central1). Service account JSON via standard Google credentials.

## CI/CD Pipeline
- **Quality:** CodeRabbit AI reviews every PR.
- **Dependencies:** Dependabot manages weekly package updates.
- **Validation:** Automated linting and TypeScript type checking on every push to `development`.
- **Deploy:** 
  - `development` -> Automated Staging on Vercel.
  - `main` -> Automated Production on Vercel.
