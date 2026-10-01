import { ChevronLeft } from "lucide-react";
import { Button } from "./Button";

export function PageHeader({ title, description, back, actions }) {
  return (
    <header className="page-header">
      <div>
        {back && (
          <Button variant="ghost" onClick={back} aria-label="Go back">
            <ChevronLeft size={20} /> Back
          </Button>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="cluster">{actions}</div>}
    </header>
  );
}
