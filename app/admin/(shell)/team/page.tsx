import { listAllTeam } from "@/lib/adminDb";
import TeamPanel from "@/components/admin/TeamPanel";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const team = await listAllTeam();
  return <TeamPanel initialItems={team} />;
}
