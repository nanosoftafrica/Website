import { listIntegrations } from "@/lib/integrationsService";
import IntegrationsManager from "@/components/admin/IntegrationsManager";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const integrations = await listIntegrations(true);
  return (
    <>
      <ScreenHelp>{"Connections to outside services. Change these only if you know what they do."}</ScreenHelp>
      <IntegrationsManager initialIntegrations={integrations} />
    </>
  );
}
