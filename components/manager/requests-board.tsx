"use client";

import { useMemo, useState } from "react";
import { RequestDetailPanel } from "@/components/manager/request-detail-panel";
import { RequestList } from "@/components/manager/request-list";
import { applyManagerDecision } from "@/lib/request-store";
import type {
  ReviewerDecisionState,
  RequestWorkflowStatus,
  StoredExpenseRequest,
} from "@/types/pre-approval";

type RequestsBoardProps = {
  requests: StoredExpenseRequest[];
  onUpdateRequest: (request: StoredExpenseRequest) => void;
};

const statusSections: Array<{ status: RequestWorkflowStatus; title: string }> = [
  { status: "new", title: "New Requests" },
  { status: "review", title: "Review" },
  { status: "investigate", title: "Investigate" },
  { status: "approved", title: "Approved" },
  { status: "denied", title: "Denied" },
];

export function RequestsBoard({ requests, onUpdateRequest }: RequestsBoardProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>(undefined);
  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? requests[0],
    [requests, selectedRequestId],
  );
  const [pendingDecision, setPendingDecision] = useState<ReviewerDecisionState | null>(null);
  const [managerNote, setManagerNote] = useState<string | null>(null);

  const effectivePendingDecision =
    pendingDecision ??
    selectedRequest?.managerDecision?.decision ??
    selectedRequest?.systemRecommendation ??
    "review";
  const effectiveManagerNote =
    managerNote ?? selectedRequest?.managerDecision?.reviewerNote ?? "";

  function handleSaveDecision() {
    if (!selectedRequest) {
      return;
    }

    onUpdateRequest(
      applyManagerDecision(
        selectedRequest,
        effectivePendingDecision,
        effectiveManagerNote.trim() || undefined,
      ),
    );
  }

  function handleResetDecision() {
    if (!selectedRequest) {
      return;
    }

    setPendingDecision(selectedRequest.managerDecision?.decision ?? selectedRequest.systemRecommendation);
    setManagerNote(selectedRequest.managerDecision?.reviewerNote ?? "");
  }

  function handleSelectRequest(requestId: string) {
    const nextRequest = requests.find((request) => request.id === requestId);
    setSelectedRequestId(requestId);
    setPendingDecision(
      nextRequest?.managerDecision?.decision ?? nextRequest?.systemRecommendation ?? "review",
    );
    setManagerNote(nextRequest?.managerDecision?.reviewerNote ?? "");
  }

  return (
    <div className="manager-board-layout">
      <div className="manager-status-grid">
        {statusSections.map((section) => (
          <RequestList
            key={section.status}
            title={section.title}
            status={section.status}
            requests={requests.filter((request) => request.status === section.status)}
            selectedRequestId={selectedRequest?.id}
            onSelect={handleSelectRequest}
          />
        ))}
      </div>

      <RequestDetailPanel
        request={selectedRequest}
        pendingDecision={effectivePendingDecision}
        managerNote={effectiveManagerNote}
        onDecisionChange={setPendingDecision}
        onManagerNoteChange={setManagerNote}
        onSaveDecision={handleSaveDecision}
        onResetDecision={handleResetDecision}
      />
    </div>
  );
}
