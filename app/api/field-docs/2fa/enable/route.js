import {NextResponse} from 'next/server';import {getUser} from '@/lib/fieldDocs/auth';import {q} from '@/lib/fieldDocs/db';import {verifyTotp} from '@/lib/fieldDocs/totp';import {audit} from '@/lib/fieldDocs/audit';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {code}=await r.json(),row=(await q('select totp_secret from users where id=$1',[u.id]))[0];
 if(!row?.totp_secret||!verifyTotp(row.totp_secret,code))return NextResponse.json({error:'Wrong code'},{status:400});
 await q('update users set totp_enabled=true where id=$1',[u.id]);await audit(u,'user.2fa_enable',u.name);return NextResponse.json({ok:1})}
