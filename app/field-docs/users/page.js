import {redirect} from 'next/navigation';import {q} from '@/lib/fieldDocs/db';import {need} from '@/lib/fieldDocs/auth';import {teamList} from '@/lib/fieldDocs/lists';import Shell from '@/components/field-docs/Shell';import UserForm from '@/components/field-docs/UserForm';import UserAdmin from '@/components/field-docs/UserAdmin';
export const dynamic='force-dynamic';
export default async function U(){const u=await need();if(u.role!=='admin')redirect('/field-docs');const us=await q('select id,name,email,role,team,active from users order by id'),teams=await teamList();
 return <Shell u={u}><UserForm teams={teams}/><UserAdmin users={us} teams={teams} me={{id:u.id}}/></Shell>}
