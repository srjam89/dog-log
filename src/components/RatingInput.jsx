import { Star } from "lucide-react";

export function RatingInput({ label = "Rating", value = 0, onChange, error }) {
  return (
    <fieldset className="field">
      <legend className="field-label">{label}</legend>
      <div className="rating" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const selected = rating <= value;
          return (
            <button
              type="button"
              key={rating}
              className={selected ? "selected" : ""}
              onClick={() => onChange(rating)}
              aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
              aria-pressed={selected}
            >
              <Star
                size={28}
                fill={selected ? "currentColor" : "none"}
                strokeWidth={selected ? 0 : 2}
              />
            </button>
          );
        })}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}
