import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authService } from '../../services';
import { useAppStore } from '../../store';
import { Button, FormField } from '../../components';

const schema = z.object({ fullName: z.string().trim().min(2, 'Enter your name'), email: z.string().trim().email('Enter a valid email'), password: z.string().min(8, 'Use at least 8 characters'), confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export default function RegisterScreen() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' } });
  const submit = async ({ fullName, email, password }) => {
    setError('');
    try {
      const result = await authService.signUp({ fullName, email, password });
      if (result.session) { setSession(result.session); navigate('/', { replace: true }); }
      else {
        setPendingEmail(email);
        setMessage('Account created. Check your email to confirm your address.');
      }
    } catch (requestError) { setError(requestError.message || 'Unable to create your account.'); }
  };
  return <main className="auth-page"><form className="auth-card card stack" onSubmit={handleSubmit(submit)}>
    <UserPlus size={34} /><div><h1>Create your account</h1><p className="muted">Start capturing happier, healthier days together.</p></div>
    {error && <p className="alert" role="alert">{error}</p>}{message && <p className="notice">{message}</p>}
    {pendingEmail && <Button variant="secondary" loading={resending} onClick={async () => {
      setResending(true);
      setError('');
      try {
        await authService.resendConfirmation(pendingEmail);
        setMessage('A fresh confirmation email has been sent. Use the newest link.');
      } catch (requestError) {
        setError(requestError.message || 'Could not resend the confirmation email.');
      } finally {
        setResending(false);
      }
    }}>Resend confirmation email</Button>}
    <FormField label="Name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
    <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
    <FormField label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
    <FormField label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
    <Button type="submit" loading={isSubmitting}>Create account</Button><p>Already registered? <Link to="/login">Sign in</Link></p>
  </form></main>;
}
