const sum = (values) => values.reduce((total, value) => total + Number(value || 0), 0);

const average = (values) =>
  values.length ? sum(values) / values.length : 0;

export const groupCountByDay = (activities) =>
  activities.reduce((result, activity) => {
    const value =
      activity.activityDate || activity.started_at || activity.occurred_at;
    const day = new Date(value).toISOString().slice(0, 10);
    result[day] = (result[day] || 0) + 1;
    return result;
  }, {});

export const countSkills = (sessions) =>
  sessions.reduce((result, session) => {
    (session.skills || []).forEach((skill) => {
      const name = skill.trim();
      if (name) result[name] = (result[name] || 0) + 1;
    });
    return result;
  }, {});

export const summarizeActivities = (walks = [], trainingSessions = []) => {
  const allRatings = [...walks, ...trainingSessions]
    .map((item) => item.rating)
    .filter((rating) => rating != null);

  return {
    totalActivities: walks.length + trainingSessions.length,
    totalWalks: walks.length,
    totalTrainingSessions: trainingSessions.length,
    totalWalkMinutes: sum(walks.map((walk) => walk.duration_minutes)),
    totalTrainingMinutes: sum(
      trainingSessions.map((session) => session.duration_minutes),
    ),
    totalDistanceKm: sum(walks.map((walk) => walk.distance_km)),
    averageRating: average(allRatings),
    skillCounts: countSkills(trainingSessions),
    activityByDay: groupCountByDay([
      ...walks.map((walk) => ({
        activityDate: walk.started_at,
      })),
      ...trainingSessions.map((session) => ({
        activityDate: session.occurred_at,
      })),
    ]),
  };
};

export const topSkills = (sessions, limit = 5) =>
  Object.entries(countSkills(sessions))
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
    .slice(0, limit);
