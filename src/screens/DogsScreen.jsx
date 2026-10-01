import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { dogService } from "../services";
import { useAppStore } from "../store";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingScreen,
  PageHeader,
} from "../components";

export default function DogsScreen() {
  const navigate = useNavigate();
  const { activeDogId, setActiveDog } = useAppStore();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      setDogs(await dogService.listDogs());
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const remove = async () => {
    setBusy(true);
    try {
      await dogService.deleteDog(deleting.id);
      const next = dogs.filter((dog) => dog.id !== deleting.id);
      setDogs(next);
      if (deleting.id === activeDogId) setActiveDog(next[0] || null);
      setDeleting(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <LoadingScreen label="Loading your pack…" />;
  if (error && !dogs.length)
    return <ErrorState message={error} onRetry={load} />;
  return (
    <div className="page stack">
      <PageHeader
        title="Your dogs"
        description="Manage profiles and choose the dog you’re journaling for."
        actions={
          <Button onClick={() => navigate("/dogs/new")}>
            <Plus size={18} /> Add dog
          </Button>
        }
      />
      {error && <p className="alert">{error}</p>}
      {!dogs.length ? (
        <EmptyState
          title="Your pack starts here"
          description="Add a dog profile to begin journaling."
          actionLabel="Add dog"
          onAction={() => navigate("/dogs/new")}
        />
      ) : (
        <section className="grid grid--two">
          {dogs.map((dog) => (
            <article className="dog-card card" key={dog.id}>
              {dog.photoUrl ? (
                <img className="avatar" src={dog.photoUrl} alt="" />
              ) : (
                <span className="avatar">{dog.name[0]}</span>
              )}
              <div className="stack">
                <div>
                  <h2>{dog.name}</h2>
                  <p className="muted">
                    {[dog.breed, dog.birthDate].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <div className="cluster">
                  {String(dog.id) === String(activeDogId) ? (
                    <strong>Active dog</strong>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setActiveDog(dog)}
                    >
                      Make active
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/dogs/${dog.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Edit ${dog.name}`}
                    onClick={() =>
                      navigate(`/dogs/${dog.id}/edit`, { state: { dog } })
                    }
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Delete ${dog.name}`}
                    onClick={() => setDeleting(dog)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${deleting?.name}?`}
        message="This permanently removes the dog and their journal history."
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
