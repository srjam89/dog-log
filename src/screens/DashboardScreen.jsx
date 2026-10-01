import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Dog, Footprints, GraduationCap } from "lucide-react";
import { activityService, analyticsService, dogService } from "../services";
import { useAppStore } from "../store";
import {
  ActivityCard,
  DogSelector,
  EmptyState,
  ErrorState,
  FloatingActionMenu,
  LoadingScreen,
  PageHeader,
  StatCard,
} from "../components";

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { activeDog, activeDogId, setActiveDog } = useAppStore();
  const [state, setState] = useState({
    dogs: [],
    activities: [],
    stats: {},
    loading: true,
    error: "",
  });
  const load = useCallback(async () => {
    try {
      const dogs = await dogService.listDogs();
      const selected =
        dogs.find((dog) => String(dog.id) === String(activeDogId)) || dogs[0];
      if (selected && selected.id !== activeDogId) setActiveDog(selected);
      const [activities, stats] = selected
        ? await Promise.all([
            activityService.listActivities({ dogId: selected.id, limit: 5 }),
            analyticsService.getTodayStats(selected.id),
          ])
        : [[], {}];
      setState({ dogs, activities, stats, loading: false, error: "" });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error.message,
      }));
    }
  }, [activeDogId, setActiveDog]);
  useEffect(() => {
    load();
  }, [load]);
  if (state.loading)
    return <LoadingScreen label="Fetching the latest tail wags…" />;
  if (state.error && !state.dogs.length)
    return <ErrorState message={state.error} onRetry={load} />;
  return (
    <div className="page stack">
      <PageHeader
        title={`Today with ${activeDog?.name || state.dogs[0]?.name || "your dog"}`}
        description="Small moments make a great story."
        actions={
          state.dogs.length > 0 && (
            <DogSelector
              dogs={state.dogs}
              value={activeDogId}
              onChange={(_, dog) => setActiveDog(dog)}
            />
          )
        }
      />
      {!state.dogs.length ? (
        <EmptyState
          title="Add your first dog"
          description="Create a profile before logging activities."
          actionLabel="Add dog"
          onAction={() => navigate("/dogs/new")}
        />
      ) : (
        <>
          <section className="stats-grid grid" aria-label="Today's summary">
            <StatCard
              icon={Footprints}
              label="Walks"
              value={state.stats.walkCount ?? 0}
            />
            <StatCard
              icon={Clock}
              label="Walk minutes"
              value={state.stats.walkMinutes ?? 0}
            />
            <StatCard
              icon={GraduationCap}
              label="Training"
              value={state.stats.trainingCount ?? 0}
            />
            <StatCard
              icon={Dog}
              label="Training minutes"
              value={state.stats.trainingMinutes ?? 0}
            />
          </section>
          <h2>Recent activity</h2>
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
              title="A fresh page"
              description="Your latest walks and training sessions will appear here."
            />
          )}
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
        </>
      )}
    </div>
  );
}
