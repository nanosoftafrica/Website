import { NextResponse } from "next/server";
import { ClientDevice, MaintenanceLog, Activity } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;

  const device = await ClientDevice.findByPk(id);
  if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (!body.summary || !String(body.summary).trim()) {
    return NextResponse.json({ error: "Maintenance activity summary is required" }, { status: 400 });
  }

  const performedAt = body.performedAt ? new Date(body.performedAt) : new Date();
  const performedDateStr = performedAt.toISOString().split("T")[0];

  let nextMaintenanceDate = body.nextRecommendedMaintenance || null;
  if (!nextMaintenanceDate) {
    const intervalMonths = device.maintenanceIntervalMonths || 6;
    const nextDate = new Date(performedAt.getTime());
    nextDate.setMonth(nextDate.getMonth() + intervalMonths);
    nextMaintenanceDate = nextDate.toISOString().split("T")[0];
  }

  const logPayload = {
    deviceId: device.id,
    companyId: device.companyId,
    technicianId: body.technicianId || null,
    incidentId: body.incidentId || null,
    maintenanceType: body.maintenanceType || "routine_preventive",
    status: body.status || "completed",
    performedAt,
    summary: String(body.summary).trim(),
    details: body.details || "",
    partsReplaced: body.partsReplaced || "",
    deviceStatusAfter: body.deviceStatusAfter || "operational",
    nextRecommendedMaintenance: nextMaintenanceDate,
    cost: body.cost || 0,
    notes: body.notes || "",
  };

  try {
    const log = await MaintenanceLog.create(logPayload);

    // Update parent device's last & next maintenance dates and status
    const newStatus =
      body.deviceStatusAfter === "operational"
        ? "active"
        : body.deviceStatusAfter === "degraded" || body.deviceStatusAfter === "needs_followup"
        ? "needs_maintenance"
        : device.status;

    await device.update({
      lastMaintenanceDate: performedDateStr,
      nextMaintenanceDate,
      status: newStatus,
    });

    // Also log an Activity entry in CRM for the client company
    try {
      await Activity.create({
        type: "task",
        subject: `[Maintenance] ${device.deviceName}: ${log.summary}`,
        body: `Technician serviced ${device.deviceName} at client premise.\nType: ${log.maintenanceType}\nDetails: ${log.details || "N/A"}\nParts replaced: ${log.partsReplaced || "None"}\nStatus after: ${log.deviceStatusAfter}`,
        companyId: device.companyId,
        contactId: device.contactId || null,
        completed: true,
        createdBy: session.username || "admin",
      });
    } catch {
      // Non-fatal if activity log creation fails
    }

    await audit(session, "create", "maintenance_log", log.id, `Logged maintenance for ${device.deviceName}: ${log.summary}`);

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
