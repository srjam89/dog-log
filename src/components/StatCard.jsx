import { BarChart3 } from "lucide-react";

export function StatCard({ icon: Icon = BarChart3, label, value }) {
  return (
    <article className="stat-card">
      <Icon size={22} aria-hidden="true" />
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
