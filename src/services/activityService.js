import { dateRangeForDays } from '../utils/date';
import { supabase } from './supabase';

const throwIfError = (error) => {
  if (error) throw error;
};

const requireUserId = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  throwIfError(error);
  if (!user) throw new Error('You must be signed in.');
  return user.id;
};

const compact = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));

const walkFields = (walk) =>
  compact({
    dog_id: walk.dog_id ?? walk.dogId,
    started_at: walk.started_at ?? walk.startedAt ?? walk.date,
    duration_minutes: walk.duration_minutes ?? walk.durationMinutes,
    distance_km: walk.distance_km ?? walk.distanceKm ?? walk.distance,
    location: walk.location,
    weather: walk.weather,
    behaviour_notes:
      walk.behaviour_notes ?? walk.behaviourNotes ?? walk.behaviorObservations,
    rating: walk.rating,
    notes: walk.notes,
  });

const trainingFields = (session) =>
  compact({
    dog_id: session.dog_id ?? session.dogId,
    occurred_at:
      session.occurred_at ??
      session.occurredAt ??
      session.startedAt ??
      session.date,
    duration_minutes: session.duration_minutes ?? session.durationMinutes,
    location: session.location,
    training_type: session.training_type ?? session.trainingType ?? session.type,
    skills: session.skills,
    exercises: session.exercises ?? session.exercisesPracticed,
    went_well: session.went_well ?? session.wentWell,
    issues: session.issues ?? session.problemsEncountered,
    improvements:
      session.improvements ?? session.areasForImprovement,
    success_rating: session.success_rating ?? session.successRating,
    focus_rating: session.focus_rating ?? session.focusRating,
    rating:
      session.rating ?? session.success_rating ?? session.successRating,
    notes: session.notes,
  });

const addFilters = (query, filters, dateColumn) => {
  let result = query;
  if (filters.dogId) result = result.eq('dog_id', filters.dogId);
  if (filters.from) result = result.gte(dateColumn, filters.from);
  if (filters.to) result = result.lte(dateColumn, filters.to);
  if (filters.limit) result = result.limit(filters.limit);
  return result;
};

const mapWalk = (walk) => ({
  ...walk,
  type: 'walk',
  activityType: 'walk',
  activityDate: walk.started_at,
  startedAt: walk.started_at,
  date: walk.started_at,
  durationMinutes: walk.duration_minutes,
  duration: walk.duration_minutes,
  distanceKm: walk.distance_km,
  distance: walk.distance_km,
  behaviourNotes: walk.behaviour_notes,
});

const mapTraining = (session) => ({
  ...session,
  type: 'training',
  activityType: 'training',
  activityDate: session.occurred_at,
  startedAt: session.occurred_at,
  date: session.occurred_at,
  durationMinutes: session.duration_minutes,
  duration: session.duration_minutes,
  trainingType: session.training_type,
  title: session.training_type,
  successRating: session.success_rating,
  focusRating: session.focus_rating,
});

export const listWalks = async (filters = {}) => {
  let query = supabase
    .from('walks')
    .select('*, dog:dogs(id, name, photo_path)')
    .order('started_at', { ascending: false });
  query = addFilters(query, filters, 'started_at');
  const { data, error } = await query;
  throwIfError(error);
  return data.map(mapWalk);
};

export const getWalk = async (id) => {
  const { data, error } = await supabase
    .from('walks')
    .select('*, dog:dogs(id, name, photo_path)')
    .eq('id', id)
    .single();
  throwIfError(error);
  return mapWalk(data);
};

export const createWalk = async (walk) => {
  const ownerId = await requireUserId();
  const { data, error } = await supabase
    .from('walks')
    .insert({ ...walkFields(walk), owner_id: ownerId })
    .select()
    .single();
  throwIfError(error);
  return mapWalk(data);
};

export const updateWalk = async (id, changes) => {
  const { data, error } = await supabase
    .from('walks')
    .update(walkFields(changes))
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return mapWalk(data);
};

export const deleteWalk = async (id) => {
  const { data, error } = await supabase
    .from('walks')
    .delete()
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return mapWalk(data);
};

export const listTrainingSessions = async (filters = {}) => {
  let query = supabase
    .from('training_sessions')
    .select('*, dog:dogs(id, name, photo_path)')
    .order('occurred_at', { ascending: false });
  query = addFilters(query, filters, 'occurred_at');
  if (filters.trainingType) {
    query = query.eq('training_type', filters.trainingType);
  }
  const { data, error } = await query;
  throwIfError(error);
  return data.map(mapTraining);
};

export const getTrainingSession = async (id) => {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*, dog:dogs(id, name, photo_path)')
    .eq('id', id)
    .single();
  throwIfError(error);
  return mapTraining(data);
};

export const createTrainingSession = async (session) => {
  const ownerId = await requireUserId();
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({ ...trainingFields(session), owner_id: ownerId })
    .select()
    .single();
  throwIfError(error);
  return mapTraining(data);
};

export const updateTrainingSession = async (id, changes) => {
  const { data, error } = await supabase
    .from('training_sessions')
    .update(trainingFields(changes))
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return mapTraining(data);
};

export const deleteTrainingSession = async (id) => {
  const { data, error } = await supabase
    .from('training_sessions')
    .delete()
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return mapTraining(data);
};

export const listActivities = async (filters = {}) => {
  const rangeDays = { day: 1, week: 7, month: 30 }[filters.range];
  const activityType = filters.activityType || filters.trainingType;
  const dateFilters = rangeDays ? dateRangeForDays(rangeDays) : {};
  const queryFilters = {
    dogId: filters.dogId,
    from: filters.from || dateFilters.from,
    to: filters.to || dateFilters.to,
    limit: filters.limit,
  };

  // Walks ignore training-type filters; only include them for "all" or "walk".
  const includeWalks = !activityType || activityType === 'walk';
  const includeTraining = activityType !== 'walk';
  const trainingFilters =
    activityType && activityType !== 'walk'
      ? { ...queryFilters, trainingType: activityType }
      : queryFilters;

  const [walks, trainingSessions] = await Promise.all([
    includeWalks ? listWalks(queryFilters) : Promise.resolve([]),
    includeTraining
      ? listTrainingSessions(trainingFilters)
      : Promise.resolve([]),
  ]);

  return [...walks, ...trainingSessions]
    .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate))
    .slice(0, filters.limit || undefined);
};

export default {
  listWalks,
  getWalk,
  createWalk,
  updateWalk,
  deleteWalk,
  listTrainingSessions,
  getTrainingSession,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  listActivities,
};
