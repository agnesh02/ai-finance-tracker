# Project: Financial Tracker App

## Tech Stack (Proposed)
- **Frontend/Backend:** Next.js (TypeScript) - single repository for speed.
- **Compute:** GCP Cloud Run (Docker container, scales to zero).
- **Database:** PostgreSQL (Cloud SQL if budget allows, or serverless alternative like Neon/Supabase to keep costs at $0).
- **Auth:** NextAuth (Google/GitHub login) or Firebase Auth.

## MVP Scope (Phase 1)
1. **User Auth:** Secure login.
2. **Dashboard:** High-level summary (Total Income, Total Expenses, Net).
3. **Transaction Management:** Add/Edit/Delete manual transactions (Amount, Date, Category, Note).
4. **Basic Visualization:** A simple chart showing expenses by category.

## Future Phases
- CSV statement uploads.
- Budgeting goals.
- Receipt scanning (GCP Vision API).
- Plaid API integration (bank sync).
