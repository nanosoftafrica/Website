import {redirect} from 'next/navigation';import {q} from '@/lib/fieldDocs/db';import {need} from '@/lib/fieldDocs/auth';import Shell from '@/components/field-docs/Shell';import ScheduleAdmin from '@/components/field-docs/ScheduleAdmin';
export const dynamic='force-dynamic';
export default async function P(){const u=await need();if(u.role==='tech')redirect('/field-docs');
 const J=x=>JSON.parse(JSON.stringify(x));
 return <Shell u={u}><h2 style={{marginTop:0}}>Scheduled jobs</h2><ScheduleAdmin items={J(await q('select s.*,s.next_run::text nr,t.name tpl,w.num last_num from schedules s left join templates t on t.id=s.template_id left join work_orders w on w.id=s.last_wo order by s.next_run'))} clients={await q('select id,name,contact,phone from clients order by lower(name)')} templates={await q('select id,name,service from templates where active order by service,name')} sups={await q("select id,name from users where role in ('admin','supervisor') order by name")}/></Shell>}
