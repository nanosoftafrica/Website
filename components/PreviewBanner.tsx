// Shown at the top of an admin preview so nobody mistakes it for the live page.
export default function PreviewBanner({ status, hasDraft, editHref }: { status: string; hasDraft: boolean; editHref: string }) {
  const text =
    status !== "published"
      ? "Preview: this is a draft and visitors can't see it yet."
      : hasDraft
        ? "Preview: these are unpublished draft changes. Visitors still see the published version."
        : "Preview: this is the published version, as visitors see it.";
  return (
    <div
      data-testid="preview-banner"
      role="status"
      style={{
        position: "sticky", top: 0, zIndex: 1000, background: "#FEF3C7", color: "#78350F",
        borderBottom: "1px solid #F59E0B", padding: "10px 16px", fontSize: 14, textAlign: "center",
      }}
    >
      {text}{" "}
      <a href={editHref} style={{ color: "#78350F", fontWeight: 600, textDecoration: "underline" }}>Back to editing</a>
    </div>
  );
}
