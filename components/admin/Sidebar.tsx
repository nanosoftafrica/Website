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

const NAV_GROUPS: { label: string; icon: LucideIcon; links: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    links: [{ href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "CRM",
    icon: Users,
    links: [
      { href: "/admin/companies", label: "Companies", icon: Building2 },
      { href: "/admin/contacts", label: "Contacts", icon: Contact },
    ],
  },
  {
    label: "Sales",
    icon: Handshake,
    links: [{ href: "/admin/deals", label: "Opportunities", icon: Handshake }],
  },
  {
    label: "Service Management",
    icon: Wrench,
    links: [
      { href: "/admin/devices", label: "Client Devices", icon: Monitor },
      { href: "/admin/incidents", label: "Incidents", icon: Siren },
      { href: "/admin/service-requests", label: "Service Requests", icon: ClipboardList },
      { href: "/admin/technicians", label: "Technicians", icon: Users },
      { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
    ],
  },
  {
    label: "Catalog & Inventory",
    icon: PackageSearch,
    links: [
      { href: "/admin/categories", label: "Service Categories", icon: FolderKanban },
      { href: "/admin/products", label: "Services", icon: Zap },
    ],
  },
  {
    label: "CMS",
    icon: PanelsTopLeft,
    links: [
      { href: "/admin/content", label: "Site Content", icon: FileText },
      { href: "/admin/posts", label: "Blog Posts", icon: Newspaper },
      { href: "/admin/pages", label: "Pages", icon: PanelsTopLeft },
      { href: "/admin/media", label: "Media Library", icon: Image },
      { href: "/admin/tags", label: "Tags", icon: Tags },
    ],
  },
  {
    label: "Brand & Company",
    icon: Globe,
    links: [
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
      { href: "/admin/case-studies", label: "Case Studies", icon: FolderKanban },
      { href: "/admin/events", label: "Milestones", icon: CalendarDays },
      { href: "/admin/menu", label: "Navigation Menu", icon: PanelsTopLeft },
    ],
  },
  {
    label: "Engagement",
    icon: MessagesSquare,
    links: [
      { href: "/admin/whatsapp", label: "WhatsApp (WAHA)", icon: MessageCircle },
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/comments", label: "Comments", icon: MessagesSquare },
      { href: "/admin/subscribers", label: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "Administration",
    icon: Settings,
    links: [
      { href: "/admin/insights", label: "Analytics", icon: ChartNoAxesCombined },
      { href: "/admin/integrations", label: "Integrations & API", icon: Plug },
      { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Field Operations",
    icon: ClipboardList,
    links: [{ href: "/field-docs", label: "Field Docs", icon: FileText }],
  },
];

export default function Sidebar({ username }: { username: string }) {
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
    const saved = localStorage.getItem("admin-sidebar-expanded");
    if (saved) {
      try {
        setExpandedGroups(new Set(JSON.parse(saved)));
      } catch {
        // Reset if corrupted
        setExpandedGroups(new Set(["Dashboard"])); // Default open section
      }
    } else {
      // Default: expand the Dashboard section
      setExpandedGroups(new Set(["Dashboard"]));
    }

    // Auto-expand section containing current page
    const currentSection = NAV_GROUPS.find((group) =>
      group.links.some((link) => pathname === link.href || pathname.startsWith(link.href + "/"))
    );
    if (currentSection && !expandedGroups.has(currentSection.label)) {
      setExpandedGroups((prev) => new Set([...prev, currentSection.label]));
    }
  }, [pathname]);

  // Save to localStorage when expanded groups change
  useEffect(() => {
    if (initialized.current && expandedGroups.size > 0) {
      localStorage.setItem("admin-sidebar-expanded", JSON.stringify(Array.from(expandedGroups)));
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
        <Link className="adm-sidebar-brand" href="/admin/dashboard" aria-label="Nanosoft Admin home">
          <span className="adm-brand-icon">N</span>
          <span className="adm-brand-copy">
            <strong>Nanosoft</strong>
            <small>Admin workspace</small>
          </span>
        </Link>
        <nav className="adm-sidebar-nav">
          {NAV_GROUPS.map((group) => {
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
