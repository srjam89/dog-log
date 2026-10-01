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

export const getProfile = async () => {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  throwIfError(error);
  return data;
};

export const updateProfile = async (changes) => {
  const userId = await requireUserId();
  const values = compact({
    full_name:
      changes.full_name ??
      changes.fullName ??
      changes.displayName ??
      changes.name,
    avatar_url: changes.avatar_url ?? changes.avatarUrl,
    timezone: changes.timezone,
  });
  const { data, error } = await supabase
    .from('profiles')
    .update(values)
    .eq('id', userId)
    .select()
    .single();
  throwIfError(error);
  return data;
};

export const getNotificationPreferences = async () => {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  throwIfError(error);
  return data;
};

export const updateNotificationPreferences = async (changes) => {
  const userId = await requireUserId();
  const values = compact({
    reminders_enabled:
      changes.reminders_enabled ?? changes.remindersEnabled,
    walk_reminders_enabled:
      changes.walk_reminders_enabled ?? changes.walkRemindersEnabled,
    walk_reminder_time:
      changes.walk_reminder_time ?? changes.walkReminderTime,
    training_reminders_enabled:
      changes.training_reminders_enabled ?? changes.trainingRemindersEnabled,
    training_reminder_time:
      changes.training_reminder_time ?? changes.trainingReminderTime,
    daily_check_in_enabled:
      changes.daily_check_in_enabled ?? changes.dailyCheckInEnabled,
    daily_check_in_time:
      changes.daily_check_in_time ?? changes.dailyCheckInTime,
  });
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ ...values, user_id: userId }, { onConflict: 'user_id' })
    .select()
    .single();
  throwIfError(error);
  return data;
};

export default {
  getProfile,
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
};
