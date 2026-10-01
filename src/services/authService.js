import { supabase } from './supabase';

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export const signUp = async ({ email, password, fullName, name }) =>
  unwrap(
    await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: (fullName ?? name ?? '').trim() },
        emailRedirectTo: `${window.location.origin}/`,
      },
    }),
  );

export const signIn = async (credentials, passwordValue) => {
  const { email, password } =
    typeof credentials === 'string'
      ? { email: credentials, password: passwordValue }
      : credentials;
  return unwrap(
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    }),
  );
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { session } = unwrap(await supabase.auth.getSession());
  return session;
};

export const getCurrentUser = async () => {
  const { user } = unwrap(await supabase.auth.getUser());
  return user;
};

export const resetPassword = async (email, redirectTo) => {
  const options = redirectTo ? { redirectTo } : undefined;
  return unwrap(
    await supabase.auth.resetPasswordForEmail(email.trim(), options),
  );
};

export const updatePassword = async (password) =>
  unwrap(await supabase.auth.updateUser({ password }));

export const updateEmail = async (email) =>
  unwrap(await supabase.auth.updateUser({ email: email.trim() }));

export const resendConfirmation = async (email) =>
  unwrap(
    await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    }),
  );

export const onAuthStateChange = (callback) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

export default {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  updateEmail,
  resendConfirmation,
  onAuthStateChange,
};
