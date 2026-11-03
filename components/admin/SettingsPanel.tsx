"use client";

import { useEffect, useState, type FormEvent } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk(false);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password");
        return;
      }
      setOk(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="adm-panel" style={{ padding: 20, marginBottom: 20, maxWidth: 420 }}>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Change password</h2>
      {error && <p className="adm-error">{error}</p>}
      {ok && <p style={{ color: "var(--adm-success)", fontSize: 13 }}>Password updated.</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="adm-field">
          <label>Current password</label>
          <input type="password" value={currentPassword} required onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="adm-field">
          <label>New password (min 8 characters)</label>
          <input type="password" value={newPassword} required onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
          {saving ? "Saving…" : "Update password"}
        </button>
      </form>
    </section>
  );
}

function AdminUsers({ initialUsers, currentUserId }: { initialUsers: any[]; currentUserId: number }) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditing(null);
    setUsername("");
    setPassword("");
    setRole("editor");
    setError("");
    setModalOpen(true);
  }
  function openEdit(u: any) {
    setEditing(u);
    setUsername(u.username);
    setPassword("");
    setRole(u.role);
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const url = editing ? `/api/admin/users/${editing.id}` : "/api/admin/users";
    const method = editing ? "PUT" : "POST";
    const payload: any = { username, role };
    if (password) payload.password = password;
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }
      setUsers((prev) => (editing ? prev.map((u) => (u.id === editing.id ? { ...u, ...data } : u)) : [...prev, data]));
      setSaving(false);
      setModalOpen(false);
    } catch {
      setError("Network error — please try again");
      setSaving(false);
    }
  }

  async function handleDelete(u: any) {
    if (!confirm(`Delete admin user "${u.username}"?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((it) => it.id !== u.id));
  }

  return (
    <section className="adm-panel" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>Admin users</h2>
        <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={openAdd}>
          + Add user
        </button>
      </div>
      <table className="adm-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.role === "editor" ? "Marketing" : u.role === "super_admin" ? "Super admin" : u.role}</td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <button className="adm-btn adm-btn-sm" onClick={() => openEdit(u)}>
                  Edit
                </button>{" "}
                {u.id !== currentUserId && (
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(u)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{editing ? "Edit user" : "Add user"}</h3>
              <button type="button" className="adm-btn adm-btn-sm" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {error && <p className="adm-error">{error}</p>}
                <div className="adm-field">
                  <label>Username</label>
                  <input value={username} required onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="adm-field">
                  <label>{editing ? "New password (leave blank to keep current)" : "Password"}</label>
                  <input type="password" value={password} required={!editing} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="adm-field">
                  <label>Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="editor">Marketing (website only)</option>
                    <option value="super_admin">Super admin (everything)</option>
                  </select>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

function fmtSize(bytes: number) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Backups() {
  const [info, setInfo] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/backups")
      .then((r) => r.json().then((d) => (r.ok ? setInfo(d) : setError(d.error || "Couldn't load backups"))))
      .catch(() => setError("Couldn't load backups"));
  }, []);

  async function backUpNow() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/backups", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "The backup didn't finish");
        return;
      }
      setInfo(data);
      setNotice("Backup saved.");
    } catch {
      setError("Network error — please try again");
    } finally {
      setBusy(false);
    }
  }

  const last = info?.last;
  return (
    <section className="adm-panel" data-testid="backups-panel" style={{ padding: 20, marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Backups</h2>
      <p style={{ fontSize: 13, marginTop: 0 }}>
        Each backup saves the database, every uploaded image and the image descriptions.
        {info && (info.nightlyOn
          ? ` A nightly backup runs at ${String(info.nightlyHour).padStart(2, "0")}:00 (server time), and the last ${info.keep} backups are kept.`
          : ` The nightly backup runs only on the live (production) copy; the last ${info.keep} backups are kept.`)}
      </p>
      {error && <p className="adm-error">{error}</p>}
      {notice && <p style={{ color: "var(--adm-success)", fontSize: 13 }}>{notice}</p>}
      <p style={{ fontSize: 13 }} data-testid="last-backup">
        {!info ? "Loading…" : last
          ? <>Last backup: <b>{fmtWhen(last.createdAt)}</b> ({last.reason === "nightly" ? "nightly" : `by ${last.by || "admin"}`}), database {fmtSize(last.database.bytes)}, {last.uploads.files} image{last.uploads.files === 1 ? "" : "s"}.</>
          : "No backups yet."}
      </p>
      <button type="button" className="adm-btn adm-btn-primary" onClick={backUpNow} disabled={busy}>
        {busy ? "Backing up… (this can take a minute)" : "Back up now"}
      </button>
    </section>
  );
}

export default function SettingsPanel({
  isSuperAdmin,
  users,
  currentUserId,
}: {
  isSuperAdmin: boolean;
  users: any[];
  currentUserId: number;
}) {
  return (
    <div>
      <h1 className="adm-h1">Settings</h1>
      <ChangePassword />
      {isSuperAdmin && <Backups />}
      {isSuperAdmin && <AdminUsers initialUsers={users} currentUserId={currentUserId} />}
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
