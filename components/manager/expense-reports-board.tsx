"use client";

import { useMemo, useState } from "react";
import { ExpenseReportDetail } from "@/components/manager/expense-report-detail";
import { ExpenseReportList } from "@/components/manager/expense-report-list";
import type { ExpenseReport, ExpenseReportStatus } from "@/types/expense-report";

type ExpenseReportsBoardProps = {
  reports: ExpenseReport[];
};

const statusSections: Array<{ status: ExpenseReportStatus; title: string }> = [
  { status: "ready", title: "Ready" },
  { status: "review", title: "Review" },
  { status: "investigate", title: "Investigate" },
];

export function ExpenseReportsBoard({ reports }: ExpenseReportsBoardProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? reports[0],
    [reports, selectedReportId],
  );

  return (
    <div className="manager-board-layout">
      <div className="manager-status-grid manager-report-grid">
        {statusSections.map((section) => (
          <ExpenseReportList
            key={section.status}
            title={section.title}
            status={section.status}
            reports={reports.filter((report) => report.status === section.status)}
            selectedReportId={selectedReport?.id}
            onSelect={setSelectedReportId}
          />
        ))}
      </div>

      <ExpenseReportDetail report={selectedReport} />
    </div>
  );
}
