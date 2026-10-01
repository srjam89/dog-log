import { Dog } from "lucide-react";

export function DogSelector({ dogs = [], value, onChange, disabled }) {
  return (
    <label className="dog-selector">
      <Dog size={20} />
      <span className="sr-only">Active dog</span>
      <select
        className="select"
        value={value || ""}
        onChange={(event) =>
          onChange?.(
            event.target.value,
            dogs.find((dog) => String(dog.id) === event.target.value),
          )
        }
        disabled={disabled}
      >
        <option value="">Choose a dog</option>
        {dogs.map((dog) => (
          <option key={dog.id} value={dog.id}>
            {dog.name}
          </option>
        ))}
      </select>
    </label>
  );
}
