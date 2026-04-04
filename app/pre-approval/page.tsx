import { AppNav } from "@/components/app-nav";
import { PreApprovalWorkbench } from "@/components/pre-approval/pre-approval-workbench";
import { getDashboardData } from "@/lib/transactions/get-dashboard-data";

export default async function PreApprovalPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="page-shell">
      <AppNav currentPath="/pre-approval" />

      <section className="page-header">
        <div>
          <p className="eyebrow">Brim Expense Intelligence</p>
          <h1>New expense pre-approval</h1>
          <p className="subtle-copy">
            This slice evaluates a proposed expense request with deterministic policy and workflow
            checks only. The recommendation is advisory and the reviewer keeps final authority.
          </p>
        </div>
        <div className="dataset-chip">
          <span className="dataset-label">Historical reference</span>
          <strong>{dashboard.source.datasetName}</strong>
          <span>{dashboard.summary.transactionCount} workbook transactions available for context</span>
        </div>
      </section>

      <div className="layout-grid pre-approval-page-grid">
        <section className="dashboard-column">
          <PreApprovalWorkbench />
        </section>

        <aside className="panel pre-approval-sidebar">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Reviewer guide</p>
              <h2>How to use this slice</h2>
            </div>
          </div>

          <ul className="quality-list">
            <li>Use the form for a new request, not another transaction import.</li>
            <li>Workflow findings highlight process needs like pre-authorization or receipts.</li>
            <li>Risk findings surface stronger policy conflicts or legitimacy concerns.</li>
            <li>Qualitative policy language routes to review or investigate, not false certainty.</li>
            <li>Budget and employee routing context use explicit demo enrichment where the workbook has no master data.</li>
          </ul>

          <div className="assistant-state">
            <span className="assistant-lock">Human-owned decision</span>
            <p className="assistant-message">
              Approve, deny, review, and investigate are recommendation states only. This page
              supports a reviewer and does not auto-decide spend.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
