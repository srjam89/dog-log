import { useId } from "react";

export function FormField({
  label,
  error,
  as: Element = "input",
  id: givenId,
  options,
  ...props
}) {
  const generatedId = useId();
  const id = givenId || generatedId;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {Element === "select" ? (
        <select id={id} aria-invalid={!!error} {...props}>
          {options?.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      ) : (
        <Element
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
