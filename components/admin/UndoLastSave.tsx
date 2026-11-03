"use client";

import { useEffect, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// "Undo last save": puts back the version from before the latest save of
// this item. Hidden until there is a save to undo.
export default function UndoLastSave({
  entity,
  id,
  onUndone,
  refreshKey,
}: {
  entity: string;
  id: number | string | null | undefined;
  onUndone: (item: any) => void;
  refreshKey?: unknown;
}) {
  const [info, setInfo] = useState<{ available: boolean; savedAt?: string; by?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let live = true;
    fetch(`/api/admin/undo?entity=${encodeURIComponent(entity)}&id=${encodeURIComponent(String(id))}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (live) setInfo(d); })
      .catch(() => {});
    return () => { live = false; };
  }, [entity, id, refreshKey]);

  if (!id || !info?.available) return null;

  async function undo() {
    if (!confirm("Go back to the version from before the last save? Your latest save will be replaced.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Undo failed");
        return;
      }
      setInfo({ available: data.available, savedAt: data.savedAt, by: data.by });
      onUndone(data.item);
    } catch {
      setError("Network error — please try again");
    } finally {
      setBusy(false);
    }
  }

  const when = info.savedAt ? new Date(info.savedAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "";
  return (
    <>
      <button
        type="button"
        className="adm-btn"
        onClick={undo}
        disabled={busy}
        data-testid="undo-last-save"
        title={when ? `Last saved over on ${when}${info.by ? ` by ${info.by}` : ""}` : undefined}
      >
        {busy ? "Undoing…" : "Undo last save"}
      </button>
      {error && <span className="adm-error" style={{ marginLeft: 8 }}>{error}</span>}
    </>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
