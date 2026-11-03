import {redirect} from 'next/navigation';import {q} from '@/lib/fieldDocs/db';import {need} from '@/lib/fieldDocs/auth';import Shell from '@/components/field-docs/Shell';import TemplateAdmin from '@/components/field-docs/TemplateAdmin';
export const dynamic='force-dynamic';
export default async function P(){const u=await need();if(u.role!=='admin')redirect('/field-docs');
 return <Shell u={u}><h2 style={{marginTop:0}}>Workflow templates</h2><TemplateAdmin items={await q('select * from templates order by service,name')}/></Shell>}
