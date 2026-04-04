"use client";

import { useState } from "react";
import type { AssistantReply } from "@/types/assistant";

type AssistantPanelProps = {
  datasetName: string;
  transactionCount: number;
  riskAlertCount: number;
  workflowItemCount: number;
};

type PanelMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterQuestions = [
  "What are the biggest risk alerts in this workbook?",
  "Which merchants drive the most spend right now?",
  "Why are so many items marked as workflow?",
];

export function AssistantPanel({
  datasetName,
  transactionCount,
  riskAlertCount,
  workflowItemCount,
}: AssistantPanelProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSubmitting) {
      return;
    }

    const nextUserMessage = createPanelMessage("user", trimmedQuestion);
    const nextConversation = [...messages, nextUserMessage];

    setDraft("");
    setError(null);
    setIsSubmitting(true);
    setMessages(nextConversation);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages: nextConversation.map(({ role, content }) => ({ role, content })),
        }),
      });

      const payload = (await response.json()) as AssistantReply & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "The assistant could not answer that question.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createPanelMessage("assistant", payload.reply),
      ]);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The assistant could not answer that question.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <aside className="assistant-panel">
      <div className="assistant-header">
        <div>
          <p className="eyebrow">AI Assistant</p>
          <h2>Finance copilot</h2>
        </div>
      </div>

      <div className="assistant-state assistant-ready-state">
        <span className="assistant-lock">Claude grounded chat</span>
        <strong className="assistant-status">
          {formatCount(transactionCount)} transactions are ready for questions.
        </strong>
        <p className="assistant-message">
          Answers stay grounded in the loaded workbook, the deterministic compliance
          engine, and the explicit Brim policy rules already in code.
        </p>
      </div>

      <div className="assistant-stats">
        <div className="assistant-stat">
          <span className="assistant-stat-label">Dataset</span>
          <strong>{datasetName}</strong>
        </div>
        <div className="assistant-stat">
          <span className="assistant-stat-label">Risk alerts</span>
          <strong>{formatCount(riskAlertCount)}</strong>
        </div>
        <div className="assistant-stat">
          <span className="assistant-stat-label">Workflow items</span>
          <strong>{formatCount(workflowItemCount)}</strong>
        </div>
      </div>

      <div className="assistant-question-list">
        {starterQuestions.map((question) => (
          <button
            key={question}
            type="button"
            className="assistant-question-chip"
            disabled={isSubmitting}
            onClick={() => handleSubmit(question)}
          >
            {question}
          </button>
        ))}
      </div>

      <div className="assistant-thread" aria-live="polite">
        {messages.length === 0 ? (
          <p className="assistant-empty">
            Ask about top merchants, risky transactions, workflow-heavy alerts, or why a
            pattern was flagged.
          </p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`assistant-bubble assistant-bubble-${message.role}`}
            >
              <p className="assistant-bubble-label">
                {message.role === "user" ? "You" : "Claude"}
              </p>
              <p className="assistant-bubble-copy">{message.content}</p>
            </article>
          ))
        )}
      </div>

      <form
        className="assistant-form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(draft);
        }}
      >
        <label className="assistant-input">
          <span>Ask a grounded question</span>
          <textarea
            rows={4}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Summarize the biggest policy-risk patterns in this workbook."
          />
        </label>

        <div className="assistant-form-footer">
          <p className="assistant-note">
            Claude answers only from repo-backed source documents and deterministic outputs derived
            from them. If `ANTHROPIC_API_KEY` or the Brim policy source document is missing, the
            route returns a setup error instead of a fake answer.
          </p>
          <button
            type="submit"
            className="assistant-submit"
            disabled={isSubmitting || draft.trim().length === 0}
          >
            {isSubmitting ? "Thinking..." : "Ask Claude"}
          </button>
        </div>
      </form>

      {error ? <p className="assistant-error">{error}</p> : null}
    </aside>
  );
}

function createPanelMessage(role: PanelMessage["role"], content: string): PanelMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-CA").format(value);
}
