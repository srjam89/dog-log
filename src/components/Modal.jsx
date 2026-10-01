import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, title, onClose, children, actions }) {
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => event.key === "Escape" && onClose?.();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose?.()
      }
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="page-header">
          <h2>{title}</h2>
          <button
            className="button button--ghost icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>
        {children}
        {actions && <div className="cluster">{actions}</div>}
      </section>
    </div>
  );
}
