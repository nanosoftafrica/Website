"use client";

import { useState } from "react";
import Link from "next/link";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import ShinyText from "@/components/reactbits/ShinyText";
import QuickActionsDock, { type DockAction } from "@/components/reactbits/QuickActionsDock";
import type { EnrichedDashboardData } from "@/lib/adminDb";
import { waNumber } from "@/lib/whatsapp";

interface DashboardClientProps {
  initialData: EnrichedDashboardData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [data] = useState<EnrichedDashboardData>(initialData);

  const dockActions: DockAction[] = [
    { id: "deals", label: "Opportunities", icon: "🎯", href: "/admin/deals" },
    { id: "incidents", label: "ITIL Incidents", icon: "🚨", href: "/admin/incidents", badge: data.openIncidents > 0 ? data.openIncidents : undefined },
    { id: "service", label: "Service Requests", icon: "📋", href: "/admin/service-requests" },
    { id: "contacts", label: "Contacts", icon: "👤", href: "/admin/contacts" },
    { id: "insights", label: "Analytics", icon: "📊", href: "/admin/insights" },
  ];

  // Deal funnel percentages
  const totalDeals = data.deals || 1;
  const stageNewPct = Math.round(((data.dealStages.new || 0) / totalDeals) * 100);
  const stageContactedPct = Math.round(((data.dealStages.contacted || 0) / totalDeals) * 100);
  const stageQualifiedPct = Math.round(((data.dealStages.qualified || 0) / totalDeals) * 100);
  const stageWonPct = Math.round(((data.dealStages.won || 0) / totalDeals) * 100);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* ── Top Hero Telemetry Banner ── */}
      <div className="adm-bento-hero" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "#61dafb", fontWeight: 700 }}>
              Operational Command Center • Dashboard
            </span>
            <span style={{ fontSize: 12, opacity: 0.5 }}>•</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Nairobi, Kenya</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            Welcome back to <ShinyText speed={4}>Nanosoft Admin</ShinyText>
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1", maxWidth: 620 }}>
            Unified CRM pipeline, ITIL service fulfillment, and team activity.
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Core Metrics with React Bits Spotlight Cards ── */}
      <div className="adm-bento-grid">
        {/* Card 1: Sales Pipeline (KES) */}
        <SpotlightCard className="adm-bento-card-highlight" spotlightColor="rgba(0, 150, 214, 0.18)" borderColor="rgba(0, 150, 214, 0.5)">
          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--adm-muted)" }}>
                Sales Pipeline
              </span>
              <Link href="/admin/deals" style={{ fontSize: 12, color: "var(--adm-primary)", textDecoration: "none", fontWeight: 600 }}>
                View Board →
              </Link>
            </div>

            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--adm-primary)", lineHeight: 1.1, marginBottom: 4 }}>
              <CountUp to={data.openDealsValue} prefix="KES " duration={1.2} />
            </div>
            <div style={{ fontSize: 12, color: "var(--adm-muted)", marginBottom: 14 }}>
              Open Pipeline ({data.deals} total deals · KES <CountUp to={data.wonDealsValue} duration={1} /> won)
            </div>

            {/* Stage Progress Bar */}
            <div className="adm-funnel-bar">
              <div className="adm-funnel-segment" style={{ width: `${stageNewPct}%`, background: "#3b82f6" }} title={`New: ${data.dealStages.new || 0}`} />
              <div className="adm-funnel-segment" style={{ width: `${stageContactedPct}%`, background: "#8b5cf6" }} title={`Contacted: ${data.dealStages.contacted || 0}`} />
              <div className="adm-funnel-segment" style={{ width: `${stageQualifiedPct}%`, background: "#ec4899" }} title={`Qualified: ${data.dealStages.qualified || 0}`} />
              <div className="adm-funnel-segment" style={{ width: `${stageWonPct}%`, background: "#10b981" }} title={`Won: ${data.dealStages.won || 0}`} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--adm-muted)" }}>
              <span>New: {data.dealStages.new || 0}</span>
              <span>Contacted: {data.dealStages.contacted || 0}</span>
              <span>Qualified: {data.dealStages.qualified || 0}</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>Won: {data.dealStages.won || 0}</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2: ITIL Incidents Triage */}
        <SpotlightCard className="adm-bento-card-medium" spotlightColor="rgba(239, 68, 68, 0.15)" borderColor="rgba(239, 68, 68, 0.4)">
          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--adm-muted)" }}>
                ITIL Incident Triage
              </span>
              <Link href="/admin/incidents" style={{ fontSize: 12, color: "#ef4444", textDecoration: "none", fontWeight: 600 }}>
                Incident Radar →
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: data.openIncidents > 0 ? "#ef4444" : "#10b981", lineHeight: 1.1 }}>
                <CountUp to={data.openIncidents} duration={0.8} />
              </div>
              <span style={{ fontSize: 13, color: "var(--adm-muted)", fontWeight: 600 }}>active open disruptions</span>
            </div>

            <div style={{ fontSize: 12, color: "var(--adm-muted)", marginBottom: 14 }}>
              Derived Priority Matrix triage
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#dc2626", fontWeight: 700 }}>P1 CRITICAL</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#b91c1c" }}>{data.incidentPriorities.p1 || 0}</div>
              </div>
              <div style={{ flex: 1, background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#c2410c", fontWeight: 700 }}>P2 HIGH</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#ea580c" }}>{data.incidentPriorities.p2 || 0}</div>
              </div>
              <div style={{ flex: 1, background: "#eff6ff", border: "1px solid #dbeafe", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#1d4ed8", fontWeight: 700 }}>P3/P4 MED</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#2563eb" }}>
                  {(data.incidentPriorities.p3 || 0) + (data.incidentPriorities.p4 || 0)}
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>

      </div>

      {/* ── Secondary 3-Card Row: Fulfillment & Resources ── */}
      <div className="adm-bento-grid" style={{ marginBottom: 24 }}>
        {/* Service Requests */}
        <SpotlightCard className="adm-bento-card-compact">
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--adm-muted)" }}>
              Service Requests
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--adm-text)", margin: "4px 0" }}>
              <CountUp to={data.serviceRequests} duration={0.8} />
            </div>
            <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>
              Procurement & fulfillment pipeline
            </div>
            <div style={{ marginTop: 10 }}>
              <Link href="/admin/service-requests" style={{ fontSize: 12, color: "var(--adm-primary)", fontWeight: 600, textDecoration: "none" }}>
                Manage Fulfillment →
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* CRM Customers */}
        <SpotlightCard className="adm-bento-card-compact">
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--adm-muted)" }}>
              Client Accounts
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--adm-text)", margin: "4px 0" }}>
              <CountUp to={data.companies} duration={0.8} /> <span style={{ fontSize: 14, fontWeight: 500, color: "var(--adm-muted)" }}>cos.</span> · <CountUp to={data.contacts} duration={0.8} /> <span style={{ fontSize: 14, fontWeight: 500, color: "var(--adm-muted)" }}>contacts</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>
              Enterprise customer accounts in Kenya
            </div>
            <div style={{ marginTop: 10 }}>
              <Link href="/admin/companies" style={{ fontSize: 12, color: "var(--adm-primary)", fontWeight: 600, textDecoration: "none" }}>
                Directory →
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Resources: Techs & Suppliers */}
        <SpotlightCard className="adm-bento-card-compact">
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--adm-muted)" }}>
              Service Force
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--adm-text)", margin: "4px 0" }}>
              <CountUp to={data.technicians} duration={0.8} /> <span style={{ fontSize: 14, fontWeight: 500, color: "var(--adm-muted)" }}>techs</span> · <CountUp to={data.suppliers} duration={0.8} /> <span style={{ fontSize: 14, fontWeight: 500, color: "var(--adm-muted)" }}>suppliers</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>
              Internal engineers and parts vendors
            </div>
            <div style={{ marginTop: 10 }}>
              <Link href="/admin/technicians" style={{ fontSize: 12, color: "var(--adm-primary)", fontWeight: 600, textDecoration: "none" }}>
                Field Force →
              </Link>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* ── Dual Column: Operational Triage & Real-Time Feed ── */}
      <div className="adm-bento-dual">
        {/* Left Column: Urgent Operational Attention */}
        <div className="adm-panel">
          <div className="adm-panel-header">
            <div>
              <h2>🚨 Urgent Action Items</h2>
              <span style={{ fontSize: 12, color: "var(--adm-muted)" }}>High-priority incidents & high-value deals requiring attention</span>
            </div>
            <Link href="/admin/incidents" className="adm-btn adm-btn-sm">
              View All
            </Link>
          </div>

          <div style={{ padding: "14px 20px" }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--adm-muted)", margin: "0 0 10px" }}>
              Top Priority Disruptions ({data.topIncidents.length})
            </h3>
            {data.topIncidents.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {data.topIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#fafbfc",
                      border: "1px solid var(--adm-border)",
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: inc.priority === "p1" ? "#fee2e2" : "#ffedd5",
                            color: inc.priority === "p1" ? "#b91c1c" : "#c2410c",
                          }}
                        >
                          {inc.priority.toUpperCase()}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{inc.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--adm-muted)", marginTop: 2 }}>
                        Status: <span style={{ fontWeight: 500 }}>{inc.status}</span> · Severity: {inc.severity}
                      </div>
                    </div>
                    <Link href="/admin/incidents" className="adm-btn adm-btn-sm" style={{ padding: "4px 8px" }}>
                      Triage
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#10b981", margin: "0 0 20px" }}>
                ✓ No active disruptions! All systems operational.
              </p>
            )}

            <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--adm-muted)", margin: "0 0 10px" }}>
              Highest Value Open Opportunities
            </h3>
            {data.topDeals.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.topDeals.map((deal) => (
                  <div
                    key={deal.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#fafbfc",
                      border: "1px solid var(--adm-border)",
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{deal.title}</div>
                      <div style={{ fontSize: 11, color: "var(--adm-muted)", marginTop: 2 }}>
                        Stage: <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{deal.stage}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "var(--adm-primary)", fontSize: 13 }}>
                        KES {Number(deal.value || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--adm-muted)" }}>No open deals currently.</p>
            )}
          </div>
        </div>

        {/* Right Column: Inbound Inquiries & Live Audit Trail */}
        <div className="adm-panel">
          <div className="adm-panel-header">
            <div>
              <h2>📥 Inbound Inquiries & Activity</h2>
              <span style={{ fontSize: 12, color: "var(--adm-muted)" }}>Latest website submissions with quick contact links</span>
            </div>
            <Link href="/admin/messages" className="adm-btn adm-btn-sm">
              All Inquiries
            </Link>
          </div>

          <div style={{ padding: "14px 20px" }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--adm-muted)", margin: "0 0 10px" }}>
              Recent Website Messages ({data.recentMessages.length})
            </h3>
            {data.recentMessages.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {data.recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: "10px 14px",
                      background: msg.read ? "#fafbfc" : "#f0f9ff",
                      border: msg.read ? "1px solid var(--adm-border)" : "1px solid #bae6fd",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{msg.name}</span>
                        {msg.company && <span style={{ fontSize: 12, color: "var(--adm-muted)" }}> ({msg.company})</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--adm-muted)" }}>
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#334155", margin: "4px 0 8px", lineHeight: 1.3 }}>
                      {msg.message ? (msg.message.length > 80 ? msg.message.substring(0, 80) + "..." : msg.message) : "Demo request"}
                    </p>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {msg.phone && (
                        <a
                          href={`https://wa.me/${waNumber(msg.phone)}?text=${encodeURIComponent(`Hello ${msg.name}, thank you for contacting Nanosoft Technologies regarding ${msg.interest || "our solutions"}. How can we assist you today?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="adm-btn adm-btn-sm"
                          style={{ borderColor: "#10b981", color: "#047857", padding: "2px 8px", fontSize: 11 }}
                        >
                          💬 WhatsApp {msg.phone}
                        </a>
                      )}
                      <span style={{ fontSize: 11, color: "var(--adm-muted)" }}>Interest: {msg.interest || "General"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--adm-muted)", margin: "0 0 20px" }}>No new messages received.</p>
            )}

            <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--adm-muted)", margin: "0 0 10px" }}>
              Recent Audit Log Changes
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.recentAuditLogs.map((log) => (
                <div key={log.id} style={{ fontSize: 12, display: "flex", justifyContent: "space-between", color: "var(--adm-text)" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--adm-primary)" }}>@{log.adminUsername}</span>{" "}
                    <span>{log.summary}</span>
                  </div>
                  <span style={{ color: "var(--adm-muted)", fontSize: 11, whiteSpace: "nowrap", marginLeft: 10 }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed/Floating Quick Actions Dock (React Bits) ── */}
      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
        <QuickActionsDock actions={dockActions} />
      </div>

    </div>
  );
}
