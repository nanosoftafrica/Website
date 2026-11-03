import { listIntegrations } from "@/lib/integrationsService";
import IntegrationsManager from "@/components/admin/IntegrationsManager";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const integrations = await listIntegrations(true);
  return <IntegrationsManager initialIntegrations={integrations} />;
}
