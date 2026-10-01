import { listTrainingSessions, listWalks } from './activityService';
import { summarizeActivities, topSkills } from '../utils/analytics';
import { dateRangeForDays, endOfDay, startOfDay } from '../utils/date';

export const getAnalytics = async ({
  dogId,
  days = 30,
  from,
  to,
} = {}) => {
  const range = from || to ? { from, to } : dateRangeForDays(days);
  const filters = { dogId, ...range };
  const [walks, trainingSessions] = await Promise.all([
    listWalks(filters),
    listTrainingSessions(filters),
  ]);

  return {
    ...summarizeActivities(walks, trainingSessions),
    topSkills: topSkills(trainingSessions),
    walks,
    trainingSessions,
    range,
  };
};

export const getDashboardStats = async (dogId, days = 7) => {
  const analytics = await getAnalytics({ dogId, days });
  return {
    totalActivities: analytics.totalActivities,
    totalWalks: analytics.totalWalks,
    totalTrainingSessions: analytics.totalTrainingSessions,
    totalMinutes:
      analytics.totalWalkMinutes + analytics.totalTrainingMinutes,
    totalDistanceKm: analytics.totalDistanceKm,
    averageRating: analytics.averageRating,
    activityByDay: analytics.activityByDay,
  };
};

export const getDogAnalytics = (dogId, options = {}) =>
  getAnalytics({ ...options, dogId });

const toStatSummary = (analytics) => ({
  walkCount: analytics.totalWalks,
  walks: analytics.totalWalks,
  walkMinutes: analytics.totalWalkMinutes,
  minutes: analytics.totalWalkMinutes,
  trainingCount: analytics.totalTrainingSessions,
  training: analytics.totalTrainingSessions,
  trainingMinutes: analytics.totalTrainingMinutes,
  averageRating: analytics.averageRating,
  totalDistanceKm: analytics.totalDistanceKm,
});

export const getTodayStats = async (dogId, value = new Date()) => {
  const analytics = await getAnalytics({
    dogId,
    from: startOfDay(value).toISOString(),
    to: endOfDay(value).toISOString(),
  });
  return toStatSummary(analytics);
};

export const getMonthlyStats = async (dogId, value = new Date()) => {
  const monthStart = new Date(value);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const analytics = await getAnalytics({
    dogId,
    from: monthStart.toISOString(),
    to: new Date(value).toISOString(),
  });
  return toStatSummary(analytics);
};

const daysForPeriod = { week: 7, month: 30, year: 365 };

const calculateStreak = (activityByDay) => {
  const activeDays = new Set(Object.keys(activityByDay));
  const cursor = new Date();
  let streak = 0;
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const getOverview = async (dogId, { period = 'month' } = {}) => {
  const result = await getAnalytics({
    dogId,
    days: daysForPeriod[period] || 30,
  });
  return {
    ...result,
    walkCount: result.totalWalks,
    walkMinutes: result.totalWalkMinutes,
    trainingCount: result.totalTrainingSessions,
    trainingMinutes: result.totalTrainingMinutes,
    averageWalkDuration: result.totalWalks
      ? result.totalWalkMinutes / result.totalWalks
      : 0,
    averageTrainingDuration: result.totalTrainingSessions
      ? result.totalTrainingMinutes / result.totalTrainingSessions
      : 0,
    activityFrequency: Object.entries(result.activityByDay)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([label, value]) => ({ label: label.slice(5), value })),
    skills: result.topSkills.map(({ skill, count }) => ({
      name: skill,
      count,
    })),
    mostPractisedSkill: result.topSkills[0]?.skill || null,
    streak: calculateStreak(result.activityByDay),
  };
};

export default {
  getAnalytics,
  getDashboardStats,
  getDogAnalytics,
  getTodayStats,
  getMonthlyStats,
  getOverview,
};
