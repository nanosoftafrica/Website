"use client";

import { useEffect, useState } from "react";
import type { CategoryWithProducts, MenuLink, ProductSummary } from "@/lib/db";

const DEFAULT_LINKS: MenuLink[] = [
  { id: -1, label: "Who", href: "/#about", order: 1, newTab: false },
  { id: -2, label: "Why", href: "/#pain", order: 2, newTab: false },
  { id: -3, label: "Solutions", href: "/products", order: 3, newTab: false },
  { id: -4, label: "How", href: "/#how", order: 4, newTab: false },
  { id: -5, label: "Where", href: "/#demo", order: 5, newTab: false },
];

// products/categories are still accepted (every call site already passes
// them, e.g. for Footer) but Nav itself no longer renders a dropdown — every
// nav link, including Solutions, is a plain link straight to its href.
export default function Nav({
  menu,
  phone,
  logo,
}: {
  menu: MenuLink[];
  phone: string;
  products?: ProductSummary[];
  categories?: CategoryWithProducts[];
  logo?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = menu.length ? menu : DEFAULT_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "https://wa.me/254734818350";

  return (
    <>
      <nav className={`home-nav${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Nanosoft Technology" className="nav-logo-img" />
          ) : (
            <>
              <div className="logo-mark">N</div>
              <div className="logo-text">
                <span>Nanosoft</span>
                <span>Technology</span>
              </div>
            </>
          )}
        </a>
        <button
          className={`hamburger${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className="nav-links">
          {links.map((m) => (
            <li key={m.id}>
              <a href={m.href} target={m.newTab ? "_blank" : undefined} rel={m.newTab ? "noopener" : undefined}>
                {m.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <a
            href={phone ? `tel:+254${phone.replace(/\D/g, "").replace(/^0/, "")}` : "tel:+254734818350"}
            className="btn-ghost-sm"
            data-analytics-event="contact_phone"
            data-analytics-category="Contact"
            data-analytics-label={phone || "0734 818 350"}
          >
            📞 {phone || "0734 818 350"}
          </a>
          <a
            href="/#demo"
            className="btn-primary-sm"
            data-analytics-event="click_cta"
            data-analytics-category="Conversion"
            data-analytics-label="Nav Book a Demo"
          >
            Book a Demo
          </a>
        </div>
      </nav>

      <div className={`mobile-nav${mobileOpen ? " open" : ""}`}>
        {links.map((m) => (
          <a
            key={m.id}
            href={m.href}
            target={m.newTab ? "_blank" : undefined}
            rel={m.newTab ? "noopener" : undefined}
            onClick={() => setMobileOpen(false)}
            data-analytics-event="nav_click"
            data-analytics-category="Navigation"
            data-analytics-label={m.label}
          >
            {m.label}
          </a>
        ))}
        <a
          href="/#demo"
          className="mob-cta"
          onClick={() => setMobileOpen(false)}
          data-analytics-event="click_cta"
          data-analytics-category="Conversion"
          data-analytics-label="Mobile Nav Book a Demo"
        >
          Book a Demo →
        </a>
      </div>

      <a
        className="wa-float"
        href={waHref}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp us"
        data-analytics-event="contact_whatsapp"
        data-analytics-category="Contact"
        data-analytics-label="Floating WhatsApp"
      >
        💬
      </a>
    </>
  );
}
