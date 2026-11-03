import { Subscriber } from "@/lib/serverModels";
import { requireSession, unauthorized } from "@/lib/adminApi";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();
  const subs = await Subscriber.findAll({ where: { active: true }, order: [["createdAt", "DESC"]] });
  const csv =
    "Email,Name,Subscribed\n" +
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subs.map((s: any) => `"${s.email}","${s.name || ""}","${s.createdAt.toISOString()}"`).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
