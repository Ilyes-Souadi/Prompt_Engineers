"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/app-nav";
import { AssistantPanel } from "@/components/assistant-panel";
import { ComplianceReview } from "@/components/compliance-review";
import { InsightList } from "@/components/insight-list";
import { RequestsBoard } from "@/components/manager/requests-board";
import { MetricCard } from "@/components/metric-card";
import { ExpenseRequestForm } from "@/components/pre-approval/expense-request-form";
import { PreApprovalReviewPacket } from "@/components/pre-approval/pre-approval-review-packet";
import { RegionBreakdown } from "@/components/region-breakdown";
import { RoleToggle } from "@/components/role-toggle";
import { TopMerchantsTable } from "@/components/top-merchants-table";
import { TransactionTable } from "@/components/transaction-table";
import {
  createStoredExpenseRequest,
  loadStoredRequests,
  loadStoredRole,
  saveStoredRequests,
  saveStoredRole,
  upsertStoredExpenseRequest,
  type AppRole,
} from "@/lib/request-store";
import { DEFAULT_PRE_APPROVAL_FORM } from "@/lib/pre-approval/mock-enrichment";
import { formatCurrency, formatDisplayDateRange } from "@/lib/transactions/format";
import type { DashboardData } from "@/types/transactions";
import type {
  ExpenseRequestInput,
  PreApprovalEvaluation,
  StoredExpenseRequest,
} from "@/types/pre-approval";

type AppWorkspaceProps = {
  dashboard: DashboardData;
  initialManagerView: "dashboard" | "requests";
};

export function AppWorkspace({
  dashboard,
  initialManagerView,
}: AppWorkspaceProps) {
  const [role, setRole] = useState<AppRole>("manager");
  const [requests, setRequests] = useState<StoredExpenseRequest[]>([]);
  const [formValue, setFormValue] = useState<ExpenseRequestInput>(DEFAULT_PRE_APPROVAL_FORM);
  const [evaluation, setEvaluation] = useState<PreApprovalEvaluation | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managerView, setManagerView] = useState<"dashboard" | "requests">(initialManagerView);

  useEffect(() => {
    setRole(loadStoredRole());
    setRequests(loadStoredRequests());
  }, []);

  useEffect(() => {
    saveStoredRole(role);
  }, [role]);

  useEffect(() => {
    saveStoredRequests(requests);
  }, [requests]);

  useEffect(() => {
    setManagerView(initialManagerView);
  }, [initialManagerView]);

  const requestCount = requests.length;
  const managerHeadline =
    managerView === "dashboard" ? "Historical expense overview" : "Submitted expense requests";
  const managerCopy =
    managerView === "dashboard"
      ? "The provided transaction sample is loaded from the real spreadsheet format. All flagged insights in this slice come from deterministic rules, not AI."
      : "Submitted pre-approval requests stay separate from historical workbook transactions. Managers can inspect the system recommendation, then record the final status.";

  async function handleEmployeeSubmit() {
    setIsSubmitting(true);
    setError(null);
    setSubmissionMessage(null);

    try {
      const response = await fetch("/api/pre-approval", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formValue),
      });

      const payload = (await response.json()) as PreApprovalEvaluation & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "The request could not be evaluated.");
      }

      const storedRequest = createStoredExpenseRequest(payload);
      setRequests((current) => upsertStoredExpenseRequest(current, storedRequest));
      setEvaluation(payload);
      setSubmissionMessage(
        "Request submitted to the manager queue. Switch to Manager mode to review it in New Requests.",
      );
      setManagerView("requests");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The request could not be evaluated.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUpdateStoredRequest(nextRequest: StoredExpenseRequest) {
    setRequests((current) => upsertStoredExpenseRequest(current, nextRequest));
  }

  return (
    <main className="page-shell">
      <div className="app-topbar">
        <AppNav currentPath={managerView === "dashboard" ? "/" : "/pre-approval"} />
        <RoleToggle
          role={role}
          onChange={(nextRole) => {
            setRole(nextRole);
            if (nextRole === "employee") {
              setManagerView("requests");
            }
          }}
        />
      </div>

      <section className="page-header">
        <div>
          <p className="eyebrow">Brim Expense Intelligence</p>
          <h1>{role === "manager" ? managerHeadline : "New expense request"}</h1>
          <p className="subtle-copy">
            {role === "manager"
              ? managerCopy
              : "Employee mode simulates a requester submitting a new expense request. The system recommendation remains advisory and the final decision belongs to the manager."}
          </p>
        </div>
        <div className="dataset-chip">
          <span className="dataset-label">
            {role === "manager" ? "Manager context" : "Role simulation"}
          </span>
          <strong>{role === "manager" ? dashboard.source.datasetName : "Employee mode"}</strong>
          <span>
            {role === "manager"
              ? managerView === "dashboard"
                ? `${dashboard.summary.transactionCount} transactions loaded`
                : `${requestCount} submitted requests in local workflow store`
              : `${requestCount} submitted requests currently stored for manager review`}
          </span>
        </div>
      </section>

      {role === "manager" ? (
        <>
          <div className="manager-view-toggle">
            <button
              type="button"
              className={`classification-tab ${managerView === "dashboard" ? "is-active" : ""}`}
              onClick={() => setManagerView("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`classification-tab ${managerView === "requests" ? "is-active" : ""}`}
              onClick={() => setManagerView("requests")}
            >
              Requests
              <span className="classification-count">{requestCount}</span>
            </button>
          </div>

          {managerView === "dashboard" ? (
            <div className="layout-grid">
              <section className="dashboard-column">
                <div className="metrics-grid">
                  <MetricCard
                    label="Total transactions"
                    value={dashboard.summary.transactionCount.toString()}
                    helperText="Normalized from the provided sample workbook"
                  />
                  <MetricCard
                    label="Total spend"
                    value={formatCurrency(dashboard.summary.totalSpend)}
                    helperText="Positive spend only"
                  />
                  <MetricCard
                    label="Date range"
                    value={formatDisplayDateRange(
                      dashboard.summary.startDate,
                      dashboard.summary.endDate,
                    )}
                    helperText="Earliest to latest transaction"
                  />
                  <MetricCard
                    label="Countries covered"
                    value={dashboard.summary.countryCount.toString()}
                    helperText="Based on transaction geography"
                  />
                </div>

                <div className="content-grid">
                  <InsightList insights={dashboard.insights} />
                  <TopMerchantsTable merchants={dashboard.summary.topMerchants} />
                </div>

                <div className="content-grid">
                  <RegionBreakdown regions={dashboard.summary.countryBreakdown} />
                  <section className="panel">
                    <div className="panel-header">
                      <div>
                        <p className="section-kicker">Data quality</p>
                        <h2>Normalized transaction model</h2>
                      </div>
                    </div>
                    <ul className="quality-list">
                      <li>Each record includes a reusable normalized transaction shape.</li>
                      <li>Raw spreadsheet fields remain attached for future slices.</li>
                      <li>Transaction type is inferred with simple code-based rules.</li>
                      <li>Category and country stay explicit when available in the source.</li>
                    </ul>
                  </section>
                </div>

                <ComplianceReview
                  flags={dashboard.compliance.flags}
                  summary={dashboard.compliance.summary}
                />

                <TransactionTable transactions={dashboard.transactions.slice(0, 100)} />
              </section>

              <AssistantPanel
                datasetName={dashboard.source.datasetName}
                transactionCount={dashboard.summary.transactionCount}
                riskAlertCount={dashboard.compliance.summary.classificationCounts.risk}
                workflowItemCount={dashboard.compliance.summary.classificationCounts.workflow}
              />
            </div>
          ) : (
            <RequestsBoard requests={requests} onUpdateRequest={handleUpdateStoredRequest} />
          )}
        </>
      ) : (
        <div className="employee-mode-layout">
          <section className="panel employee-mode-guide">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Employee mode</p>
                <h2>Submit a new expense request</h2>
              </div>
              <span className="muted-line">Manager tools hidden</span>
            </div>
            <p className="muted-line">
              Submitted requests are stored locally for demo purposes and appear in the manager
              queue when the role is switched back to Manager mode.
            </p>
          </section>

          <ExpenseRequestForm
            value={formValue}
            isSubmitting={isSubmitting}
            onChange={setFormValue}
            onSubmit={() => {
              void handleEmployeeSubmit();
            }}
          />

          {error ? <p className="pre-approval-error">{error}</p> : null}
          {submissionMessage ? <p className="employee-submission-note">{submissionMessage}</p> : null}

          <PreApprovalReviewPacket evaluation={evaluation} />
        </div>
      )}
    </main>
  );
}
