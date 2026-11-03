// Shared stage/status vocabularies for the ITIL Service Request + Incident
// entities. Centralized here so API routes, adminDb.ts, and the admin board
// components all read from one source instead of duplicating these arrays
// (WORK_ORDER_STAGES used to be hand-copied in two places — see the ITIL
// migration plan for why that anti-pattern was worth fixing here).

export const SERVICE_REQUEST_STAGES = [
  "new",
  "sourcing",
  "supplier_ordered",
  "delivered",
  "installation",
  "done",
  "cancelled",
] as const;
export type ServiceRequestStage = (typeof SERVICE_REQUEST_STAGES)[number];

export const INCIDENT_STATUSES = ["new", "in_progress", "on_hold", "resolved", "closed"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_SEVERITIES = ["critical", "high", "medium", "low"] as const;
export const INCIDENT_IMPACTS = ["high", "medium", "low"] as const;
export const INCIDENT_URGENCIES = ["high", "medium", "low"] as const;
export const INCIDENT_PRIORITIES = ["p1", "p2", "p3", "p4"] as const;

// Standard ITIL impact x urgency -> priority matrix. Priority is always
// server-derived from this — never set directly by the client.
const PRIORITY_MATRIX: Record<string, Record<string, string>> = {
  high: { high: "p1", medium: "p2", low: "p3" },
  medium: { high: "p2", medium: "p3", low: "p4" },
  low: { high: "p3", medium: "p4", low: "p4" },
};

export function derivePriority(impact: string, urgency: string): string {
  return PRIORITY_MATRIX[impact]?.[urgency] || "p3";
}
