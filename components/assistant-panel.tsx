export function AssistantPanel() {
  return (
    <aside className="assistant-panel">
      <div className="assistant-header">
        <div>
          <p className="eyebrow">AI Assistant</p>
          <h2>Finance copilot</h2>
        </div>
      </div>

      <div className="assistant-state" aria-disabled="true">
        <span className="assistant-lock">Disabled for slice 1</span>
        <strong className="assistant-status">Load transaction data to activate AI analysis</strong>
        <p className="assistant-message">
          The assistant panel is visible on purpose, but Claude-powered analysis stays
          off until slice 2.
        </p>
      </div>

      <ul className="assistant-list">
        <li>Natural-language questions over loaded transactions</li>
        <li>Grounded explanations of flagged spend patterns</li>
        <li>Summary answers tied to the dashboard data</li>
      </ul>

      <p className="assistant-note">
        This placeholder keeps the final product shape visible without introducing fake AI behavior.
      </p>

      <div className="assistant-cta">Slice 2 unlocks chat and explanations</div>
    </aside>
  );
}
