import {redirect} from 'next/navigation';import {q} from '@/lib/fieldDocs/db';import {need} from '@/lib/fieldDocs/auth';import Shell from '@/components/field-docs/Shell';import ProductAdmin from '@/components/field-docs/ProductAdmin';
export const dynamic='force-dynamic';
export default async function P(){const u=await need();if(u.role!=='admin')redirect('/field-docs');
 const items=await q("select p.id,p.name,p.active,(select count(*)::int from docs d where d.data->'f'->>'product'=p.name) uses from products p order by p.sort,lower(p.name)");
 return <Shell u={u}><h2 style={{marginTop:0}}>Systems / products</h2><ProductAdmin items={items}/></Shell>}
