import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Footprints, GraduationCap, Pencil } from "lucide-react";
import { activityService, analyticsService, dogService } from "../services";
import {
  ActivityCard,
  Button,
  EmptyState,
  ErrorState,
  FloatingActionMenu,
  LoadingScreen,
  PageHeader,
  StatCard,
} from "../components";

export default function DogProfileScreen() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    dog: null,
    activities: [],
    stats: {},
    loading: true,
    error: "",
  });
  const load = useCallback(async () => {
    try {
      const [dog, activities, stats] = await Promise.all([
        dogService.getDog(dogId),
        activityService.listActivities({ dogId, limit: 5 }),
        analyticsService.getMonthlyStats(dogId),
      ]);
      setState({ dog, activities, stats, loading: false, error: "" });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error.message,
      }));
    }
  }, [dogId]);
  useEffect(() => {
    load();
  }, [load]);
  if (state.loading) return <LoadingScreen label="Loading profile…" />;
  if (state.error || !state.dog)
    return (
      <ErrorState message={state.error || "Dog not found."} onRetry={load} />
    );
  const { dog } = state;
  return (
    <div className="page stack">
      <PageHeader
        title={dog.name}
        back={() => navigate(-1)}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate(`/dogs/${dog.id}/edit`, { state: { dog } })}
          >
            <Pencil size={18} /> Edit
          </Button>
        }
      />
      <section className="dog-card card">
        {dog.photoUrl ? (
          <img className="avatar" src={dog.photoUrl} alt={dog.name} />
        ) : (
          <span className="avatar avatar--large">{dog.name[0]}</span>
        )}
        <div>
          <h2>{dog.breed || "Breed not added"}</h2>
          <p className="muted">
            {[
              dog.birthDate,
              dog.weight &&
                `${Number(dog.weight).toFixed(1)} ${dog.weightUnit || "kg"}`,
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>
          {dog.notes && <p>{dog.notes}</p>}
        </div>
      </section>
      <section className="stats-grid grid">
        <StatCard
          icon={Footprints}
          label="Walks this month"
          value={state.stats.walkCount ?? 0}
        />
        <StatCard
          icon={GraduationCap}
          label="Training sessions"
          value={state.stats.trainingCount ?? 0}
        />
      </section>
      <h2>Latest entries</h2>
      {state.activities.length ? (
        state.activities.map((activity) => (
          <ActivityCard
            key={`${activity.type}-${activity.id}`}
            activity={activity}
            onClick={() =>
              navigate(
                `/${activity.type === "training" ? "training" : "walks"}/${activity.id}/edit`,
                { state: { activity } },
              )
            }
          />
        ))
      ) : (
        <EmptyState
          title="No entries yet"
          description={`Log ${dog.name}’s first walk or training session.`}
        />
      )}
      <FloatingActionMenu
        actions={[
          {
            label: "Log walk",
            icon: Footprints,
            onClick: () => navigate("/walks/new", { state: { dogId } }),
          },
          {
            label: "Log training",
            icon: GraduationCap,
            onClick: () => navigate("/training/new", { state: { dogId } }),
          },
        ]}
      />
    </div>
  );
}
