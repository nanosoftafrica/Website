import {need} from '@/lib/fieldDocs/auth';import {q} from '@/lib/fieldDocs/db';import Shell from '@/components/field-docs/Shell';import AccountForm from '@/components/field-docs/AccountForm';
export const dynamic='force-dynamic';
export default async function Account(){const u=await need();const row=(await q('select totp_enabled from users where id=$1',[u.id]))[0];
 return <Shell u={u}><h2 style={{marginTop:0}}>My account</h2><AccountForm email={u.email} totpEnabled={!!row?.totp_enabled}/></Shell>}
