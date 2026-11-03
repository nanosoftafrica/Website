import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import Sidebar from "@/components/admin/Sidebar";
import { hasFullAccess, roleLabel } from "@/lib/adminRoles";
import "../admin.css";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  // proxy.ts already redirects unauthenticated requests before they reach
  // here — this is the secure re-check (per Next.js auth guidance: proxy
  // is optimistic-only, real checks belong close to the data/rendering).
  if (!session) redirect("/admin/login");

  return (
    <div className="adm-shell">
      <Sidebar username={session.username} fullAccess={hasFullAccess(session.role)} />
      <div className="adm-main">
        <div className="adm-topbar">
          <div className="adm-topbar-context">
            <span>Workspace</span>
            <span className="adm-topbar-separator">/</span>
            <strong>Administration</strong>
          </div>
          <div className="adm-topbar-user">
            <span className="adm-topbar-avatar">{session.username.slice(0, 1).toUpperCase()}</span>
            <span className="adm-topbar-user-copy">
              <strong>{session.username}</strong>
              <small>{roleLabel(session.role)}</small>
            </span>
          </div>
        </div>
        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
}
