import { NextResponse } from "next/server";
import { ClientDevice } from "@/lib/serverModels";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { listClientDevices } from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId") ? Number(url.searchParams.get("companyId")) : undefined;
  const status = url.searchParams.get("status") || undefined;

  try {
    const devices = await listClientDevices({ companyId, status });
    return NextResponse.json(devices);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

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

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const body = await req.json().catch(() => ({}));
  if (!body.deviceName || !String(body.deviceName).trim() || !body.companyId) {
    return NextResponse.json({ error: "Device name and client company are required" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  for (const f of ALLOWED_FIELDS) {
    if (f in body) payload[f] = body[f];
  }

  // If nextMaintenanceDate isn't supplied but installationDate is, calculate it from interval
  if (!payload.nextMaintenanceDate && (payload.installationDate || payload.lastMaintenanceDate)) {
    const base = new Date((payload.lastMaintenanceDate || payload.installationDate) as string);
    const months = Number(payload.maintenanceIntervalMonths) || 6;
    base.setMonth(base.getMonth() + months);
    payload.nextMaintenanceDate = base.toISOString().split("T")[0];
  }

  try {
    const device = await ClientDevice.create(payload);
    await audit(session, "create", "client_device", device.id, `Registered device ${device.deviceName}`);
    return NextResponse.json(device, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
