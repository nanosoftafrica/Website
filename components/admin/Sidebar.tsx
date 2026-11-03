"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardList,
  Contact,
  FileText,
  FolderKanban,
  Globe,
  Handshake,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessagesSquare,
  Monitor,
  Newspaper,
  PackageSearch,
  PanelsTopLeft,
  Plug,
  ScrollText,
  Settings,
  Siren,
  Star,
  Tags,
  Truck,
  Users,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type NavLink = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };

// Four areas in plain words. Marketing accounts see Start and Website only.
const NAV_GROUPS: { label: string; icon: LucideIcon; adminOnly?: boolean; links: NavLink[] }[] = [
  {
    label: "Start",
    icon: LayoutDashboard,
    links: [
      { href: "/admin/start", label: "What would you like to do?", icon: Zap },
      { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, adminOnly: true },
    ],
  },
  {
    label: "Website",
    icon: Globe,
    links: [
      { href: "/admin/content", label: "Home page, clients and social links", icon: FileText },
      { href: "/admin/products", label: "Products", icon: PackageSearch },
      { href: "/admin/categories", label: "Product categories", icon: FolderKanban },
      { href: "/admin/posts", label: "Blog posts", icon: Newspaper },
      { href: "/admin/comments", label: "Blog comments", icon: MessagesSquare },
      { href: "/admin/pages", label: "Extra pages", icon: PanelsTopLeft },
      { href: "/admin/case-studies", label: "Case studies", icon: FolderKanban },
      { href: "/admin/events", label: "Events and milestones", icon: CalendarDays },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
      { href: "/admin/menu", label: "Site menu", icon: Menu },
      { href: "/admin/media", label: "Image library", icon: Image },
    ],
  },
  {
    label: "Sales",
    icon: Handshake,
    adminOnly: true,
    links: [
      { href: "/admin/messages", label: "Demo requests and messages", icon: Mail },
      { href: "/admin/deals", label: "Deals and product inquiries", icon: Handshake },
      { href: "/admin/contacts", label: "Contacts", icon: Contact },
      { href: "/admin/companies", label: "Companies", icon: Building2 },
      { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { href: "/admin/subscribers", label: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "Support",
    icon: Wrench,
    adminOnly: true,
    links: [
      { href: "/admin/service-requests", label: "Service requests", icon: ClipboardList },
      { href: "/admin/incidents", label: "Incidents", icon: Siren },
      { href: "/admin/devices", label: "Client devices", icon: Monitor },
      { href: "/admin/technicians", label: "Technicians", icon: Users },
      { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
      { href: "/field-docs", label: "Field Docs", icon: FileText },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    adminOnly: true,
    links: [
      { href: "/admin/settings", label: "Users and roles", icon: Settings },
      { href: "/admin/tags", label: "Tags", icon: Tags },
      { href: "/admin/audit", label: "Audit log", icon: ScrollText },
      { href: "/admin/insights", label: "Analytics", icon: ChartNoAxesCombined },
      { href: "/admin/integrations", label: "Integrations and API", icon: Plug },
    ],
  },
];

export default function Sidebar({ username, fullAccess = false }: { username: string; fullAccess?: boolean }) {
  const groups = NAV_GROUPS.filter((g) => fullAccess || !g.adminOnly).map((g) => ({
    ...g,
    links: g.links.filter((l) => fullAccess || !l.adminOnly),
  }));
  const pathname = usePathname();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const initialized = useRef(false);

  // Initialize from localStorage and auto-expand current section
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load from localStorage
    const saved = localStorage.getItem("admin-sidebar-open-v2");
    if (saved) {
      try {
        setExpandedGroups(new Set(JSON.parse(saved)));
      } catch {
        // Reset if corrupted
        setExpandedGroups(new Set(["Start", "Website"])); // Default open section
      }
    } else {
      // Default: expand the Dashboard section
      setExpandedGroups(new Set(["Start", "Website"]));
    }

    // Auto-expand section containing current page
    const currentSection = groups.find((group) =>
      group.links.some((link) => pathname === link.href || pathname.startsWith(link.href + "/"))
    );
    if (currentSection && !expandedGroups.has(currentSection.label)) {
      setExpandedGroups((prev) => new Set([...prev, currentSection.label]));
    }
  }, [pathname]);

  // Save to localStorage when expanded groups change
  useEffect(() => {
    if (initialized.current && expandedGroups.size > 0) {
      localStorage.setItem("admin-sidebar-open-v2", JSON.stringify(Array.from(expandedGroups)));
    }
  }, [expandedGroups]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        className="adm-mobile-trigger"
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen && (
        <button
          className="adm-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`adm-sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Admin navigation">
        <Link className="adm-sidebar-brand" href="/admin/start" aria-label="Nanosoft Admin home">
          <span className="adm-brand-icon">N</span>
          <span className="adm-brand-copy">
            <strong>Nanosoft</strong>
            <small>Admin workspace</small>
          </span>
        </Link>
        <nav className="adm-sidebar-nav">
          {groups.map((group) => {
            const isExpanded = expandedGroups.has(group.label);
            const GroupIcon = group.icon;
            return (
              <div key={group.label} className="adm-sidebar-section">
                <button
                  className="adm-sidebar-group"
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={isExpanded}
                >
                  <GroupIcon className="adm-group-icon" size={16} aria-hidden="true" />
                  <span className="adm-group-label">{group.label}</span>
                  <ChevronDown className={`adm-group-chevron ${isExpanded ? "open" : ""}`} size={14} aria-hidden="true" />
                </button>
                {isExpanded && (
                  <div className="adm-sidebar-links">
                    {group.links.map((link) => {
                      const active = pathname === link.href || pathname.startsWith(link.href + "/");
                      const LinkIcon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`adm-sidebar-link ${active ? "active" : ""}`}
                          aria-current={active ? "page" : undefined}
                        >
                          <LinkIcon className="adm-link-icon" size={17} aria-hidden="true" />
                          <span className="adm-link-text">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="adm-sidebar-footer">
          <div className="adm-sidebar-profile">
            <span className="adm-sidebar-avatar">{username.slice(0, 1).toUpperCase()}</span>
            <span className="adm-sidebar-profile-name">{username}</span>
          </div>
          <button onClick={handleLogout} className="adm-logout-button" type="button">
            <LogOut size={16} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
