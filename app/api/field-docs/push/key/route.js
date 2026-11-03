import {publicKey} from '@/lib/fieldDocs/push';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({key:await publicKey()})}
