import { NextResponse } from "next/server";
import { ClientDevice, MaintenanceLog } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { getClientDeviceDetail } from "@/lib/adminDb";

const ALLOWED_FIELDS = [
  "companyId",
  "contactId",
  "deviceName",
  "deviceType",
  "brand",
  "modelNumber",
  "serialNumber",
  "assetTag",
  "locationOnPremise",
  "installationDate",
  "installedByTechnicianId",
  "warrantyExpiresAt",
  "maintenanceIntervalMonths",
  "lastMaintenanceDate",
  "nextMaintenanceDate",
  "status",
  "specifications",
  "notes",
] as const;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const detail = await getClientDeviceDetail(id);
  if (!detail) return NextResponse.json({ error: "Device not found" }, { status: 404 });
  return NextResponse.json(detail);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;

  const device = await ClientDevice.findByPk(id);
  if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const payload: Record<string, unknown> = {};
  for (const f of ALLOWED_FIELDS) {
    if (f in body) payload[f] = body[f];
  }

  try {
    await device.update(payload);
    await audit(session, "update", "client_device", device.id, `Updated device ${device.deviceName}`);
    return NextResponse.json(device);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();
  const { id } = await params;

  const device = await ClientDevice.findByPk(id);
  if (device) {
    await MaintenanceLog.destroy({ where: { deviceId: device.id } });
    await audit(session, "delete", "client_device", device.id, `Deleted device ${device.deviceName}`);
    await device.destroy();
  }
  return NextResponse.json({ ok: true });
}
