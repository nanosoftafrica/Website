import { listAllTeam } from "@/lib/adminDb";
import TeamPanel from "@/components/admin/TeamPanel";
import ScreenHelp from "@/components/admin/ScreenHelp";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const team = await listAllTeam();
  return (
    <>
      <ScreenHelp>{"Team members appear on the Team page (/team) and the About page (/about). Untick Active to hide someone."}</ScreenHelp>
      <TeamPanel initialItems={team} />
    </>
  );
}
