import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, User } from 'lucide-react';
import { authService, profileService } from '../services';
import { useAppStore } from '../store';
import { Button, ErrorState, FormField, LoadingScreen, PageHeader } from '../components';

const schema = z.object({ displayName: z.string().trim().min(2, 'Enter your name').max(80), notificationsEnabled: z.boolean(), reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM') });

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { session, setSession, themeMode, setThemeMode } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { displayName: '', notificationsEnabled: false, reminderTime: '18:00' } });
  const enabled = watch('notificationsEnabled');
  const load = useCallback(async () => {
    try {
      const [profile, preferences] = await Promise.all([profileService.getProfile(), profileService.getNotificationPreferences()]);
      reset({ displayName: profile.full_name || session?.user?.user_metadata?.full_name || '', notificationsEnabled: preferences.reminders_enabled || false, reminderTime: preferences.daily_check_in_time?.slice(0, 5) || '18:00' });
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }, [reset, session]);
  useEffect(() => { load(); }, [load]);
  const save = async (values) => {
    setError('');
    try {
      await Promise.all([profileService.updateProfile({ fullName: values.displayName }), profileService.updateNotificationPreferences({ remindersEnabled: values.notificationsEnabled, dailyCheckInEnabled: values.notificationsEnabled, dailyCheckInTime: values.reminderTime })]);
      setNotice('Preferences saved.');
    } catch (requestError) { setError(requestError.message); }
  };
  const logout = async () => {
    try { await authService.signOut(); setSession(null); navigate('/login', { replace: true }); } catch (requestError) { setError(requestError.message); }
  };
  if (loading) return <LoadingScreen label="Loading preferences…" />;
  if (error && !session?.user) return <ErrorState message={error} onRetry={load} />;
  return <div className="page page--narrow stack"><PageHeader title="Profile" description="Manage your account and preferences." />
    <form className="stack" onSubmit={handleSubmit(save)}>{error && <p className="alert" role="alert">{error}</p>}{notice && <p className="notice">{notice}</p>}
      <section className="card stack"><h2 className="cluster"><User /> Account</h2><FormField label="Display name" error={errors.displayName?.message} {...register('displayName')} /><FormField label="Email" value={session?.user?.email || ''} disabled readOnly /></section>
      <section className="card stack"><h2 className="cluster"><Moon /> Appearance</h2><FormField label="Theme" as="select" options={[{ value: 'system', label: 'Use device setting' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={themeMode} onChange={(event) => setThemeMode(event.target.value)} />
        <label className="cluster"><input type="checkbox" {...register('notificationsEnabled')} /> Daily reminder</label>
        <FormField label="Reminder time" type="time" disabled={!enabled} error={errors.reminderTime?.message} {...register('reminderTime')} /><p className="muted">Reminder settings are stored; browser notification delivery requires separate setup.</p>
      </section>
      <Button type="submit" loading={isSubmitting}>Save preferences</Button>
    </form><Button variant="secondary" onClick={logout}><LogOut size={18} /> Sign out</Button>
  </div>;
}
