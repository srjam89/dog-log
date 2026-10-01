import { useEffect } from 'react';

import { isSupabaseConfigured, supabase } from '../services/supabase';
import { useAppStore } from '../store';

export function useAuthSession() {
  const session = useAppStore((state) => state.session);
  const isAuthLoading = useAppStore((state) => state.isAuthLoading);
  const setSession = useAppStore((state) => state.setSession);
  const setAuthLoading = useAppStore((state) => state.setAuthLoading);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthLoading, setSession]);

  return { session, isAuthLoading, isSupabaseConfigured };
}
