type MetricCardProps = {
  label: string;
  value: string;
  helperText: string;
};

export function MetricCard({ label, value, helperText }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <h2 className="metric-value">{value}</h2>
      <p className="metric-helper">{helperText}</p>
    </article>
  );
}
