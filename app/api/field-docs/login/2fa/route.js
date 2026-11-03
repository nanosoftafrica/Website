import {NextResponse} from 'next/server';import {cookies} from 'next/headers';import {q} from '@/lib/fieldDocs/db';import {mint,readTmp} from '@/lib/fieldDocs/auth';import {verifyTotp} from '@/lib/fieldDocs/totp';
export async function POST(r){const cookieStore=await cookies(),id=readTmp(cookieStore.get('fd_sid2fa')?.value);if(!id)return NextResponse.json({error:'Session expired, log in again'},{status:401});
 const {code}=await r.json(),u=(await q('select * from users where id=$1 and active',[id]))[0];
 if(!u||!u.totp_enabled||!verifyTotp(u.totp_secret,code))return NextResponse.json({error:'Wrong code'},{status:401});
 const res=NextResponse.json({ok:1});res.cookies.set('fd_sid2fa','',{path:'/field-docs',maxAge:0});
 res.cookies.set('fd_sid',mint(u.id),{httpOnly:true,sameSite:'lax',path:'/field-docs',maxAge:43200,secure:process.env.FIELD_DOCS_COOKIE_SECURE==='1'});return res}
