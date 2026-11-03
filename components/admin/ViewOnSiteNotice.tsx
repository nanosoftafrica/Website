"use client";

// Success notice shown after a save on screens that change a public page.
// When the item is visible on the site it offers a "View on site" link that
// opens in a new tab; when it is hidden (not active / not published) it says
// so instead of linking to a page that would show "not found".
export interface SavedNotice {
  label: string;
  href?: string | null;
  hiddenReason?: string;
}

export default function ViewOnSiteNotice({ notice, onClose }: { notice: SavedNotice | null; onClose: () => void }) {
  if (!notice) return null;
  return (
    <div
      role="status"
      className="adm-saved-notice"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        margin: "0 0 16px",
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid var(--adm-success)",
        background: "rgba(22,163,74,0.08)",
        color: "var(--adm-text)",
        fontSize: 14,
      }}
    >
      <strong style={{ color: "var(--adm-success)" }}>Saved.</strong>
      <span>{notice.label}</span>
      {notice.href ? (
        <a
          href={notice.href}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-btn adm-btn-sm adm-btn-primary"
          data-testid="view-on-site"
        >
          View on site
        </a>
      ) : (
        notice.hiddenReason && <span style={{ color: "var(--adm-muted)" }}>{notice.hiddenReason}</span>
      )}
      <button type="button" className="adm-btn adm-btn-sm" onClick={onClose} style={{ marginLeft: "auto" }} aria-label="Close notice">
        Close
      </button>
    </div>
  );
}
