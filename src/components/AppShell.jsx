import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, BookOpen, Dog, Home, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/dogs", label: "Dogs", icon: Dog },
  { to: "/diary", label: "Diary", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }) {
  const links = tabs.map(({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
    >
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  ));
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <div className="brand">
          <img className="brand-mark" src="/doglog-logo.png" alt="" />
          DogLog
        </div>
        <nav className="sidebar-nav" aria-label="Primary">
          {links}
        </nav>
      </aside>
      <main className="app-main">{children ?? <Outlet />}</main>
      <nav className="mobile-nav" aria-label="Primary">
        {links}
      </nav>
    </div>
  );
}
