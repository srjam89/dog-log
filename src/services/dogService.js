import { supabase } from './supabase';

const PHOTO_BUCKET = 'dog-photos';

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

const firstDefined = (...values) =>
  values.find((value) => value !== undefined);

const dogFields = (dog) => {
  const weight = firstDefined(dog.weight_kg, dog.weightKg, dog.weight);
  const weightUnit = firstDefined(dog.weight_unit, dog.weightUnit);
  return compact({
    name: dog.name?.trim(),
    breed:
      dog.breed === undefined ? undefined : dog.breed?.trim() || null,
    birth_date: firstDefined(dog.birth_date, dog.birthDate),
    weight_kg:
      weight == null || weightUnit !== 'lb'
        ? weight
        : Number(weight) / 2.20462,
    weight_unit: weightUnit,
    gender: firstDefined(dog.gender, dog.sex),
    photo_path: firstDefined(dog.photo_path, dog.photoPath),
    notes:
      dog.notes === undefined ? undefined : dog.notes?.trim() || null,
  });
};

const hydrateDog = async (dog) => {
  if (!dog) return dog;
  const photoUrl = dog.photo_path
    ? await getDogPhotoUrl(dog.photo_path)
    : null;
  return {
    ...dog,
    birthDate: dog.birth_date,
    dateOfBirth: dog.birth_date,
    weight:
      dog.weight_kg == null || dog.weight_unit !== 'lb'
        ? dog.weight_kg
        : Number(dog.weight_kg) * 2.20462,
    weightKg: dog.weight_kg,
    weightUnit: dog.weight_unit,
    sex: dog.sex || dog.gender || 'unknown',
    photoUrl,
    photo_url: photoUrl,
  };
};

export const listDogs = async () => {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .order('created_at', { ascending: true });
  throwIfError(error);
  return Promise.all(data.map(hydrateDog));
};

export const getDog = async (id) => {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', id)
    .single();
  throwIfError(error);
  return hydrateDog(data);
};

export const createDog = async (dog) => {
  const ownerId = await requireUserId();
  const { data, error } = await supabase
    .from('dogs')
    .insert({ ...dogFields(dog), owner_id: ownerId })
    .select()
    .single();
  throwIfError(error);
  if (dog.photoFile) return uploadDogPhoto(data.id, dog.photoFile);
  return hydrateDog(data);
};

export const updateDog = async (id, changes) => {
  const existing = await getDog(id);
  const { data, error } = await supabase
    .from('dogs')
    .update(dogFields(changes))
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);

  if (changes.photoFile) {
    return uploadDogPhoto(id, changes.photoFile);
  }
  if (changes.photoUri === null || changes.photoUri === '') {
    if (existing.photo_path) {
      const { error: storageError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .remove([existing.photo_path]);
      throwIfError(storageError);
    }
    const { data: cleared, error: clearError } = await supabase
      .from('dogs')
      .update({ photo_path: null })
      .eq('id', id)
      .select()
      .single();
    throwIfError(clearError);
    return hydrateDog(cleared);
  }
  return hydrateDog(data);
};

export const deleteDog = async (id) => {
  const dog = await getDog(id);
  const { error } = await supabase.from('dogs').delete().eq('id', id);
  throwIfError(error);

  if (dog.photo_path) {
    const { error: storageError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([dog.photo_path]);
    throwIfError(storageError);
  }
  return dog;
};

const extensionFor = (file) => {
  const nameExtension = file.name?.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  if (nameExtension) return nameExtension.toLowerCase();
  return file.type?.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
};

export const uploadDogPhoto = async (dogId, file) => {
  if (!(file instanceof Blob)) throw new Error('Choose a valid image file.');

  const ownerId = await requireUserId();
  const extension = extensionFor(file);
  const path = `${ownerId}/${dogId}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
  throwIfError(uploadError);

  let previousPath;
  try {
    const dog = await getDog(dogId);
    previousPath = dog.photo_path;
    const { data: updatedDog, error: updateError } = await supabase
      .from('dogs')
      .update({ photo_path: path })
      .eq('id', dogId)
      .select()
      .single();
    throwIfError(updateError);
    if (previousPath && previousPath !== path) {
      await supabase.storage.from(PHOTO_BUCKET).remove([previousPath]);
    }
    return hydrateDog(updatedDog);
  } catch (error) {
    await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    throw error;
  }
};

export const getDogPhotoUrl = async (path, expiresIn = 3600) => {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(path, expiresIn);
  throwIfError(error);
  return data.signedUrl;
};

export default {
  listDogs,
  getDog,
  createDog,
  updateDog,
  deleteDog,
  uploadDogPhoto,
  getDogPhotoUrl,
};
