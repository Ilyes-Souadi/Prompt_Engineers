"use client";

import { useState } from "react";
import { ExpenseRequestForm } from "@/components/pre-approval/expense-request-form";
import { PreApprovalReviewPacket } from "@/components/pre-approval/pre-approval-review-packet";
import { DEFAULT_PRE_APPROVAL_FORM } from "@/lib/pre-approval/mock-enrichment";
import type { ExpenseRequestInput, PreApprovalEvaluation } from "@/types/pre-approval";

export function PreApprovalWorkbench() {
  const [formValue, setFormValue] = useState<ExpenseRequestInput>(DEFAULT_PRE_APPROVAL_FORM);
  const [evaluation, setEvaluation] = useState<PreApprovalEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

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

      setEvaluation(payload);
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

  return (
    <div className="pre-approval-layout">
      <ExpenseRequestForm
        value={formValue}
        isSubmitting={isSubmitting}
        onChange={setFormValue}
        onSubmit={() => {
          void handleSubmit();
        }}
      />

      {error ? <p className="pre-approval-error">{error}</p> : null}

      <PreApprovalReviewPacket evaluation={evaluation} />
    </div>
  );
}
