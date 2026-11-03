import { listClientDevices, listCompanies, listTechnicians, listContactsLite } from "@/lib/adminDb";
import DevicesManager from "@/components/admin/DevicesManager";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const [devices, companies, technicians, contacts] = await Promise.all([
    listClientDevices(),
    listCompanies(),
    listTechnicians(),
    listContactsLite(),
  ]);

  return (
    <>
      <ScreenHelp>{"Client devices and maintenance visits. Nothing here changes the website."}</ScreenHelp>
      <DevicesManager
        initialDevices={devices}
        companies={companies}
        technicians={technicians}
        contacts={contacts}
      />
    </>
  );
}
