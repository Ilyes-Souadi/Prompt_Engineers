# Brim Expense Intelligence

- Project name: Brim Expense Intelligence
- Current status: Slice 1 is implemented and demoable using the real provided workbook sample, deterministic insights, and a disabled assistant panel placeholder
- Current active slice: Slice 1 - Load transaction data and show a summary dashboard
- Next planned step: Start slice 2 by wiring Claude-powered chat over the loaded transaction data without adding policy logic yet

## 2026-04-02 21:22 - Establish product rules
- Slice: Foundation / Applies to all slices
- Change: Created `PROJECT_RULES.md` with the full product brief, product assumptions, tech constraints, vertical slice roadmap, and mandatory engineering rules.
- Reason: Lock the project scope and implementation principles before any code is written.
- Notes: `PROJECT_RULES.md` is the source of truth for future implementation decisions.

## 2026-04-02 21:25 - Add persistent progress log
- Slice: Foundation / Applies to all slices
- Change: Created `COMMIT_LOG.md` with a status header and structured markdown history format, and updated `PROJECT_RULES.md` so log updates are part of definition of done.
- Reason: Preserve project history for future chats and make progress tracking part of normal project workflow.
- Notes: Future meaningful changes should append new entries in chronological order without rewriting previous history.

## 2026-04-03 15:04 - Link local project to GitHub repo
- Slice: Foundation / Applies to all slices
- Change: Initialized a local Git repository on `main` and added `origin` pointing to `https://github.com/Ilyes-Souadi/Prompt_Engineers.git`.
- Reason: Connect the project workspace to the intended remote repository before implementation work begins.
- Notes: The remote appeared empty at link time, so no pull or merge step was needed.

## 2026-04-03 15:06 - Add initial gitignore before first push
- Slice: Foundation / Applies to all slices
- Change: Added a minimal `.gitignore` to exclude `node_modules`, Next.js build output, local env files, and npm debug logs from version control.
- Reason: Keep the repository clean and avoid committing generated or machine-specific files in the first commit.
- Notes: `package-lock.json` remains tracked because npm lockfiles are useful and should stay in the repo.

## 2026-04-03 15:16 - Implement slice 1 dashboard and transaction pipeline
- Slice: 1
- Change: Added a minimal Next.js app, a local demo transaction CSV, parsing and normalization utilities, deterministic insight generation, a summary dashboard, geography and merchant breakdown tables, a normalized ledger view, and a visible but disabled AI assistant panel. Also added build and lint configuration for the app.
- Reason: Deliver the first end-to-end demoable slice focused only on transaction intake and overview, while preserving a reusable transaction shape for future slices.
- Notes: The repo does not yet contain the real provided spreadsheet, so slice 1 uses an explicit local demo dataset. Slice 2 should replace the assistant placeholder with grounded Claude chat over the loaded data.

## 2026-04-03 15:25 - Replace invented demo data with real workbook sample
- Slice: 1
- Change: Copied the provided `.xlsx` sample into the repo, replaced the CSV-based loader with a workbook parser, updated normalization to use the real column names and Excel date format, removed the invented demo CSV, and refreshed the dashboard copy to reference the real sample. The ledger table now shows a recent subset while summaries still use the full dataset.
- Reason: Align slice 1 with the actual transaction sample instead of invented data so future slices build on the correct source format and field structure.
- Notes: The real sample currently yields 4,235 transactions and 4 deterministic insights. Added the `xlsx` dependency to keep the spreadsheet handling simple. One `npm audit` high-severity vulnerability was reported after installing `xlsx` and has not been addressed yet.
