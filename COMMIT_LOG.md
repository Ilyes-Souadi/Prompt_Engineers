# Brim Expense Intelligence

- Project name: Brim Expense Intelligence
- Current status: The app now simulates employee and manager roles with a lightweight persistent request workflow, so submitted requests move through manager-visible status buckets without any auth or backend
- Current active slice: Workflow simulation - employee submission and manager request queue
- Next planned step: Start slice 5 by adding grouped expense report generation with risky items clearly marked

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

## 2026-04-03 18:58 - Add deterministic policy compliance engine
- Slice: 2
- Change: Added policy constants sourced from the Brim expense policy PDF, a deterministic compliance evaluator, compliance summary data in the dashboard payload, and a review UI with severity counts, filters, and expandable rule explanations.
- Reason: Deliver a demoable compliance review workflow without any AI, chat, or RAG while keeping every flag grounded in explicit code and the policy document.
- Notes: Implemented rule types for over-$50 pre-authorization, possible split transactions, exact duplicates, near duplicates, fee or cash-advance style charges, and generic needs-review cases. On the current workbook sample the engine returns 4,420 total flags across 3,373 unique transactions.

## 2026-04-03 19:22 - Refine slice 2 to separate risk from workflow noise
- Slice: 2
- Change: Added a `risk` / `workflow` / `info` classification layer to compliance flags, changed pre-authorization items to workflow-weighted severity, and updated the review UI to default to risk-first filtering with grouped summary counters and lighter treatment for non-risk items.
- Reason: Reduce overflagging in the presentation layer so true risk stands out while still tracking process requirements and ambiguous items.
- Notes: The current workbook sample now breaks down as 1,486 risk alerts, 2,736 workflow items, and 198 info items, with 448 high-severity flags after reweighting workflow alerts.

## 2026-04-03 19:31 - Stabilize classification rendering bug
- Slice: 2 bugfix
- Change: Hardened the compliance review component and evaluator with fallback classification counts, default empty arrays, and a default `info` classification when missing so the UI no longer crashes on undefined class data.
- Reason: Fix the runtime error caused by the frontend reading `.risk` before `classificationCounts` was guaranteed to exist.
- Notes: `npm run lint` and `npm run build` both pass after the fix, and the API still returns populated classification counts for the current sample workbook.

## 2026-04-03 19:42 - Fix compliance hydration mismatch
- Slice: 2 bugfix
- Change: Removed client-side fallback zero rendering for compliance summary counts and changed the review component to render only when real server props are present, while keeping server-side summary initialization intact.
- Reason: Fix the hydration warning caused by the server rendering real totals like 4,420 while the client initially rendered fallback zeros.
- Notes: The client now matches the server on first render for compliance totals and classification counts.

## 2026-04-03 19:50 - Normalize compliance data contract to fix .risk crash
- Slice: 2 bugfix
- Change: Added a shared compliance defaults/normalization module, normalized `ComplianceSummary` and flagged items before rendering, and kept `ComplianceReview` reading from a single stable summary shape.
- Reason: Fix the remaining runtime error caused by direct `.risk` access when `classificationCounts` was missing or shaped differently than the component expected.
- Notes: Verified the live API now returns `classificationCounts` and per-flag `classification`, and the app loads with the compliance section visible without the `.risk` crash.

## 2026-04-03 21:02 - Add grounded Claude finance copilot chat
- Slice: 2
- Change: Replaced the disabled assistant placeholder with a real chat panel, added a server-side assistant route that rebuilds the local dashboard and compliance data on each question, and added deterministic grounding context that summarizes workbook facts, policy rules, large transactions, common flag types, and keyword-matched transactions or flags before calling Claude.
- Reason: Deliver the planned chat slice without moving policy logic into AI, so answers stay tied to the loaded workbook and the existing deterministic compliance engine.
- Notes: The assistant uses the Anthropic Messages API with `ANTHROPIC_API_KEY` and optional `ANTHROPIC_MODEL`, defaulting to `claude-sonnet-4-6`. Per `PROJECT_RULES.md`, this chat work is treated as slice 2 even though earlier local compliance entries were logged as slice 2 before the rules file became the source of truth.

## 2026-04-03 22:18 - Add deterministic pre-approval request flow
- Slice: 4
- Change: Added a new `/pre-approval` page with compact request form inputs, a deterministic pre-approval evaluation route, structured policy/workflow/risk checks, advisory recommendation states, grouped review packet UI, and explicit reviewer context that combines workbook-derived similar-spend signals with small mock directory and budget enrichment.
- Reason: Deliver the new spend action layer as a fully demoable form-based slice without relying on any live AI calls or changing the existing dashboard/compliance architecture.
- Notes: Employee, department, approver, and budget context are honest demo enrichment because the workbook has no HR or budget master data. Historical similar-spend notes still use the real workbook through simple deterministic matching.

## 2026-04-03 22:46 - Add reviewer decision workflow to pre-approval
- Slice: 4 follow-up
- Change: Added a human decision panel after the pre-approval evaluation, allowing the reviewer to record a final approve / deny / review / investigate action with an optional note, timestamp, and clear distinction from the advisory system recommendation.
- Reason: Complete the reviewer action step for the pre-approval slice without introducing persistence, backend workflow infrastructure, or any AI dependency.
- Notes: Final reviewer decisions are stored only in lightweight client state for the current session, and can be changed for demo convenience.

## 2026-04-03 23:18 - Add employee/manager workflow simulation with local request store
- Slice: Workflow simulation
- Change: Added a persistent employee/manager role toggle, moved submitted pre-approval requests into a lightweight localStorage-backed request store, and added a manager-facing requests board with status sections for new, review, investigate, approved, and denied requests. Managers can reopen stored requests, inspect the preserved evaluation packet, and update decisions without affecting historical workbook data.
- Reason: Make the requester/approver workflow legible for demo purposes without introducing real authentication, backend persistence, or merging new requests into historical transactions.
- Notes: Role selection and submitted requests are both persisted locally in the browser only. Employee mode hides manager-facing surfaces, while manager mode exposes dashboard and requests views separately.
