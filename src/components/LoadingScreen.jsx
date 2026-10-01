export function LoadingScreen({ label = "Loading…", fullPage = false }) {
  return (
    <div
      className={`loading-state${fullPage ? " full-page" : ""}`}
      role="status"
    >
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}
