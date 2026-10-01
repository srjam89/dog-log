import { Dog } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = Dog,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <section className="empty-state">
      <Icon size={42} aria-hidden="true" />
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </section>
  );
}
