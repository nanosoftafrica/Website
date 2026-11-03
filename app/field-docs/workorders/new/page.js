import {q} from '@/lib/fieldDocs/db';import {need} from '@/lib/fieldDocs/auth';import Shell from '@/components/field-docs/Shell';import NewWO from '@/components/field-docs/NewWO';import {parse} from '@/lib/fieldDocs/workflows';
export const dynamic='force-dynamic';
export default async function P(){const u=await need();
 const clients=await q('select id,name,contact,email,phone from clients order by lower(name)'),templates=await q('select id,name,service,dsl from templates where active order by service,name'),sups=await q("select id,name from users where role in ('admin','supervisor') order by name");
 const plans=templates.map(t=>{const tasks=parse(t.dsl),titles=Object.fromEntries(tasks.map(task=>[task.key,task.title]));return {...t,plan:tasks.map(task=>({title:task.title,team:task.team,depends:task.deps.map(key=>titles[key]),subtasks:task.sub?task.sub.split('~'):[],checklist:task.chk&&task.chk!=='@items'?task.chk.split('~'):[],items:task.chk==='@items',evidence:task.ev,document:task.doc,next:task.next,optional:task.opt}))}});
 return <Shell u={u}><h2 style={{marginTop:0}}>New work order</h2><NewWO clients={clients} templates={plans} sups={sups} me={{role:u.role}}/></Shell>}
