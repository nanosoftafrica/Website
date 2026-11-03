// One-off backfill: seeds the new `sections` JSONB column (and a few new
// `hero` keys) on the Content singleton with the exact copy that was
// previously hardcoded in the home components, so the site's visible output
// doesn't change the moment those components switch to reading from the DB.
// Safe to re-run — only fills in keys that are still empty.
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const Content = require("../server/models/cms/Content");

const HERO_DEFAULTS = {
  eyebrow: "25 years serving businesses across Kenya",
  headlineMain: "Run your business",
  headlineEmphasis: "IT headache",
  subhead:
    "Payroll & HR, biometric time & attendance, access control, and CCTV security — built for how Kenyan businesses actually work. Local support that actually shows up. One team, one call.",
  ctaPrimaryLabel: "Book a Free Demo",
  ctaSecondaryLabel: "See All Solutions",
};

const SECTIONS_DEFAULTS = {
  clients: { label: "Trusted by leading organisations across Africa" },
  testimonials: { label: "What clients say", heading: "Real businesses. Real results." },
  about: { label: "01 · Who We Are" },
  pain: {
    label: "02 · Why Nanosoft",
    heading: "Sound familiar?",
    subhead: "Most growing businesses in Kenya hit the same walls. We built Nanosoft to knock them down.",
  },
  products: {
    label: "03 · What We Offer",
    heading: "One trusted partner.\nEvery business need.",
    subhead: "Purpose-built for African businesses — from payroll to ERP to biometric security. All with full local support.",
  },
  how: {
    label: "04 · How It Works",
    heading: "",
    subhead: "No long procurement cycles. No consultant hand-off. Our team works with you directly from day one.",
  },
  insights: { label: "From The Blog", heading: "Latest Insights" },
  demo: {
    label: "Book a Demo",
    heading: "See Nanosoft in your business — free, no pressure",
    subhead: "We show you exactly the product that fits your business, live. Every question answered on the spot. No sales scripts.",
    checklist: [
      "Live 30-minute personalised walkthrough",
      "Tailored to your industry and business size",
      "Response within 1 business day",
      "No contracts, no hidden pressure",
      "Nairobi-based team — we can visit you",
    ],
    formHeading: "Request your free demo",
    submitLabel: "Book My Free Demo →",
    successMessage: "✓ Request received! Our team will reach out within 1 business day.",
    errorMessage: "Something went wrong — call us directly on 0734 818 350.",
    contactLabels: { office: "Head Office", phone: "Call Us", email: "Email Us", hours: "Business Hours" },
  },
  footer: {
    tagline: '"We mind your business" — delivering IT solutions across Africa since 2001.',
    productsHeading: "Products",
    companyHeading: "Company",
  },
};

// About's h2 used to be a hardcoded template ("${years}+ Years Serving...")
// plus a hardcoded sentence force-appended after the CMS `about` field. The
// component now reads `about` verbatim with no append, so fold that sentence
// into the real about text once here rather than losing it.
const ABOUT_APPEND =
  "From one payroll system to Kenya's AI-powered future — every business we've served and every teammate who's joined has shaped where we're headed next.";

async function main() {
  const doc = await Content.getSingleton();

  const hero = { ...HERO_DEFAULTS, ...doc.hero };
  doc.hero = hero;
  doc.changed("hero", true);

  const sections = { ...doc.sections };
  for (const [key, defaults] of Object.entries(SECTIONS_DEFAULTS)) {
    sections[key] = { ...defaults, ...sections[key] };
  }
  doc.sections = sections;
  doc.changed("sections", true);

  const company = { ...doc.company };
  if (company.about && !company.about.includes("AI-powered future")) {
    company.about = `${company.about} ${ABOUT_APPEND}`;
  } else if (!company.about) {
    company.about =
      "Nairobi-based IT partner delivering ERP, biometric, and infrastructure solutions built for how African businesses actually work. " +
      ABOUT_APPEND;
  }
  doc.company = company;
  doc.changed("company", true);

  await doc.save();
  console.log("Backfilled hero, sections, and about text.");
  console.log(JSON.stringify({ hero: doc.hero, sections: doc.sections, about: doc.company.about }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
