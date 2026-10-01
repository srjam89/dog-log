import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { dogService } from '../services';
import { Button, FormField, LoadingScreen, PageHeader } from '../components';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  breed: z.string().trim().max(80),
  birthDate: z.string(),
  weight: z.union([z.literal(''), z.coerce.number().positive('Enter a valid weight').max(200)]),
  weightUnit: z.enum(['kg', 'lb']),
  sex: z.enum(['female', 'male', 'unknown']),
  notes: z.string().trim().max(500),
  photoFile: z.any().optional(),
});

export default function DogFormScreen() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [dog, setDog] = useState(location.state?.dog || null);
  const [loading, setLoading] = useState(!!dogId && !dog);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(dog?.photoUrl || '');
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', breed: '', birthDate: '', weight: '', weightUnit: 'kg', sex: 'unknown', notes: '', photoFile: undefined },
  });
  useEffect(() => {
    if (!dogId || dog) return;
    dogService.getDog(dogId).then(setDog).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [dogId, dog]);
  useEffect(() => {
    if (!dog) return;
    reset({ name: dog.name || '', breed: dog.breed || '', birthDate: dog.birthDate || '', weight: dog.weight ?? '', weightUnit: dog.weightUnit || 'kg', sex: dog.sex || 'unknown', notes: dog.notes || '', photoFile: undefined });
    setPreview(dog.photoUrl || '');
  }, [dog, reset]);
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);
  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    setValue('photoFile', file, { shouldDirty: true });
    setPreview(file ? URL.createObjectURL(file) : dog?.photoUrl || '');
  };
  const submit = async (values) => {
    setError('');
    try {
      const payload = { ...values, weight: values.weight === '' ? null : Number(values.weight), photoFile: values.photoFile || null };
      if (dogId) await dogService.updateDog(dogId, payload); else await dogService.createDog(payload);
      navigate(dogId ? `/dogs/${dogId}` : '/dogs');
    } catch (requestError) { setError(requestError.message || 'Could not save this profile.'); }
  };
  if (loading) return <LoadingScreen label="Loading dog details…" />;
  return <div className="page page--narrow"><PageHeader title={dogId ? `Edit ${dog?.name || 'dog'}` : 'Add a dog'} back={() => navigate(-1)} />
    <form className="stack" onSubmit={handleSubmit(submit)}>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="card stack"><div className="cluster">{preview && <img className="photo-preview" src={preview} alt="Dog preview" />}
        <label className="button button--secondary"><Camera size={18} /> Choose photo<input className="sr-only" type="file" accept="image/*" onChange={selectPhoto} /></label></div>
        <FormField label="Name" autoComplete="off" error={errors.name?.message} {...register('name')} />
        <FormField label="Breed (optional)" error={errors.breed?.message} {...register('breed')} />
        <FormField label="Birth date" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
        <div className="grid grid--two"><FormField label="Weight (optional)" type="number" inputMode="decimal" step="0.1" error={errors.weight?.message} {...register('weight')} />
          <FormField label="Unit" as="select" options={[{ value: 'kg', label: 'Kilograms' }, { value: 'lb', label: 'Pounds' }]} {...register('weightUnit')} /></div>
        <FormField label="Sex" as="select" options={['female', 'male', 'unknown']} {...register('sex')} />
        <FormField label="Notes (optional)" as="textarea" rows="4" error={errors.notes?.message} {...register('notes')} />
      </div><Button type="submit" loading={isSubmitting}>{dogId ? 'Save changes' : 'Add dog'}</Button>
    </form>
  </div>;
}
