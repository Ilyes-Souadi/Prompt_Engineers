import { AssistantPanel } from "@/components/assistant-panel";
import { InsightList } from "@/components/insight-list";
import { MetricCard } from "@/components/metric-card";
import { RegionBreakdown } from "@/components/region-breakdown";
import { TopMerchantsTable } from "@/components/top-merchants-table";
import { TransactionTable } from "@/components/transaction-table";
import { getDashboardData } from "@/lib/transactions/get-dashboard-data";
import { formatCurrency, formatDisplayDateRange } from "@/lib/transactions/format";

export default async function HomePage() {
  const dashboard = await getDashboardData();

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Brim Expense Intelligence</p>
          <h1>Historical expense overview</h1>
          <p className="subtle-copy">
            The provided transaction sample is loaded from the real spreadsheet format.
            All flagged insights in this slice come from deterministic rules, not AI.
          </p>
        </div>
        <div className="dataset-chip">
          <span className="dataset-label">Data source</span>
          <strong>{dashboard.source.datasetName}</strong>
          <span>{dashboard.summary.transactionCount} transactions loaded</span>
        </div>
      </section>

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

          <TransactionTable transactions={dashboard.transactions.slice(0, 100)} />
        </section>

        <AssistantPanel />
      </div>
    </main>
  );
}
