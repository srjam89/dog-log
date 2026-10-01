import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Footprints,
  GraduationCap,
  Star,
} from "lucide-react";
import { analyticsService } from "../services";
import { useAppStore } from "../store";
import {
  EmptyState,
  ErrorState,
  LoadingScreen,
  PageHeader,
  StatCard,
} from "../components";

function BarList({ title, items }) {
  const max = Math.max(1, ...items.map((item) => Number(item.value)));
  return (
    <section className="card stack">
      <h2>{title}</h2>
      {items.length ? (
        items.map((item) => (
          <div className="progress-row" key={item.label}>
            <div className="cluster">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="progress">
              <span style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))
      ) : (
        <p className="muted">Not enough data yet.</p>
      )}
    </section>
  );
}

export default function AnalyticsScreen() {
  const dogId = useAppStore((state) => state.activeDogId);
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!dogId) {
      setLoading(false);
      return;
    }
    try {
      setData(
        await analyticsService.getDogAnalytics(dogId, {
          days: { week: 7, month: 30, year: 365 }[period],
        }),
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [dogId, period]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  if (loading) return <LoadingScreen label="Crunching the numbers…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!dogId)
    return (
      <EmptyState
        title="No active dog"
        description="Choose a dog to see progress and patterns."
      />
    );
  const days = Object.entries(data.activityByDay || {}).map(
    ([label, value]) => ({ label, value }),
  );
  const skills = (data.topSkills || []).map((item) => ({
    label: item.skill,
    value: item.count,
  }));
  return (
    <div className="page stack">
      <PageHeader
        title="Progress"
        description="See activity patterns and training consistency."
      />
      <div className="segmented" aria-label="Analytics period">
        {["week", "month", "year"].map((item) => (
          <button
            type="button"
            className={period === item ? "active" : ""}
            key={item}
            onClick={() => setPeriod(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      <section className="stats-grid grid">
        <StatCard
          icon={Footprints}
          label="Walks"
          value={data.totalWalks || 0}
        />
        <StatCard
          icon={Clock}
          label="Walk minutes"
          value={data.totalWalkMinutes || 0}
        />
        <StatCard
          icon={GraduationCap}
          label="Training"
          value={data.totalTrainingSessions || 0}
        />
        <StatCard
          icon={Star}
          label="Average rating"
          value={
            data.averageRating ? Number(data.averageRating).toFixed(1) : "—"
          }
        />
      </section>
      <section className="grid grid--two">
        <BarList title="Activity by day" items={days} />
        <BarList title="Skills practised" items={skills} />
      </section>
      <section className="card">
        <CalendarDays />
        <h2>{Object.keys(data.activityByDay || {}).length} active days</h2>
        <p className="muted">
          Most practised skill: {data.topSkills?.[0]?.skill || "None yet"}
        </p>
      </section>
    </div>
  );
}
