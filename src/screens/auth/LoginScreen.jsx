import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { authService } from '../../services';
import { useAppStore } from '../../store';
import { Button, FormField } from '../../components';

const schema = z.object({ email: z.string().trim().email('Enter a valid email'), password: z.string().min(6, 'Use at least 6 characters') });

export default function LoginScreen() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  const submit = async (values) => {
    setError('');
    try {
      const result = await authService.signIn(values);
      setSession(result.session);
      navigate('/', { replace: true });
    } catch (requestError) { setError(requestError.message || 'Unable to sign in.'); }
  };
  return <main className="auth-page"><form className="auth-card card stack" onSubmit={handleSubmit(submit)}>
    <LogIn size={34} /><div><h1>Welcome back</h1><p className="muted">Sign in to keep your dog’s story up to date.</p></div>
    {error && <p className="alert" role="alert">{error}</p>}
    <FormField label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
    <FormField label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
    <Button type="submit" loading={isSubmitting}>Sign in</Button>
    <Link to="/forgot-password">Forgot password?</Link><p>New here? <Link to="/register">Create an account</Link></p>
  </form></main>;
}
