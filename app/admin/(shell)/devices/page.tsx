import { listClientDevices, listCompanies, listTechnicians, listContactsLite } from "@/lib/adminDb";
import DevicesManager from "@/components/admin/DevicesManager";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const [devices, companies, technicians, contacts] = await Promise.all([
    listClientDevices(),
    listCompanies(),
    listTechnicians(),
    listContactsLite(),
  ]);

  return (
    <DevicesManager
      initialDevices={devices}
      companies={companies}
      technicians={technicians}
      contacts={contacts}
    />
  );
}
