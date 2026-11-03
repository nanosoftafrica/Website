"use client";

import { useState, useMemo, type FormEvent } from "react";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DevicesManagerProps {
  initialDevices: any[];
  companies: any[];
  technicians: any[];
  contacts: any[];
}

const DEVICE_TYPES = [
  "Biometric & Access Control",
  "Server & Networking",
  "CCTV & Security",
  "Power & UPS Backup",
  "Point of Sale / ERP Terminal",
  "Time & Attendance",
  "Software Appliance",
  "Other Hardware",
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#166534", bg: "#dcfce7" },
  needs_maintenance: { label: "Needs Maintenance", color: "#b45309", bg: "#fef3c7" },
  under_repair: { label: "Under Repair", color: "#991b1b", bg: "#fee2e2" },
  decommissioned: { label: "Decommissioned", color: "#475569", bg: "#f1f5f9" },
  spare: { label: "Spare / In Stock", color: "#1e40af", bg: "#dbeafe" },
};

export default function DevicesManager({
  initialDevices,
  companies,
  technicians,
  contacts,
}: DevicesManagerProps) {
  const [devices, setDevices] = useState<any[]>(initialDevices);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "due">("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // New device form state
  const [deviceForm, setDeviceForm] = useState({
    companyId: companies[0]?.id || "",
    contactId: "",
    deviceName: "",
    deviceType: DEVICE_TYPES[0],
    brand: "",
    modelNumber: "",
    serialNumber: "",
    assetTag: "",
    locationOnPremise: "",
    installationDate: new Date().toISOString().split("T")[0],
    installedByTechnicianId: technicians[0]?.id || "",
    warrantyExpiresAt: "",
    maintenanceIntervalMonths: 6,
    status: "active",
    ipAddress: "",
    macAddress: "",
    notes: "",
  });

  // Maintenance visit form state
  const [logForm, setLogForm] = useState({
    performedAt: new Date().toISOString().split("T")[0],
    technicianId: technicians[0]?.id || "",
    maintenanceType: "routine_preventive",
    summary: "",
    details: "",
    partsReplaced: "",
    deviceStatusAfter: "operational",
    nextRecommendedMaintenance: "",
    cost: "0",
    notes: "",
  });

  // Helpers to calculate maintenance urgency
  function getMaintenanceStatus(nextDateStr: string | null) {
    if (!nextDateStr) return { status: "none", label: "Not Scheduled", badgeColor: "#64748b", days: 999 };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(nextDateStr + "T00:00:00");
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "overdue", label: `Overdue by ${Math.abs(diffDays)}d`, badgeColor: "#d92d20", days: diffDays };
    }
    if (diffDays <= 14) {
      return { status: "due_soon", label: `Due in ${diffDays}d`, badgeColor: "#e67e22", days: diffDays };
    }
    return { status: "healthy", label: `In ${diffDays}d (${nextDateStr})`, badgeColor: "#16a34a", days: diffDays };
  }

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (selectedCompanyId && String(d.companyId) !== String(selectedCompanyId)) return false;
      if (selectedStatus && d.status !== selectedStatus) return false;
      if (selectedType && d.deviceType !== selectedType) return false;
      if (activeTab === "due") {
        const maint = getMaintenanceStatus(d.nextMaintenanceDate);
        if (maint.status !== "overdue" && maint.status !== "due_soon") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (d.deviceName || "").toLowerCase().includes(q);
        const matchSerial = (d.serialNumber || "").toLowerCase().includes(q);
        const matchTag = (d.assetTag || "").toLowerCase().includes(q);
        const matchLoc = (d.locationOnPremise || "").toLowerCase().includes(q);
        const matchCompany = (d.companyName || "").toLowerCase().includes(q);
        if (!matchName && !matchSerial && !matchTag && !matchLoc && !matchCompany) return false;
      }
      return true;
    });
  }, [devices, selectedCompanyId, selectedStatus, selectedType, activeTab, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    let overdueCount = 0;
    let dueSoonCount = 0;
    let activeCount = 0;

    devices.forEach((d) => {
      if (d.status === "active") activeCount++;
      const m = getMaintenanceStatus(d.nextMaintenanceDate);
      if (m.status === "overdue") overdueCount++;
      else if (m.status === "due_soon") dueSoonCount++;
    });

    return {
      total: devices.length,
      active: activeCount,
      overdue: overdueCount,
      dueSoon: dueSoonCount,
    };
  }, [devices]);

  async function handleCreateDevice(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const payload: Record<string, any> = {
      ...deviceForm,
      companyId: Number(deviceForm.companyId),
      contactId: deviceForm.contactId ? Number(deviceForm.contactId) : null,
      installedByTechnicianId: deviceForm.installedByTechnicianId ? Number(deviceForm.installedByTechnicianId) : null,
      maintenanceIntervalMonths: Number(deviceForm.maintenanceIntervalMonths) || 6,
      specifications: {
        ipAddress: deviceForm.ipAddress,
        macAddress: deviceForm.macAddress,
      },
    };

    try {
      const res = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create device");
        return;
      }

      // Enrich with company & technician names for client table
      const comp = companies.find((c) => c.id === data.companyId);
      const tech = technicians.find((t) => t.id === data.installedByTechnicianId);
      const enriched = {
        ...data,
        companyName: comp ? comp.name : "Client",
        installedByTechnicianName: tech ? tech.name : null,
      };

      setDevices((prev) => [enriched, ...prev]);
      setShowAddModal(false);
    } catch {
      setErrorMsg("Network error creating device");
    } finally {
      setSubmitting(false);
    }
  }

  async function openDeviceDetail(device: any) {
    setLoadingDetail(true);
    setSelectedDevice(device);
    try {
      const res = await fetch(`/api/admin/devices/${device.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedDevice(full);
      }
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleLogMaintenance(e: FormEvent) {
    e.preventDefault();
    if (!selectedDevice) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/devices/${selectedDevice.id}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...logForm,
          technicianId: logForm.technicianId ? Number(logForm.technicianId) : null,
          cost: parseFloat(logForm.cost) || 0,
        }),
      });
      const newLog = await res.json();
      if (!res.ok) {
        setErrorMsg(newLog.error || "Failed to log maintenance");
        return;
      }

      // Refresh device detail
      await openDeviceDetail(selectedDevice);

      // Also update in devices state
      const tech = technicians.find((t) => t.id === Number(logForm.technicianId));
      setDevices((prev) =>
        prev.map((d) =>
          d.id === selectedDevice.id
            ? {
                ...d,
                lastMaintenanceDate: logForm.performedAt,
                nextMaintenanceDate: newLog.nextRecommendedMaintenance || d.nextMaintenanceDate,
                status:
                  logForm.deviceStatusAfter === "operational"
                    ? "active"
                    : logForm.deviceStatusAfter === "degraded"
                    ? "needs_maintenance"
                    : d.status,
              }
            : d
        )
      );

      setShowLogModal(false);
      setLogForm({
        performedAt: new Date().toISOString().split("T")[0],
        technicianId: technicians[0]?.id || "",
        maintenanceType: "routine_preventive",
        summary: "",
        details: "",
        partsReplaced: "",
        deviceStatusAfter: "operational",
        nextRecommendedMaintenance: "",
        cost: "0",
        notes: "",
      });
    } catch {
      setErrorMsg("Network error saving maintenance log");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteDevice(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}" and all its maintenance history?`)) return;
    try {
      const res = await fetch(`/api/admin/devices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDevices((prev) => prev.filter((d) => d.id !== id));
        if (selectedDevice?.id === id) setSelectedDevice(null);
      }
    } catch {
      alert("Failed to delete device");
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 className="adm-h1" style={{ marginBottom: 4 }}>
            Client Devices & Maintenance
          </h1>
          <p className="adm-sub">
            Track hardware installed on client premises, scheduled preventative maintenance, and service activity logs.
          </p>
        </div>
        <button
          className="adm-btn adm-btn-primary"
          onClick={() => {
            setErrorMsg("");
            setShowAddModal(true);
          }}
          style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
        >
          <span>➕</span> Register Installed Device
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="adm-stat-grid" style={{ marginBottom: 24 }}>
        <div className="adm-stat-card">
          <div className="adm-stat-value">{stats.total}</div>
          <div className="adm-stat-label">Total Installed Devices</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-value" style={{ color: "#16a34a" }}>
            {stats.active}
          </div>
          <div className="adm-stat-label">Active & Healthy</div>
        </div>
        <div className="adm-stat-card" style={{ borderColor: stats.dueSoon > 0 ? "#f59e0b" : undefined }}>
          <div className="adm-stat-value" style={{ color: "#d97706" }}>
            {stats.dueSoon}
          </div>
          <div className="adm-stat-label">Maintenance Due (Next 14 Days)</div>
        </div>
        <div className="adm-stat-card" style={{ borderColor: stats.overdue > 0 ? "#ef4444" : undefined }}>
          <div className="adm-stat-value" style={{ color: "#dc2626" }}>
            {stats.overdue}
          </div>
          <div className="adm-stat-label">Overdue Servicing</div>
        </div>
      </div>

      {/* Urgent Alert Banner if overdue or due soon */}
      {(stats.overdue > 0 || stats.dueSoon > 0) && (
        <div
          style={{
            background: stats.overdue > 0 ? "#fef2f2" : "#fffbeb",
            border: `1px solid ${stats.overdue > 0 ? "#fecaca" : "#fef3c7"}`,
            borderRadius: 10,
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: stats.overdue > 0 ? "#991b1b" : "#92400e",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span>
              <strong>Attention Required:</strong> You have{" "}
              {stats.overdue > 0 && <span style={{ fontWeight: 700 }}>{stats.overdue} overdue device(s)</span>}
              {stats.overdue > 0 && stats.dueSoon > 0 && " and "}
              {stats.dueSoon > 0 && <span style={{ fontWeight: 700 }}>{stats.dueSoon} device(s) due for servicing soon</span>}.
            </span>
          </div>
          <button
            className="adm-btn adm-btn-sm"
            style={{
              borderColor: stats.overdue > 0 ? "#dc2626" : "#d97706",
              color: stats.overdue > 0 ? "#dc2626" : "#d97706",
              fontWeight: 600,
            }}
            onClick={() => setActiveTab("due")}
          >
            Filter Due Items
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="adm-panel" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Tab buttons */}
          <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
            <button
              className="adm-btn adm-btn-sm"
              style={{
                background: activeTab === "all" ? "#fff" : "transparent",
                fontWeight: activeTab === "all" ? 700 : 500,
                boxShadow: activeTab === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
              onClick={() => setActiveTab("all")}
            >
              All Devices ({devices.length})
            </button>
            <button
              className="adm-btn adm-btn-sm"
              style={{
                background: activeTab === "due" ? "#fff" : "transparent",
                fontWeight: activeTab === "due" ? 700 : 500,
                color: activeTab === "due" ? "#b45309" : undefined,
                boxShadow: activeTab === "due" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
              onClick={() => setActiveTab("due")}
            >
              ⚠️ Maintenance Due ({stats.overdue + stats.dueSoon})
            </button>
          </div>

          {/* Company Filter */}
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--adm-border)", fontSize: 13 }}
          >
            <option value="">All Client Companies ({companies.length})</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--adm-border)", fontSize: 13 }}
          >
            <option value="">All Categories</option>
            {DEVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--adm-border)", fontSize: 13 }}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Search by device, serial #, asset tag, premise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--adm-border)",
                fontSize: 13,
              }}
            />
          </div>

          {(selectedCompanyId || selectedStatus || selectedType || searchQuery || activeTab !== "all") && (
            <button
              className="adm-btn adm-btn-sm"
              onClick={() => {
                setSelectedCompanyId("");
                setSelectedStatus("");
                setSelectedType("");
                setSearchQuery("");
                setActiveTab("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Devices Table */}
      <div className="adm-panel">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Device & Model</th>
              <th>Client Company & Location</th>
              <th>Serial / Asset Tag</th>
              <th>Status</th>
              <th>Next Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={6} className="adm-table-empty">
                  No devices match your selected criteria.
                </td>
              </tr>
            ) : (
              filteredDevices.map((d) => {
                const maint = getMaintenanceStatus(d.nextMaintenanceDate);
                const statusMeta = STATUS_CONFIG[d.status] || STATUS_CONFIG.active;
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--adm-text)" }}>{d.deviceName}</div>
                      <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>
                        {d.brand} {d.modelNumber && `· ${d.modelNumber}`} · <span style={{ opacity: 0.85 }}>{d.deviceType}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.companyName}</div>
                      <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>
                        📍 {d.locationOnPremise || "Client Premise (General)"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                        {d.serialNumber ? `S/N: ${d.serialNumber}` : "No S/N"}
                      </div>
                      {d.assetTag && (
                        <div style={{ fontSize: 11, color: "var(--adm-muted)" }}>
                          Tag: <strong>{d.assetTag}</strong>
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="adm-badge"
                        style={{ background: statusMeta.bg, color: statusMeta.color }}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                          color: maint.badgeColor,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: maint.badgeColor,
                          }}
                        />
                        {maint.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="adm-btn adm-btn-sm"
                          onClick={() => openDeviceDetail(d)}
                          title="View History & Details"
                        >
                          Details & Logs
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-primary"
                          onClick={() => {
                            setSelectedDevice(d);
                            setShowLogModal(true);
                          }}
                          title="Log Maintenance Visit"
                        >
                          + Log Visit
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-danger"
                          onClick={() => handleDeleteDevice(d.id, d.deviceName)}
                          title="Delete device"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Register New Installed Device */}
      {showAddModal && (
        <div className="adm-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>Register Installed Device on Client Premise</h3>
              <button className="adm-btn adm-btn-sm" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateDevice}>
              <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
                {errorMsg && (
                  <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 6, marginBottom: 14 }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="adm-field">
                    <label>Client Company *</label>
                    <select
                      required
                      value={deviceForm.companyId}
                      onChange={(e) => setDeviceForm({ ...deviceForm, companyId: e.target.value })}
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-field">
                    <label>Site Contact (Optional)</label>
                    <select
                      value={deviceForm.contactId}
                      onChange={(e) => setDeviceForm({ ...deviceForm, contactId: e.target.value })}
                    >
                      <option value="">-- No specific contact --</option>
                      {contacts
                        .filter((c) => !deviceForm.companyId || String(c.companyId) === String(deviceForm.companyId))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} ({c.phone || c.email})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Device / Hardware Name *</label>
                    <input
                      required
                      placeholder="e.g. ZKTeco SilkBio-101TC Biometric Reader"
                      value={deviceForm.deviceName}
                      onChange={(e) => setDeviceForm({ ...deviceForm, deviceName: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Category *</label>
                    <select
                      value={deviceForm.deviceType}
                      onChange={(e) => setDeviceForm({ ...deviceForm, deviceType: e.target.value })}
                    >
                      {DEVICE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-field">
                    <label>Brand / Manufacturer</label>
                    <input
                      placeholder="e.g. ZKTeco, APC, MikroTik, Hikvision"
                      value={deviceForm.brand}
                      onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Model Number</label>
                    <input
                      placeholder="e.g. SilkBio-101TC"
                      value={deviceForm.modelNumber}
                      onChange={(e) => setDeviceForm({ ...deviceForm, modelNumber: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Serial Number (S/N)</label>
                    <input
                      placeholder="Hardware serial number"
                      value={deviceForm.serialNumber}
                      onChange={(e) => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Asset Tag / Barcode</label>
                    <input
                      placeholder="e.g. NS-AST-0104"
                      value={deviceForm.assetTag}
                      onChange={(e) => setDeviceForm({ ...deviceForm, assetTag: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Location on Premise *</label>
                    <input
                      required
                      placeholder="e.g. HQ Server Room Floor 2, Main Gate Turnstile"
                      value={deviceForm.locationOnPremise}
                      onChange={(e) => setDeviceForm({ ...deviceForm, locationOnPremise: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Installation Date</label>
                    <input
                      type="date"
                      value={deviceForm.installationDate}
                      onChange={(e) => setDeviceForm({ ...deviceForm, installationDate: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Installed By Technician</label>
                    <select
                      value={deviceForm.installedByTechnicianId}
                      onChange={(e) => setDeviceForm({ ...deviceForm, installedByTechnicianId: e.target.value })}
                    >
                      <option value="">-- Select Technician --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.specialty || "Field Tech"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-field">
                    <label>Warranty Expiration</label>
                    <input
                      type="date"
                      value={deviceForm.warrantyExpiresAt}
                      onChange={(e) => setDeviceForm({ ...deviceForm, warrantyExpiresAt: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Maintenance Interval (Months)</label>
                    <select
                      value={deviceForm.maintenanceIntervalMonths}
                      onChange={(e) =>
                        setDeviceForm({ ...deviceForm, maintenanceIntervalMonths: Number(e.target.value) })
                      }
                    >
                      <option value={1}>Monthly (Every 1 month)</option>
                      <option value={3}>Quarterly (Every 3 months)</option>
                      <option value={6}>Semi-Annual (Every 6 months)</option>
                      <option value={12}>Annual (Every 12 months)</option>
                    </select>
                  </div>

                  <div className="adm-field">
                    <label>IP Address (Optional)</label>
                    <input
                      placeholder="e.g. 192.168.10.55"
                      value={deviceForm.ipAddress}
                      onChange={(e) => setDeviceForm({ ...deviceForm, ipAddress: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>MAC Address (Optional)</label>
                    <input
                      placeholder="e.g. 00:1A:2B:3C:4D:5E"
                      value={deviceForm.macAddress}
                      onChange={(e) => setDeviceForm({ ...deviceForm, macAddress: e.target.value })}
                    />
                  </div>

                  <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Configuration Notes</label>
                    <textarea
                      placeholder="Special port assignments, power backup requirements, etc."
                      value={deviceForm.notes}
                      onChange={(e) => setDeviceForm({ ...deviceForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, borderTop: "1px solid var(--adm-border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="adm-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Register Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Device Details & Activity History Drawer */}
      {selectedDevice && !showLogModal && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedDevice(null)}>
          <div className="adm-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{selectedDevice.deviceName}</h3>
                <span style={{ fontSize: 13, color: "var(--adm-muted)" }}>
                  {selectedDevice.companyName} · 📍 {selectedDevice.locationOnPremise}
                </span>
              </div>
              <button className="adm-btn adm-btn-sm" onClick={() => setSelectedDevice(null)}>
                ✕
              </button>
            </div>

            <div style={{ padding: 20, maxHeight: "75vh", overflowY: "auto" }}>
              {loadingDetail ? (
                <div style={{ padding: 30, textAlign: "center", color: "var(--adm-muted)" }}>
                  Loading device service history...
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#f8fafc",
                      padding: 14,
                      borderRadius: 8,
                      marginBottom: 20,
                      border: "1px solid var(--adm-border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--adm-muted)", fontWeight: 700 }}>
                        Next Preventative Maintenance
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                        {getMaintenanceStatus(selectedDevice.nextMaintenanceDate).label}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        onClick={() => setShowLogModal(true)}
                      >
                        + Log Service Activity
                      </button>
                      <Link
                        href={`/admin/incidents?companyId=${selectedDevice.companyId}`}
                        className="adm-btn adm-btn-sm"
                        style={{ borderColor: "#ef4444", color: "#dc2626" }}
                      >
                        🚨 Report Incident
                      </Link>
                    </div>
                  </div>

                  {/* Device Specification Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, marginBottom: 24 }}>
                    <div>
                      <strong>Device Category:</strong> {selectedDevice.deviceType}
                    </div>
                    <div>
                      <strong>Brand / Model:</strong> {selectedDevice.brand} {selectedDevice.modelNumber}
                    </div>
                    <div>
                      <strong>Serial Number:</strong> {selectedDevice.serialNumber || "N/A"}
                    </div>
                    <div>
                      <strong>Asset Tag:</strong> {selectedDevice.assetTag || "N/A"}
                    </div>
                    <div>
                      <strong>Installation Date:</strong> {selectedDevice.installationDate || "Not recorded"}
                    </div>
                    <div>
                      <strong>Installed By:</strong> {selectedDevice.installedByTechnicianName || "N/A"}
                    </div>
                    <div>
                      <strong>Warranty Until:</strong> {selectedDevice.warrantyExpiresAt || "No warranty recorded"}
                    </div>
                    <div>
                      <strong>Maintenance Recurrence:</strong> Every {selectedDevice.maintenanceIntervalMonths || 6} months
                    </div>
                    {selectedDevice.specifications?.ipAddress && (
                      <div>
                        <strong>IP Address:</strong> {selectedDevice.specifications.ipAddress}
                      </div>
                    )}
                    {selectedDevice.specifications?.macAddress && (
                      <div>
                        <strong>MAC Address:</strong> {selectedDevice.specifications.macAddress}
                      </div>
                    )}
                  </div>

                  {selectedDevice.notes && (
                    <div style={{ marginBottom: 24, fontSize: 13, background: "#f8fafc", padding: 12, borderRadius: 6 }}>
                      <strong>Setup Notes:</strong>
                      <div style={{ marginTop: 4, color: "var(--adm-muted)" }}>{selectedDevice.notes}</div>
                    </div>
                  )}

                  {/* Maintenance Activity Logs Timeline */}
                  <h4 style={{ fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>Service & Activity Logs ({selectedDevice.maintenanceLogs?.length || 0})</span>
                  </h4>

                  {!selectedDevice.maintenanceLogs || selectedDevice.maintenanceLogs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 24, background: "#f8fafc", borderRadius: 8, color: "var(--adm-muted)", fontSize: 13 }}>
                      No maintenance or service activities logged yet for this device.
                      <div style={{ marginTop: 8 }}>
                        <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => setShowLogModal(true)}>
                          Log First Maintenance Visit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {selectedDevice.maintenanceLogs.map((log: any) => (
                        <div
                          key={log.id}
                          style={{
                            border: "1px solid var(--adm-border)",
                            borderRadius: 8,
                            padding: 14,
                            background: "#fff",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{log.summary}</span>
                              <span
                                className="adm-badge"
                                style={{ marginLeft: 8, textTransform: "capitalize", background: "#f1f5f9" }}
                              >
                                {log.maintenanceType?.replace("_", " ")}
                              </span>
                            </div>
                            <span style={{ fontSize: 12, color: "var(--adm-muted)" }}>
                              📅 {new Date(log.performedAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </div>

                          <div style={{ fontSize: 13, color: "#334155", marginBottom: 8, whiteSpace: "pre-wrap" }}>
                            {log.details || "Routine check and maintenance completed."}
                          </div>

                          {log.partsReplaced && (
                            <div style={{ fontSize: 12, color: "#92400e", background: "#fef3c7", padding: "4px 8px", borderRadius: 4, marginBottom: 8 }}>
                              <strong>Parts replaced / serviced:</strong> {log.partsReplaced}
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--adm-muted)", borderTop: "1px dashed #e2e8f0", paddingTop: 8 }}>
                            <span>Technician: <strong>{log.technicianName}</strong></span>
                            <span>Status after visit: <strong>{log.deviceStatusAfter}</strong></span>
                            {log.cost > 0 && <span>Cost: <strong>KES {Number(log.cost).toLocaleString()}</strong></span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ padding: 14, borderTop: "1px solid var(--adm-border)", display: "flex", justifyContent: "flex-end" }}>
              <button className="adm-btn" onClick={() => setSelectedDevice(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Log New Maintenance Visit */}
      {showLogModal && selectedDevice && (
        <div className="adm-modal-backdrop" onClick={() => setShowLogModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Log Maintenance Activity</h3>
                <span style={{ fontSize: 12, color: "var(--adm-muted)" }}>
                  {selectedDevice.deviceName} ({selectedDevice.companyName})
                </span>
              </div>
              <button className="adm-btn adm-btn-sm" onClick={() => setShowLogModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleLogMaintenance}>
              <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
                {errorMsg && (
                  <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 6, marginBottom: 14 }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="adm-field">
                    <label>Visit Date *</label>
                    <input
                      type="date"
                      required
                      value={logForm.performedAt}
                      onChange={(e) => setLogForm({ ...logForm, performedAt: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Attending Technician</label>
                    <select
                      value={logForm.technicianId}
                      onChange={(e) => setLogForm({ ...logForm, technicianId: e.target.value })}
                    >
                      <option value="">-- Select Technician --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="adm-field">
                    <label>Activity / Maintenance Type *</label>
                    <select
                      value={logForm.maintenanceType}
                      onChange={(e) => setLogForm({ ...logForm, maintenanceType: e.target.value })}
                    >
                      <option value="routine_preventive">Routine Preventative Service</option>
                      <option value="repair_corrective">Repair / Corrective Fix</option>
                      <option value="inspection">Inspection & Health Check</option>
                      <option value="firmware_update">Firmware / Software Update</option>
                      <option value="installation">Initial Installation</option>
                      <option value="decommission">Decommissioning</option>
                    </select>
                  </div>

                  <div className="adm-field">
                    <label>Device Condition After Visit</label>
                    <select
                      value={logForm.deviceStatusAfter}
                      onChange={(e) => setLogForm({ ...logForm, deviceStatusAfter: e.target.value })}
                    >
                      <option value="operational">Operational & Healthy</option>
                      <option value="degraded">Degraded (Needs Attention)</option>
                      <option value="needs_followup">Needs Follow-Up Visit</option>
                    </select>
                  </div>

                  <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Summary Headline *</label>
                    <input
                      required
                      placeholder="e.g. Q3 sensor calibration, backup battery check, dust cleaning"
                      value={logForm.summary}
                      onChange={(e) => setLogForm({ ...logForm, summary: e.target.value })}
                    />
                  </div>

                  <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Detailed Work Done</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the steps performed, test results, issues resolved..."
                      value={logForm.details}
                      onChange={(e) => setLogForm({ ...logForm, details: e.target.value })}
                    />
                  </div>

                  <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Parts Replaced / Materials Used</label>
                    <input
                      placeholder="e.g. 12V 7Ah battery replacement, optical prism cleaned"
                      value={logForm.partsReplaced}
                      onChange={(e) => setLogForm({ ...logForm, partsReplaced: e.target.value })}
                    />
                  </div>

                  <div className="adm-field">
                    <label>Next Recommended Maintenance Date</label>
                    <input
                      type="date"
                      value={logForm.nextRecommendedMaintenance}
                      onChange={(e) => setLogForm({ ...logForm, nextRecommendedMaintenance: e.target.value })}
                    />
                    <span style={{ fontSize: 11, color: "var(--adm-muted)" }}>
                      Leave blank to auto-calculate using device's interval ({selectedDevice.maintenanceIntervalMonths || 6} months)
                    </span>
                  </div>

                  <div className="adm-field">
                    <label>Service Cost / Invoice (KES)</label>
                    <input
                      type="number"
                      value={logForm.cost}
                      onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, borderTop: "1px solid var(--adm-border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="adm-btn" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={submitting}>
                  {submitting ? "Saving Log..." : "Save Maintenance Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
