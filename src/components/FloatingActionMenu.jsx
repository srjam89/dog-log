import { useState } from "react";
import { Menu, Plus, X } from "lucide-react";
import { Button } from "./Button";

export function FloatingActionMenu({ actions = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fab-root">
      <div className="fab-menu">
        {open &&
          actions.map(({ label, icon: Icon = Plus, onClick }) => (
            <Button
              key={label}
              variant="secondary"
              onClick={() => {
                setOpen(false);
                onClick();
              }}
            >
              <Icon size={18} />
              {label}
            </Button>
          ))}
      </div>
      <Button
        className="fab-trigger"
        aria-label={open ? "Close actions" : "Open actions"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </Button>
    </div>
  );
}
