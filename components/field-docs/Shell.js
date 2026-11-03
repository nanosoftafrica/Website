import Link from 'next/link';import {q} from '@/lib/fieldDocs/db';import Pwa from './Pwa';import MailPref from './MailPref';import BottomNav from './BottomNav';
export default async function Shell({u,children,wide=false}){
 const n=+(await q("select count(*) c from docs where esc_status='open' and ($1::boolean or owner=$2)",[u.role!=='tech',u.id]))[0].c;
 return <><div className={'bar noprint'+(wide?' bar-dashboard':'')}>
  <Link href="/field-docs" className="brand">Nanosoft <span className="mut">Control Tower</span></Link><span className="grow"/>
  <input type="checkbox" id="navtoggle" className="navtoggle"/><label htmlFor="navtoggle" className="hamburger" aria-label="Menu">☰</label>
  <nav className="navlinks">
   <Pwa/><Link href="/field-docs/workorders">Work orders</Link><Link href="/field-docs/documents">Documents</Link><Link href="/field-docs/assets">Assets</Link>{u.role!=='tech'&&<Link href="/field-docs/schedules">Schedules</Link>}<Link href="/field-docs/reports">Reports</Link>
   <Link href="/field-docs/escalations">Escalations{n>0&&<span className="badge esc-open" style={{marginLeft:6}}>{n}</span>}</Link>
   {u.role!=='tech'&&<Link href="/field-docs/clients">Clients</Link>}
   {u.role==='admin'&&<Link href="/field-docs/settings">Settings</Link>}
   <MailPref on={u.email_alerts}/><Link href="/field-docs/account" className="mut">{u.name}</Link><a href="/api/field-docs/logout">Log out</a>
    </nav></div><div className={'wrap'+(wide?' wide':'')}>{children}</div><BottomNav/></>}
