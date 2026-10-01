import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { activityService, dogService } from "../services";
import {
  Button,
  ConfirmDialog,
  DogSelector,
  FormField,
  LoadingScreen,
  PageHeader,
  RatingInput,
} from "../components";
import { useAppStore } from "../store";

const base = {
  dogId: z.string().min(1, "Choose a dog"),
  date: z.string().min(1, "Date is required"),
  duration: z.coerce
    .number()
    .int()
    .positive("Enter at least 1 minute")
    .max(1440),
  location: z.string().trim().min(1, "Location is required").max(120),
  rating: z.number().min(1, "Add a rating").max(5),
  notes: z.string().trim().max(1000),
};
const walkSchema = z.object({
  ...base,
  distance: z.union([z.literal(""), z.coerce.number().nonnegative().max(500)]),
  weather: z.string().trim().max(80),
  behaviourNotes: z.string().trim().max(1000),
});
const trainingSchema = z.object({
  ...base,
  trainingType: z.string().min(1),
  skills: z.string().trim().max(300),
  focusRating: z.number().min(1, "Add a focus rating").max(5),
  wentWell: z.string().trim().max(1000),
  issues: z.string().trim().max(1000),
  improvements: z.string().trim().max(1000),
});
const localDateTime = (value = new Date()) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function ActivityForm({ type }) {
  const training = type === "training";
  const { activityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeDogId = useAppStore((state) => state.activeDogId);
  const [activity, setActivity] = useState(location.state?.activity || null);
  const [dogs, setDogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!activityId && !activity);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(training ? trainingSchema : walkSchema),
    defaultValues: training
      ? {
          dogId: String(location.state?.dogId || activeDogId || ""),
          date: localDateTime(),
          duration: "",
          location: "",
          rating: 0,
          notes: "",
          trainingType: "recall",
          skills: "",
          focusRating: 0,
          wentWell: "",
          issues: "",
          improvements: "",
        }
      : {
          dogId: String(location.state?.dogId || activeDogId || ""),
          date: localDateTime(),
          duration: "",
          location: "",
          rating: 0,
          notes: "",
          distance: "",
          weather: "",
          behaviourNotes: "",
        },
  });
  useEffect(() => {
    dogService
      .listDogs()
      .then(setDogs)
      .catch((requestError) => setError(requestError.message));
  }, []);
  useEffect(() => {
    if (!activityId || activity) return;
    const get = training
      ? activityService.getTrainingSession
      : activityService.getWalk;
    get(activityId)
      .then(setActivity)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [activityId, activity, training]);
  useEffect(() => {
    if (!activity) return;
    const common = {
      dogId: String(activity.dog_id || activity.dogId),
      date: localDateTime(activity.activityDate || activity.date),
      duration: activity.durationMinutes ?? "",
      location: activity.location || "",
      rating: activity.rating || activity.successRating || 0,
      notes: activity.notes || "",
    };
    reset(
      training
        ? {
            ...common,
            trainingType: activity.trainingType || "recall",
            skills: Array.isArray(activity.skills)
              ? activity.skills.join(", ")
              : activity.skills || "",
            focusRating: activity.focusRating || 0,
            wentWell: activity.went_well || "",
            issues: activity.issues || "",
            improvements: activity.improvements || "",
          }
        : {
            ...common,
            distance: activity.distanceKm ?? "",
            weather: activity.weather || "",
            behaviourNotes: activity.behaviourNotes || "",
          },
    );
  }, [activity, reset, training]);
  const submit = async (values) => {
    setError("");
    const common = {
      dogId: values.dogId,
      startedAt: new Date(values.date).toISOString(),
      durationMinutes: Number(values.duration),
      location: values.location,
      rating: values.rating,
      notes: values.notes || null,
    };
    const payload = training
      ? {
          ...common,
          trainingType: values.trainingType,
          skills: values.skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          successRating: values.rating,
          focusRating: values.focusRating,
          wentWell: values.wentWell || null,
          issues: values.issues || null,
          improvements: values.improvements || null,
        }
      : {
          ...common,
          distance: values.distance === "" ? null : Number(values.distance),
          weather: values.weather || null,
          behaviourNotes: values.behaviourNotes || null,
        };
    try {
      const method = activityId
        ? training
          ? activityService.updateTrainingSession
          : activityService.updateWalk
        : training
          ? activityService.createTrainingSession
          : activityService.createWalk;
      await (activityId ? method(activityId, payload) : method(payload));
      navigate("/diary");
    } catch (requestError) {
      setError(requestError.message || "Could not save this entry.");
    }
  };
  const remove = async () => {
    setDeleting(true);
    try {
      await (training
        ? activityService.deleteTrainingSession(activityId)
        : activityService.deleteWalk(activityId));
      navigate("/diary");
    } catch (requestError) {
      setError(requestError.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };
  if (loading) return <LoadingScreen label="Loading entry…" />;
  return (
    <div className="page page--narrow">
      <PageHeader
        title={`${activityId ? "Edit" : "Log"} ${training ? "training" : "a walk"}`}
        back={() => navigate(-1)}
      />
      <form className="stack" onSubmit={handleSubmit(submit)}>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="card stack">
          <Controller
            name="dogId"
            control={control}
            render={({ field }) => (
              <DogSelector
                dogs={dogs}
                value={field.value}
                onChange={field.onChange}
                disabled={!!activityId}
              />
            )}
          />
          {errors.dogId && (
            <p className="field-error">{errors.dogId.message}</p>
          )}
          {training && (
            <FormField
              label="Training type"
              as="select"
              options={[
                "recall",
                "heel work",
                "sit",
                "down",
                "stay",
                "place training",
                "agility",
                "socialisation",
                "crate training",
                "custom",
              ]}
              {...register("trainingType")}
            />
          )}
          <FormField
            label="Date and time"
            type="datetime-local"
            error={errors.date?.message}
            {...register("date")}
          />
          <FormField
            label="Duration (minutes)"
            type="number"
            inputMode="numeric"
            error={errors.duration?.message}
            {...register("duration")}
          />
          <FormField
            label="Location"
            error={errors.location?.message}
            {...register("location")}
          />
          {training ? (
            <>
              <FormField
                label="Skills practised"
                placeholder="Sit, stay, recall"
                error={errors.skills?.message}
                {...register("skills")}
              />
              <Controller
                name="focusRating"
                control={control}
                render={({ field }) => (
                  <RatingInput
                    label="Focus rating"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.focusRating?.message}
                  />
                )}
              />
              <FormField
                label="What went well"
                as="textarea"
                rows="3"
                {...register("wentWell")}
              />
              <FormField
                label="Problems encountered"
                as="textarea"
                rows="3"
                {...register("issues")}
              />
              <FormField
                label="Areas for improvement"
                as="textarea"
                rows="3"
                {...register("improvements")}
              />
            </>
          ) : (
            <>
              <FormField
                label="Distance in km (optional)"
                type="number"
                inputMode="decimal"
                step="0.1"
                error={errors.distance?.message}
                {...register("distance")}
              />
              <FormField label="Weather (optional)" {...register("weather")} />
              <FormField
                label="Behaviour observations"
                as="textarea"
                rows="3"
                {...register("behaviourNotes")}
              />
            </>
          )}
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                error={errors.rating?.message}
              />
            )}
          />
          <FormField
            label="Notes (optional)"
            as="textarea"
            rows="4"
            {...register("notes")}
          />
        </div>
        <Button type="submit" loading={isSubmitting}>
          Save {training ? "training" : "walk"}
        </Button>
        {activityId && (
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete entry
          </Button>
        )}
      </form>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this entry?"
        message="This action cannot be undone."
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
