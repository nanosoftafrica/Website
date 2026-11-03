// One plain sentence at the top of an admin screen that says what the screen
// changes on the public website. Kept as a tiny shared component so every
// screen uses the same look.
export default function ScreenHelp({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="adm-screen-help"
      role="note"
      style={{
        margin: "0 0 18px",
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid var(--adm-border)",
        borderLeft: "4px solid var(--adm-primary)",
        background: "var(--adm-panel)",
        color: "var(--adm-text)",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}
