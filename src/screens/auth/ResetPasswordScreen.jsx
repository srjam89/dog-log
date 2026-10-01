import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button, FormField } from '../../components';
import { authService } from '../../services';

const schema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const submit = async ({ password }) => {
    setError('');
    try {
      await authService.updatePassword(password);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'The reset link may have expired. Request a new one.');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card card stack" onSubmit={handleSubmit(submit)}>
        <KeyRound size={34} />
        <div>
          <h1>Choose a new password</h1>
          <p className="muted">Use at least eight characters.</p>
        </div>
        {error && <p className="alert" role="alert">{error}</p>}
        <FormField label="New password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <FormField label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" loading={isSubmitting}>Update password</Button>
        <Link to="/forgot-password">Request another link</Link>
      </form>
    </main>
  );
}
