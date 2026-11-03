'use client';
import Link from 'next/link';import {usePathname} from 'next/navigation';
const ITEMS=[['/field-docs','🏠','Home'],['/field-docs/workorders','🧰','Jobs'],['/field-docs/documents','📝','Docs'],['/field-docs/reports','📊','Reports']];
export default function BottomNav(){const p=usePathname();
 const on=href=>href==='/field-docs'?p==='/field-docs':p.startsWith(href);
 return <nav className="bottomnav noprint">
  {ITEMS.map(([href,icon,label])=><Link key={href} href={href} className={on(href)?'on':''}><i>{icon}</i><span>{label}</span></Link>)}
  <label htmlFor="navtoggle"><i>☰</i><span>More</span></label>
 </nav>}
