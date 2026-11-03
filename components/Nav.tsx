import Link from "next/link";

export default function Nav({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <nav className="nb-nav">
      <Link href="/" className="nb-logo">
        <div className="nb-logo-mark">N</div>
        <div className="nb-logo-text">
          <span>Nanosoft</span>
          <span>Technology</span>
        </div>
      </Link>
      <Link href={backHref} className="nb-back">
        {backLabel}
      </Link>
    </nav>
  );
}
