import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { authService } from '../../services';
import { Button, FormField } from '../../components';

const schema = z.object({ email: z.string().trim().email('Enter a valid email') });

export default function ForgotPasswordScreen() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });
  const submit = async ({ email }) => {
    setError('');
    try {
      await authService.resetPassword(email, `${window.location.origin}/reset-password`);
      setMessage('If an account exists, a reset link is on its way.');
    } catch (requestError) { setError(requestError.message || 'Could not send the reset email.'); }
  };
  return <main className="auth-page"><form className="auth-card card stack" onSubmit={handleSubmit(submit)}>
    <Mail size={34} /><div><h1>Reset password</h1><p className="muted">We’ll email you a secure link.</p></div>
    {error && <p className="alert" role="alert">{error}</p>}{message && <p className="notice">{message}</p>}
    <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
    <Button type="submit" loading={isSubmitting}>Send reset link</Button><Link to="/login">Back to sign in</Link>
  </form></main>;
}
