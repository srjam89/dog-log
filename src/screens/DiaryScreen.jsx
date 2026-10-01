import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footprints, GraduationCap } from "lucide-react";
import { activityService } from "../services";
import { useAppStore } from "../store";
import {
  ActivityCard,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FloatingActionMenu,
  LoadingScreen,
  PageHeader,
} from "../components";

export default function DiaryScreen() {
  const navigate = useNavigate();
  const dogId = useAppStore((state) => state.activeDogId);
  const [range, setRange] = useState("week");
  const [activityType, setActivityType] = useState("all");
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!dogId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    try {
      setActivities(
        await activityService.listActivities({
          dogId,
          range: range === "all" ? undefined : range,
          activityType: activityType === "all" ? undefined : activityType,
        }),
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [dogId, range, activityType]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? activities.filter((item) =>
          [
            item.title,
            item.notes,
            item.trainingType,
            ...(Array.isArray(item.skills) ? item.skills : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(needle),
        )
      : activities;
  }, [activities, query]);
  const remove = async () => {
    setBusy(true);
    try {
      await (deleting.type === "training"
        ? activityService.deleteTrainingSession(deleting.id)
        : activityService.deleteWalk(deleting.id));
      setActivities((items) =>
        items.filter(
          (item) =>
            `${item.type}-${item.id}` !== `${deleting.type}-${deleting.id}`,
        ),
      );
      setDeleting(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <LoadingScreen label="Opening the journal…" />;
  if (error && !activities.length)
    return <ErrorState message={error} onRetry={load} />;
  return (
    <div className="page stack">
      <PageHeader
        title="Diary"
        description="Browse every walk and training session."
      />
      <section className="card stack">
        <div className="segmented" aria-label="Date range">
          {["day", "week", "month", "all"].map((item) => (
            <button
              type="button"
              className={range === item ? "active" : ""}
              key={item}
              onClick={() => setRange(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Search entries</span>
          <input
            className="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Notes, skills, training type…"
          />
        </label>
        <label className="field">
          <span>Activity type</span>
          <select
            value={activityType}
            onChange={(event) => setActivityType(event.target.value)}
          >
            {[
              { value: "all", label: "All activities" },
              { value: "walk", label: "Walks" },
              { value: "recall", label: "Recall" },
              { value: "heel work", label: "Heel work" },
              { value: "sit", label: "Sit" },
              { value: "stay", label: "Stay" },
              { value: "agility", label: "Agility" },
              { value: "socialisation", label: "Socialisation" },
              { value: "custom", label: "Custom" },
            ].map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </section>
      {!filtered.length ? (
        <EmptyState
          title={dogId ? "No matching entries" : "Choose or add a dog"}
          description={
            dogId
              ? "Try another period or search."
              : "A dog profile is needed before you can journal."
          }
        />
      ) : (
        filtered.map((activity) => (
          <ActivityCard
            key={`${activity.type}-${activity.id}`}
            activity={activity}
            onEdit={() =>
              navigate(
                `/${activity.type === "training" ? "training" : "walks"}/${activity.id}/edit`,
                { state: { activity } },
              )
            }
            onDelete={() => setDeleting(activity)}
          />
        ))
      )}
      {dogId && (
        <FloatingActionMenu
          actions={[
            {
              label: "Log walk",
              icon: Footprints,
              onClick: () => navigate("/walks/new"),
            },
            {
              label: "Log training",
              icon: GraduationCap,
              onClick: () => navigate("/training/new"),
            },
          ]}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        title="Delete this entry?"
        message="This action cannot be undone."
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
