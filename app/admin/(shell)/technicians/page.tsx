import { listTechnicians } from "@/lib/adminDb";
import TechniciansPanel from "@/components/admin/TechniciansPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function TechniciansPage() {
  const technicians = await listTechnicians();
  return (
    <>
      <ScreenHelp>{"Your support technicians, used when assigning work. Nothing here changes the website."}</ScreenHelp>
      <TechniciansPanel initialItems={technicians} />
    </>
  );
}
