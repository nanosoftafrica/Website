/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AuditLogPanel({ items }: { items: any[] }) {
  return (
    <div>
      <h1 className="adm-h1">Audit Log</h1>
      <p className="adm-sub">Most recent 200 admin actions.</p>
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-table-empty">
                  No activity recorded yet.
                </td>
              </tr>
            )}
            {items.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>{a.adminUsername}</td>
                <td>{a.action}</td>
                <td>{a.entity}</td>
                <td>{a.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
