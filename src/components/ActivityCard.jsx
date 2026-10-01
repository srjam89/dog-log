import { Dog, Pencil, Star, Trash2 } from "lucide-react";

const formatDate = (value) => { 
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value || "")
    : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

export function ActivityCard({ activity, onClick, onEdit, onDelete }) {
  const training = (activity.type || activity.activityType) === "training";
  const title =
    activity.title || activity.trainingType || (training ? "Training" : "Walk");
  return (
    <article className="activity-card card" onClick={onClick}>
      <span className="activity-icon">{training ? <Star /> : <Dog />}</span>
      <div className="stack">
        <div>
          <strong>{title}</strong>
          <div className="muted">
            {formatDate(
              activity.activityDate || activity.startedAt || activity.date,
            )}
          </div>
        </div>
        <div className="activity-meta">
          {(activity.durationMinutes ?? activity.duration) != null && (
            <span>{activity.durationMinutes ?? activity.duration} min</span>
          )}
          {(activity.distanceKm ?? activity.distance) != null && (
            <span>{activity.distanceKm ?? activity.distance} km</span>
          )}
          {activity.rating != null && <span>{activity.rating}/5 stars</span>}
        </div>
        {activity.notes && <p>{activity.notes}</p>}
      </div>
      {(onEdit || onDelete) && (
        <div className="cluster">
          {onEdit && (
            <button
              className="button button--ghost icon-button"
              aria-label="Edit activity"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil size={18} />
            </button>
          )}
          {onDelete && (
            <button
              className="button button--ghost icon-button"
              aria-label="Delete activity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
