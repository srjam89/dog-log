import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <section className="error-state" role="alert">
      <AlertCircle size={40} />
      <h2>Unable to load</h2>
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </section>
  );
}
