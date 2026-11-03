// One-off content seed: brings the product catalog up to date with
// Nanosoft's current "Nano" product suite marketing deck (NanoSafeview,
// NanoAccess, NanoShule, NanoAssets, NanoRecrute, NanoPOS, NanoClub,
// NanoTime, Florena). Idempotent — safe to re-run; upserts by slug and
// preserves any manually-uploaded `image`/`brochureUrl` on existing rows.
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const ProductCategory = require("../server/models/catalog/ProductCategory");
const Product = require("../server/models/catalog/Product");

const NEW_CATEGORIES = [
  { name: "Point of Sale & Retail", slug: "pos", icon: "🛒", color: "#1e40af", order: 9, serviceType: "business", serviceTypeLabel: "Business Service", description: "Point of sale, inventory and warehouse management for retail and multi-outlet businesses." },
  { name: "Club & Membership Management", slug: "club-management", icon: "🏆", color: "#0096D6", order: 10, serviceType: "business", serviceTypeLabel: "Business Service", description: "Membership, team, fixture and finance management for sports clubs and member organisations." },
];

const PRODUCTS = [
  {
    slug: "nano-safeview",
    name: "NanoSafeview",
    subtitle: "Keep your property safe with Nanosoft CCTV cameras",
    categorySlug: "security",
    color: "#16a34a", bgColor: "rgba(22,163,74,0.1)",
    description: "Comprehensive surveillance and security integration — dome, bullet and other camera styles with night vision and motion detection, 24/7 monitoring, and easy installation. Holistic security integration through partnerships with established manufacturers for properties of any scale.",
    features: ["Dome, bullet & other camera styles", "Night vision & motion detection", "24/7 monitoring", "Easy installation", "Intruder alarm system integration", "Personnel & health/safety monitoring"],
    benefits: [
      { icon: "🛡️", title: "Complete Protection", description: "End-to-end surveillance solutions for your property and people." },
      { icon: "👁️", title: "Crystal Clear Images", description: "High-definition cameras deliver sharp, clear video footage." },
      { icon: "⏰", title: "24/7 Peace of Mind", description: "Round-the-clock monitoring keeps you informed and in control." },
      { icon: "⚙️", title: "Easy & Hassle-Free", description: "Professional installation with minimal disruption to your operations." },
      { icon: "🤝", title: "Trusted Partnerships", description: "We work with leading manufacturers for proven quality and reliability." },
      { icon: "📶", title: "Scalable Solutions", description: "From homes to enterprises, we secure properties of any size." },
    ],
  },
  {
    slug: "nano-access",
    name: "NanoAccess",
    subtitle: "Secure your highest-value assets with advanced access control",
    categorySlug: "security",
    color: "#15803d", bgColor: "rgba(21,128,61,0.1)",
    description: "A range of access control technologies — biometric readers, card readers, keypad systems, turnstiles and barriers — tailored to different environments and security requirements, with comprehensive coverage for protecting important areas.",
    features: ["Biometric, card, keypad & turnstile access", "Advanced access control technology", "Environment-specific solutions", "Customizable to security requirements", "Real-time activity monitoring & reports", "Seamless integration with existing systems"],
    benefits: [
      { icon: "🔒", title: "Enhanced Security", description: "Restrict unauthorised access and protect what matters most." },
      { icon: "👥", title: "Accountability", description: "Know who accessed which area and when." },
      { icon: "⚡", title: "Operational Efficiency", description: "Automate access management and reduce manual work." },
      { icon: "📡", title: "Real-Time Monitoring", description: "Monitor access activity live and receive instant alerts." },
      { icon: "🧩", title: "Scalable & Flexible", description: "Solutions that grow with your business and adapt to your needs." },
    ],
  },
  {
    slug: "nano-shule",
    name: "NanoShule",
    subtitle: "School Management System",
    categorySlug: "education",
    color: "#0d9488", bgColor: "rgba(13,148,136,0.1)",
    description: "An enterprise resource planning solution tailored for educational institutions, with an intuitive interface that lets staff manage student information, academic records, finances, and HR data. Built for mobile access so parents, teachers, and administrators can reach data remotely.",
    features: ["Comprehensive student data management", "Academic records & reporting", "Financial tracking & fee management", "Human resources information system", "Mobile access for remote data retrieval", "Advanced reporting tools"],
    benefits: [
      { icon: "🖥️", title: "Centralized Information", description: "All your school data in one place, secure, accurate and easy to access." },
      { icon: "🤝", title: "Better Collaboration", description: "Empower teachers, staff, parents and students to work together seamlessly." },
      { icon: "📈", title: "Improved Efficiency", description: "Automate tasks, save time and focus on what matters most — education." },
      { icon: "🛡️", title: "Secure & Reliable", description: "Enterprise-grade security to protect your data with peace of mind." },
      { icon: "📱", title: "Access Anywhere", description: "Mobile-ready platform so you can manage from anywhere, anytime." },
      { icon: "📊", title: "Data-Driven Decisions", description: "Advanced reporting and insights to help you make smarter decisions." },
    ],
  },
  {
    slug: "nano-assets",
    name: "NanoAssets",
    subtitle: "Asset tagging and management solution",
    categorySlug: "asset-management",
    color: "#0891b2", bgColor: "rgba(8,145,178,0.1)",
    description: "Track, manage and protect your assets throughout their lifecycle. From acquisition to disposal, NanoAssets gives you real-time visibility, accurate data and smarter control over all your assets.",
    features: ["Unique asset tagging (Barcode/QR/RFID)", "Real-time asset tracking", "Lifecycle management", "Maintenance scheduling & alerts", "Audit & compliance reporting", "Multi-location visibility"],
    benefits: [
      { icon: "🔍", title: "Complete Visibility", description: "Know what you have, where it is and who is using it." },
      { icon: "✅", title: "Reduce Costs", description: "Minimise loss, theft and redundant purchases." },
      { icon: "⏱️", title: "Prolong Asset Life", description: "Plan maintenance and extend the useful life of your assets." },
      { icon: "📋", title: "Compliance Ready", description: "Stay audit-ready with accurate records and reports." },
      { icon: "📈", title: "Data-Driven Decisions", description: "Reliable insights to help you plan and allocate resources better." },
    ],
  },
  {
    slug: "nano-recrute",
    name: "NanoRecrute",
    subtitle: "Recruitment Management System",
    categorySlug: "hcm",
    color: "#7c3aed", bgColor: "rgba(124,58,237,0.1)",
    description: "NanoRecrute is an end-to-end recruitment management system that helps you attract, evaluate, hire and onboard the best talent — faster and more efficiently.",
    features: ["Job requisition & approval", "Multi-channel job posting", "Applicant tracking", "Interview scheduling & scorecards", "Offer & onboarding management", "Reports & analytics"],
    benefits: [
      { icon: "🎯", title: "Hire Better Talent", description: "Find and hire the right candidates faster." },
      { icon: "⏰", title: "Save Time", description: "Automate repetitive tasks and focus on what matters." },
      { icon: "🔒", title: "Secure & Compliant", description: "Role-based access and data security you can trust." },
      { icon: "💰", title: "Reduce Hiring Costs", description: "Streamline your process and reduce time-to-hire and costs." },
      { icon: "📊", title: "Data-Driven Decisions", description: "Powerful analytics to improve your hiring strategy." },
      { icon: "📱", title: "Access Anywhere", description: "Cloud-based platform accessible anytime, anywhere." },
    ],
  },
  {
    slug: "nano-pos",
    name: "NanoPOS",
    subtitle: "Point of Sale with Inventory & Warehousing Management",
    categorySlug: "pos",
    color: "#1e40af", bgColor: "rgba(30,64,175,0.1)",
    description: "NanoPOS is a complete point of sale solution with advanced inventory and warehousing management to help you sell smarter, manage stock efficiently and grow your business.",
    features: ["Multi-outlet point of sale", "Barcode & QR scanning", "Real-time inventory & stock tracking", "Warehouse management & stock transfers", "Purchases & supplier management", "Customer management & sales analytics"],
    benefits: [
      { icon: "🏷️", title: "Increase Sales", description: "Speed up checkout and improve customer satisfaction." },
      { icon: "📦", title: "Accurate Inventory", description: "Real-time tracking reduces stockouts and overstocking." },
      { icon: "🏭", title: "Efficient Warehousing", description: "Organized warehouses and transfers improve operational efficiency." },
      { icon: "💵", title: "Improve Profitability", description: "Better control of costs, pricing and inventory leads to higher profits." },
      { icon: "🛡️", title: "Secure & Reliable", description: "Role-based access and data security keep your business safe." },
      { icon: "☁️", title: "Access Anywhere", description: "Cloud-based platform accessible from any device, anytime." },
    ],
  },
  {
    slug: "nano-club",
    name: "NanoClub",
    subtitle: "The all-in-one solution for sports clubs",
    categorySlug: "club-management",
    color: "#0096D6", bgColor: "rgba(0,150,214,0.1)",
    description: "Streamline your club operations, engage members and grow your community with NanoClub — the complete club management system built for today's sports organizations.",
    features: ["Membership & subscription management", "Team & player management", "Event & fixture management", "Facility & booking management", "Finance & payments tracking", "Communication hub for members"],
    benefits: [
      { icon: "🤝", title: "Stronger Community", description: "Build a connected club community and improve member engagement." },
      { icon: "🔒", title: "Secure & Reliable", description: "Your club data is safe with role-based access and secure backups." },
      { icon: "⏰", title: "Save Time", description: "Automate processes and reduce admin workload so you can focus on sport." },
      { icon: "📈", title: "Grow Revenue", description: "Improve collections, manage finances better and unlock new revenue streams." },
      { icon: "📱", title: "Access Anywhere", description: "Cloud-based platform accessible from any device, anytime, anywhere." },
      { icon: "🎧", title: "Great Support", description: "Local support team here to help you succeed." },
    ],
  },
  {
    slug: "nano-time",
    name: "Nano Time",
    subtitle: "An accurate, fast solution for tracking time and attendance",
    categorySlug: "hcm",
    color: "#059669", bgColor: "rgba(5,150,105,0.1)",
    description: "Workforce management combining biometric time tracking with payroll integration — answers who, where and when employees are working, with automated time tracking and seamless Nano Pay integration.",
    features: ["Biometric clock-in technology", "Real-time time & attendance data", "Seamless Nano Pay integration", "Reduces data duplication & errors", "Accurate, accessible records", "Customizable & flexible policies"],
    benefits: [
      { icon: "🔐", title: "Accurate & Reliable", description: "Biometric technology ensures employees clock in and out accurately." },
      { icon: "⏱️", title: "Real-Time Visibility", description: "See who's working, where and when — in real-time." },
      { icon: "🔗", title: "Seamless Integration", description: "Works perfectly with Nano Pay for automated payroll processing." },
      { icon: "📈", title: "Increase Productivity", description: "Reduce time theft and improve accountability across your organization." },
      { icon: "🛡️", title: "Secure & Compliant", description: "Your data is safe with role-based access and audit-ready reports." },
      { icon: "⚙️", title: "Flexible & Scalable", description: "Customize to fit your policies today and grow with you tomorrow." },
    ],
  },
  {
    slug: "florena",
    name: "Florena",
    // Description/features already reconciled against the real live site —
    // only adding the benefits strip here, not touching the rest.
    benefitsOnly: true,
    benefits: [
      { icon: "☁️", title: "Access Anywhere", description: "Secure, remote access to your farm data, anytime, anywhere." },
      { icon: "👥", title: "Better Decisions", description: "Real-time insights to help you make smarter, faster decisions." },
      { icon: "📈", title: "Increase Productivity", description: "Streamline operations and improve resource utilization." },
      { icon: "🛡️", title: "Secure & Reliable", description: "Your data is protected with robust security and backups." },
      { icon: "🎧", title: "Local Support", description: "Local team, local understanding. We're here to help." },
    ],
  },
];

async function main() {
  const catMap = {};
  for (const c of NEW_CATEGORIES) {
    const [cat, created] = await ProductCategory.findOrCreate({ where: { slug: c.slug }, defaults: c });
    catMap[c.slug] = cat.id;
    console.log(created ? `+ Category created: ${cat.name}` : `= Category exists: ${cat.name}`);
  }
  // Look up ids for the pre-existing categories these products slot into too.
  const existingCats = await ProductCategory.findAll({ where: { slug: ["security", "education", "hcm", "asset-management", "erp"] } });
  for (const c of existingCats) catMap[c.slug] = c.id;

  const maxOrderRow = await Product.findOne({ order: [["order", "DESC"]] });
  let nextOrder = (maxOrderRow ? maxOrderRow.order : 0) + 1;

  for (const p of PRODUCTS) {
    const existing = await Product.findOne({ where: { slug: p.slug } });

    if (p.benefitsOnly) {
      if (existing) {
        await existing.update({ benefits: p.benefits });
        console.log(`= Updated benefits only: ${p.name}`);
      } else {
        console.log(`! Skipped (not found): ${p.slug}`);
      }
      continue;
    }

    const categoryId = catMap[p.categorySlug] || null;
    const fields = {
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      features: p.features,
      benefits: p.benefits,
      color: p.color,
      bgColor: p.bgColor,
      categoryId,
      lifecycleStatus: "active",
      slaLevel: "standard",
      targetAudience: "SMEs, Corporates, Institutions",
      active: true,
    };

    if (existing) {
      await existing.update(fields); // preserves image/brochureUrl/order/clientCount
      console.log(`= Updated: ${p.name}`);
    } else {
      await Product.create({ ...fields, slug: p.slug, order: nextOrder++ });
      console.log(`+ Created: ${p.name}`);
    }
  }

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
