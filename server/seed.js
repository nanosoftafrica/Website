const fs = require('fs');
const path = require('path');

for (const filename of ['.env.local', '.env']) {
  const envPath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(envPath)) continue;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined && value) process.env[key] = value;
  }
}

const sequelize       = require('./db');
const Admin           = require('./models/platform/Admin');
const Content         = require('./models/cms/Content');
const ProductCategory = require('./models/catalog/ProductCategory');
const Product         = require('./models/catalog/Product');
const Team            = require('./models/cms/Team');
const Event           = require('./models/cms/Event');
const Testimonial     = require('./models/cms/Testimonial');
const MenuItem        = require('./models/cms/MenuItem');
require('./models/platform/AuditLog');
require('./models/crm/Company');
require('./models/crm/Contact');
require('./models/crm/Deal');
require('./models/crm/Message');
require('./models/fulfillment/Supplier');
require('./models/fulfillment/Technician');
require('./models/fulfillment/ServiceRequest');
require('./models/fulfillment/Incident');

function registerAllModels(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const modelPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      registerAllModels(modelPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      require(modelPath);
    }
  }
}

async function seed() {
  registerAllModels(path.join(__dirname, 'models'));
  await sequelize.sync();

  // ── Admin ─────────────────────────────────────────────────
  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const existingAdmin = await Admin.findOne({ where: { username } });
  if (!existingAdmin && !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD must be set (in .env.local) before the initial admin account is created.');
  }
  const [, adminCreated] = await Admin.findOrCreate({
    where:    { username },
    defaults: { password: process.env.ADMIN_PASSWORD, role: 'super_admin' },
  });
  console.log(adminCreated ? '✓ Admin created' : '✓ Admin already exists');

  // ── Content singleton ─────────────────────────────────────
  const existing = await Content.findOne();
  if (!existing) {
    await Content.create({
      hero: {
        badge: '22+ Years of IT Excellence Across Africa',
        headingLine1: 'State of the Art',
        headingLine2: 'IT Solutions',
        headingLine3: 'for Your Business',
        subheading: 'Nanosoft Technology delivers world-class ERP software, biometric security, and IT consultancy to businesses across Africa.',
        primaryCta:   { text: 'Get a Free Consultation', href: '#contact' },
        secondaryCta: { text: 'Explore Our Products',    href: '#products' },
        stats: [
          { value: '22+',   label: 'Years Experience' },
          { value: '500+',  label: 'Clients Served'   },
          { value: '50+',   label: 'IT Specialists'   },
          { value: '99.9%', label: 'Uptime SLA'       },
        ],
      },
      company: {
        name:        'Nanosoft Technology',
        tagline:     'We Mind Your Business',
        about:       'Nanosoft Technology is a leading IT solutions provider based in Nairobi, Kenya. Since 2001 we have been delivering innovative ERP software, biometric systems, asset management, and IT infrastructure solutions that empower businesses across East Africa.',
        mission:     'To provide innovative, reliable, and affordable technology solutions that empower businesses across East Africa to achieve their full potential.',
        vision:      'To be the most trusted technology partner for businesses in East Africa, driving digital transformation and economic growth across the continent.',
        values:      ['Innovation', 'Integrity', 'Excellence', 'Customer Focus', 'Teamwork'],
        foundedYear: 2001,
        address:     'Kanjata Road, Lavington, Nairobi, Kenya',
        phone:       '0734 818 350',
        email:       'Info@ntlafrica.com',
        hours:       'Mon – Fri, 8:30 AM – 6:00 PM EAT',
        instagram:   'https://www.instagram.com/nanosofttechnologiesltdke/',
        linkedin:    'https://www.linkedin.com/company/nanosoft-technologieskenya/',
        facebook:    '',
        liveChatId:  '',   // paste your Tawk.to widget ID here to enable live chat
      },
      services: [
        { icon: '📋', title: 'Payroll takes days — and still has errors',       description: 'Excel sheets, manual PAYE calculations, NSSF errors. Every month is a fire drill. Your HR team burns hours on what should take minutes.', solve: 'NanoPay automates it', order: 1 },
        { icon: '🔌', title: "Your systems don't talk to each other",           description: 'Inventory in one app, accounts in another, HR in a spreadsheet. Data is duplicated, decisions are delayed, and nothing is real-time.',    solve: 'Our ERP connects everything', order: 2 },
        { icon: '🔒', title: "You can't see who enters your premises",          description: 'Tailgating, time theft, unauthorised access. You only find out about security problems after the damage is done.',                       solve: 'Biometric Access solves it', order: 3 },
      ],
      clients: [
        { name: 'Kenya Airways'  },
        { name: 'Equity Bank'    },
        { name: 'Safaricom'      },
        { name: 'KCB Bank'       },
        { name: 'Nation Media'   },
        { name: 'KPLC'           },
        { name: 'UAP Insurance'  },
        { name: 'Radisson Blu'   },
      ],
      processSteps: [
        { number: '1', icon: '🎯', title: 'Free consultation',        description: 'We learn your business, your team size, and your pain points. We recommend the right product — not the most expensive one.' },
        { number: '2', icon: '⚙️', title: 'Configure & train',        description: "Our engineers set everything up, migrate your data, and train your staff on-site or remotely. We don't leave until it works." },
        { number: '3', icon: '📞', title: 'Local support, always on', description: "A real Nairobi-based team. Call, WhatsApp, or email. We're here when something breaks — because we know downtime costs money." },
      ],
      seo: {
        title:       'Nanosoft Technology — ERP Software, Biometric & IT Solutions | Nairobi, Kenya',
        description: 'Nanosoft Technology delivers ERP systems, biometric security, asset management, and IT infrastructure solutions to businesses across Africa. 22+ years of experience.',
        keywords:    'ERP software Kenya, biometric attendance Kenya, school management system, HR payroll Kenya, agricultural ERP, asset management Kenya, IT solutions Nairobi',
        ogImage:     '/assets/og-image.jpg',
        canonical:   'https://ntlafrica.com',
      },
    });
    console.log('✓ Content seeded');
  } else {
    console.log('✓ Content already exists');
  }

  // ── Product Categories (ITIL Service Catalog) ────────────
  // serviceType: business | technical | supporting  (ITIL v4)
  const CATEGORIES = [
    { name: 'Human Capital Management', slug: 'hcm',            icon: '👥', color: '#0096D6', order: 1, serviceType: 'business',   serviceTypeLabel: 'Business Service', description: 'Payroll, HR, attendance and workforce management solutions.' },
    { name: 'Enterprise Resource Planning', slug: 'erp',        icon: '🏭', color: '#0369A1', order: 2, serviceType: 'business',   serviceTypeLabel: 'Business Service', description: 'Integrated ERP systems for agriculture, real estate and specialised industries.' },
    { name: 'Healthcare Information Systems', slug: 'healthcare',icon: '🏥', color: '#0E7490', order: 3, serviceType: 'business',   serviceTypeLabel: 'Business Service', description: 'Patient management, clinical records and hospital operations software.' },
    { name: 'Education Management', slug: 'education',          icon: '🎓', color: '#0369A1', order: 4, serviceType: 'business',   serviceTypeLabel: 'Business Service', description: 'School ERP, LMS and academic management systems.' },
    { name: 'Security & Access Control', slug: 'security',      icon: '🔒', color: '#1D4ED8', order: 5, serviceType: 'technical',  serviceTypeLabel: 'Technical Service', description: 'Biometric access, CCTV, visitor management and physical security.' },
    { name: 'IT Infrastructure & Managed Services', slug: 'infrastructure', icon: '🖥️', color: '#29ABE2', order: 6, serviceType: 'technical', serviceTypeLabel: 'Technical Service', description: 'Managed IT, networking, cloud, backup and 24/7 support services.' },
    { name: 'Asset Management', slug: 'asset-management',       icon: '📦', color: '#6366F1', order: 7, serviceType: 'supporting', serviceTypeLabel: 'Supporting Service', description: 'Asset tagging, tracking, lifecycle and compliance management.' },
    { name: 'Business Automation & BI', slug: 'automation-bi',  icon: '⚙️', color: '#8B5CF6', order: 8, serviceType: 'supporting', serviceTypeLabel: 'Supporting Service', description: 'Workflow automation, business intelligence and digital analytics.' },
  ];

  const catMap = {};
  for (const c of CATEGORIES) {
    const [cat, created] = await ProductCategory.findOrCreate({ where: { slug: c.slug }, defaults: c });
    catMap[c.slug] = cat.id;
    if (created) console.log(`  + Category: ${cat.name}`);
  }
  console.log('✓ Product categories seeded');

  // ── Products ──────────────────────────────────────────────
  const products = [

    // ── ERP Solutions ─────────────────────────────────────────
    { category: 'ERP Solutions', order: 1,
      name: 'Agrena', subtitle: 'Agricultural Management ERP', slug: 'agrena',
      description: 'Agrena is a comprehensive agricultural ERP designed for farm management, crop tracking, input procurement, harvest recording, and financial management for agribusinesses across Africa.',
      features: ['Farm & field management', 'Crop cycle & harvest tracking', 'Input & inventory procurement', 'Labour & payroll integration', 'Financial reporting & compliance', 'Mobile field data capture'],
      color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)' },

    { category: 'ERP Solutions', order: 2,
      name: 'Florena', subtitle: 'Flower Farm Management ERP', slug: 'florena',
      description: 'Purpose-built for flower farm operations — managing grading, cold-room inventory, export logistics, quality control, and compliance reporting for floriculture businesses.',
      features: ['Grading & stem counting', 'Cold-room & inventory management', 'Export & logistics tracking', 'Quality control & reject analysis', 'Customer order management', 'Phytosanitary compliance reporting'],
      color: '#ec4899', bgColor: 'rgba(236,72,153,0.1)' },

    { category: 'ERP Solutions', order: 3,
      name: 'NanoPay HR', subtitle: 'HR & Payroll ERP with Biometrics', slug: 'nanopay-hr',
      description: 'An all-in-one human resource and payroll ERP with seamless biometric integration. Handles PAYE, NHIF, NSSF, leave, appraisals, and workforce analytics for Kenyan businesses.',
      features: ['Biometric attendance integration', 'PAYE, NHIF & NSSF compliance', 'Leave & appraisal management', 'Payslip generation & bank transfers', 'Employee self-service portal', 'Multi-branch & multi-company'],
      color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },

    { category: 'ERP Solutions', order: 4,
      name: 'Hospital Management ERP', subtitle: 'Healthcare Operations & Patient Management', slug: 'hospital-erp',
      description: 'A complete hospital management system covering patient registration, OPD/IPD, pharmacy, laboratory, billing, and clinical records for healthcare facilities.',
      features: ['Patient registration & EMR', 'OPD, IPD & theatre management', 'Pharmacy & laboratory management', 'Insurance & billing integration', 'Medical inventory control', 'NHIF & SHA scheme support'],
      color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },

    { category: 'ERP Solutions', order: 5,
      name: 'Real Estate ERP', subtitle: 'Property, Tenant, Lease & Facility Management', slug: 'real-estate-erp',
      description: 'A powerful property management ERP for real estate developers and property managers — covering tenant management, lease agreements, rent collection, maintenance, and financials.',
      features: ['Property & unit management', 'Tenant onboarding & lease tracking', 'Rent invoicing & M-Pesa integration', 'Maintenance request workflow', 'Facility & utilities management', 'Financial reporting & landlord statements'],
      color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },

    { category: 'ERP Solutions', order: 6,
      name: 'Systematic', subtitle: 'Accounting & Project-Based Accounting ERP', slug: 'systematic',
      description: 'A robust accounting and project ERP for businesses that need multi-dimensional financial management, project costing, and statutory compliance in one platform.',
      features: ['Double-entry general ledger', 'Project-based cost accounting', 'Accounts payable & receivable', 'Bank reconciliation & cash flow', 'VAT, WHT & tax compliance', 'Multi-currency & multi-entity'],
      color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)' },

    { category: 'ERP Solutions', order: 7,
      name: 'School ERP & LMS', subtitle: 'Academic, Administrative & E-Learning Management', slug: 'school-erp-lms',
      description: 'A complete school management and learning management system covering admissions, academics, fee collection, e-learning, parent communication, and institutional reporting.',
      features: ['Admissions & student records', 'Fee collection & receipts', 'Academic scheduling & exams', 'E-learning & online classes', 'Parent & guardian portal', 'SMS & notification system'],
      color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)' },

    // ── Biometric & Security ───────────────────────────────────
    { category: 'Biometric & Security', order: 8,
      name: 'Biometric Attendance Systems', subtitle: 'Automated Time & Attendance Tracking', slug: 'biometric-attendance',
      description: 'Fingerprint and facial recognition attendance systems that integrate directly with HR and payroll, eliminating manual timesheets and buddy punching.',
      features: ['Fingerprint & face recognition', 'Real-time attendance tracking', 'Payroll & HR integration', 'Shift & overtime management', 'Cloud-based reports & alerts', 'Multi-location support'],
      color: '#0ea5e9', bgColor: 'rgba(14,165,233,0.1)' },

    { category: 'Biometric & Security', order: 9,
      name: 'Access Control Systems', subtitle: 'Biometric & Card-Based Access Control', slug: 'access-control',
      description: 'Intelligent biometric and card-based access control systems for offices, warehouses, and secured zones — with audit trails and remote management.',
      features: ['Fingerprint, card & PIN access', 'Zone-based access restrictions', 'Real-time audit trails', 'Remote door management', 'Integration with CCTV', 'Anti-passback & time zones'],
      color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)' },

    { category: 'Biometric & Security', order: 10,
      name: 'Visitor Management Systems', subtitle: 'Digital Visitor Registration & Tracking', slug: 'visitor-management',
      description: 'Paperless visitor registration with ID scanning, host notifications, badge printing, and full audit trails for corporate and institutional premises.',
      features: ['Digital visitor registration', 'ID & passport scanning', 'Host SMS/email notification', 'Visitor badge printing', 'Watchlist & blacklist screening', 'Visit history & reporting'],
      color: '#14b8a6', bgColor: 'rgba(20,184,166,0.1)' },

    { category: 'Biometric & Security', order: 11,
      name: 'CCTV & Security Solutions', subtitle: 'IP CCTV, Surveillance & Physical Security', slug: 'cctv-security',
      description: 'End-to-end CCTV surveillance, alarm systems, and physical security solutions for commercial, institutional, and residential premises.',
      features: ['HD IP & PTZ cameras', 'Night vision & analytics', 'Remote live monitoring', 'Cloud & NVR storage', 'Alarm & intrusion detection', 'Professional installation & support'],
      color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },

    { category: 'Biometric & Security', order: 12,
      name: 'Biometric Hardware Devices', subtitle: 'Fingerprint, Face & Iris Devices', slug: 'biometric-hardware',
      description: 'Supply and support of leading biometric hardware devices from ZKTeco, Suprema, and other trusted brands for attendance, access control, and security applications.',
      features: ['Fingerprint readers & terminals', 'Facial recognition devices', 'Iris scanning systems', 'Turnstiles & barriers', 'SDK & API integration support', 'Warranty & on-site support'],
      color: '#1BA0D8', bgColor: 'rgba(27,160,216,0.1)' },

    // ── Asset Management ───────────────────────────────────────
    { category: 'Asset Management', order: 13,
      name: 'Asset Tagging Systems', subtitle: 'Barcode & RFID Asset Tagging', slug: 'asset-tagging',
      description: 'Professional asset tagging using barcodes, QR codes, and RFID to uniquely identify and register every asset in your organisation.',
      features: ['Barcode & QR code tagging', 'RFID asset labels', 'Asset register population', 'Mobile scanning app', 'Custom label printing', 'Physical verification audits'],
      color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },

    { category: 'Asset Management', order: 14,
      name: 'Asset Tracking & Management', subtitle: 'Full Asset Lifecycle Tracking', slug: 'asset-tracking',
      description: 'A comprehensive platform to monitor, maintain, and optimise the full lifecycle of your physical assets from acquisition to disposal.',
      features: ['Asset register & classification', 'Location & custodian tracking', 'Preventive maintenance scheduling', 'Depreciation & financial reporting', 'Asset transfer & disposal workflows', 'Audit & compliance reporting'],
      color: '#d97706', bgColor: 'rgba(217,119,6,0.1)' },

    { category: 'Asset Management', order: 15,
      name: 'Inventory & Asset Lifecycle', subtitle: 'Inventory Control & Lifecycle Management', slug: 'inventory-lifecycle',
      description: 'Integrated inventory and asset lifecycle management to control stock levels, track consumables, manage suppliers, and ensure optimal asset utilisation.',
      features: ['Stock & consumables management', 'GRN & procurement integration', 'Reorder level & alerts', 'Supplier & contract management', 'Asset utilisation analytics', 'Integration with ERP systems'],
      color: '#92400e', bgColor: 'rgba(146,64,14,0.1)' },

    // ── Business Automation ────────────────────────────────────
    { category: 'Business Automation', order: 16,
      name: 'Workflow Automation', subtitle: 'Business Process Automation', slug: 'workflow-automation',
      description: 'Digitise and automate your business workflows — from approvals and procurement to HR onboarding — eliminating paper processes and reducing turnaround time.',
      features: ['Custom workflow design', 'Multi-step approvals & escalations', 'Form digitisation', 'Email & SMS notifications', 'Audit trails & compliance', 'Integration with existing systems'],
      color: '#7c3aed', bgColor: 'rgba(124,58,237,0.1)' },

    { category: 'Business Automation', order: 17,
      name: 'Data Analytics & BI', subtitle: 'Business Intelligence & Analytics', slug: 'data-analytics-bi',
      description: 'Transform your business data into actionable insights with custom dashboards, reports, and business intelligence solutions built on leading BI platforms.',
      features: ['Custom dashboards & KPIs', 'Data integration & ETL pipelines', 'Power BI & Tableau solutions', 'Predictive analytics', 'Real-time reporting', 'Data governance & quality'],
      color: '#db2777', bgColor: 'rgba(219,39,119,0.1)' },

    { category: 'Business Automation', order: 18,
      name: 'Digital Marketing Services', subtitle: 'Online Presence & Digital Growth', slug: 'digital-marketing',
      description: 'Grow your business online with professional digital marketing services including website development, SEO, social media management, and digital advertising.',
      features: ['Website design & development', 'SEO & content marketing', 'Social media management', 'Google & social ads', 'Email marketing campaigns', 'Analytics & performance reporting'],
      color: '#be185d', bgColor: 'rgba(190,24,93,0.1)' },

    // ── IT Infrastructure & Managed Services ──────────────────
    { category: 'IT Infrastructure', order: 19,
      name: 'Managed IT Services', subtitle: 'Proactive IT Support & Management', slug: 'managed-it-services',
      description: 'Outsource your IT operations to Nanosoft. We provide proactive monitoring, helpdesk support, patch management, and IT governance to keep your business running.',
      features: ['24/7 monitoring & alerting', 'Helpdesk & remote support', 'Patch & update management', 'IT asset management', 'SLA-backed response times', 'Monthly IT health reports'],
      color: '#0284c7', bgColor: 'rgba(2,132,199,0.1)' },

    { category: 'IT Infrastructure', order: 20,
      name: 'Network & Infrastructure Audits', subtitle: 'IT Health Checks & Assessments', slug: 'network-audit',
      description: 'Comprehensive network and IT infrastructure audits that identify vulnerabilities, performance bottlenecks, and compliance gaps — with a clear remediation roadmap.',
      features: ['Network topology mapping', 'Security vulnerability assessment', 'Performance benchmarking', 'Compliance gap analysis', 'Remediation roadmap', 'Executive & technical reports'],
      color: '#0369a1', bgColor: 'rgba(3,105,161,0.1)' },

    { category: 'IT Infrastructure', order: 21,
      name: 'IT Consultancy & Advisory', subtitle: 'Technology Strategy & Advisory', slug: 'it-consultancy',
      description: 'Strategic IT consultancy to help your organisation align IT investments with business goals, optimise costs, and plan for digital growth.',
      features: ['IT strategy development', 'Technology roadmapping', 'Vendor selection & management', 'Digital transformation advisory', 'Budget & cost optimisation', 'Board-level IT reporting'],
      color: '#1e40af', bgColor: 'rgba(30,64,175,0.1)' },

    { category: 'IT Infrastructure', order: 22,
      name: 'Cybersecurity Solutions', subtitle: 'Enterprise Cybersecurity & Threat Protection', slug: 'cybersecurity',
      description: 'End-to-end cybersecurity solutions including penetration testing, endpoint protection, firewall management, and security awareness training.',
      features: ['Penetration testing & VAPT', 'Endpoint detection & response', 'Firewall & UTM management', 'Email security & anti-phishing', 'Security awareness training', 'Incident response & recovery'],
      color: '#dc2626', bgColor: 'rgba(220,38,38,0.1)' },

    { category: 'IT Infrastructure', order: 23,
      name: 'Cloud & Infrastructure Services', subtitle: 'Cloud Migration & Infrastructure Management', slug: 'cloud-infrastructure',
      description: 'Design, migrate, and manage your cloud and on-premise infrastructure. We work with Microsoft Azure, AWS, and private cloud environments.',
      features: ['Cloud strategy & migration', 'Microsoft Azure & AWS management', 'Server & storage solutions', 'Disaster recovery & backup', 'Virtualisation (VMware/Hyper-V)', 'Infrastructure-as-a-Service'],
      color: '#0096D6', bgColor: 'rgba(0,150,214,0.1)' },
  ];

  // Map legacy category strings to new categoryId
  const CAT_SLUG_MAP = {
    'ERP Solutions':        'erp',
    'Biometric & Security': 'security',
    'Asset Management':     'asset-management',
    'Business Automation':  'automation-bi',
    'IT Infrastructure':    'infrastructure',
  };
  // Override specific products to correct ITIL categories
  const PRODUCT_CAT_OVERRIDES = {
    'nanopay-hr':    'hcm',
    'hospital-erp':  'healthcare',
    'school-erp-lms':'education',
    'agrena':        'erp',
    'florena':       'erp',
  };

  let pCreated = 0, pSkipped = 0;
  for (const p of products) {
    const catSlug = PRODUCT_CAT_OVERRIDES[p.slug] || CAT_SLUG_MAP[p.category] || null;
    const defaults = {
      ...p,
      categoryId:      catSlug ? catMap[catSlug] : null,
      lifecycleStatus: 'active',
      slaLevel:        ['managed-it-services','cybersecurity','cloud-infrastructure'].includes(p.slug) ? 'enterprise' : 'standard',
      targetAudience:  p.category === 'IT Infrastructure' ? 'Enterprises, SMEs, NGOs' : 'SMEs, Corporates, Institutions',
    };
    const [, isNew] = await Product.findOrCreate({ where: { slug: p.slug }, defaults });
    if (!isNew && catSlug) {
      // Backfill categoryId on existing rows
      await Product.update({ categoryId: catMap[catSlug] }, { where: { slug: p.slug } });
    }
    isNew ? pCreated++ : pSkipped++;
  }
  console.log(`✓ Products seeded (${pCreated} new, ${pSkipped} existing)`);

  // ── Team ──────────────────────────────────────────────────
  const team = [
    { name: 'Samuel Mwangi', role: 'Chief Executive Officer',  initials: 'SM',
      gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
      bio: 'Over 20 years of experience in IT solutions and business development across East Africa.', order: 1 },
    { name: 'Grace Wanjiku', role: 'Chief Technology Officer', initials: 'GW',
      gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
      bio: 'Expert in cloud architecture and digital transformation with certifications in AWS, Azure, and GCP.', order: 2 },
    { name: 'David Ochieng', role: 'Head of Infrastructure',   initials: 'DO',
      gradient: 'linear-gradient(135deg,#10b981,#047857)',
      bio: 'Cisco certified network engineer with deep expertise in enterprise networking and cybersecurity.', order: 3 },
    { name: 'Faith Kamau',   role: 'Head of Client Services',  initials: 'FK',
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
      bio: 'Dedicated to delivering exceptional customer experience and building long-term client relationships.', order: 4 },
  ];

  let tCreated = 0, tSkipped = 0;
  for (const t of team) {
    const [, isNew] = await Team.findOrCreate({ where: { name: t.name }, defaults: t });
    isNew ? tCreated++ : tSkipped++;
  }
  console.log(`✓ Team seeded (${tCreated} new, ${tSkipped} existing)`);

  // ── Events / Milestones ───────────────────────────────────
  const events = [
    { title: '22 Years of IT Excellence',        type: 'anniversary',
      subtitle: 'Serving East Africa since 2001', date: '2023',
      description: 'Nanosoft Technology celebrates over two decades of delivering world-class IT solutions to businesses across East Africa. From our first deployment in Nairobi to clients in 10+ countries, we remain committed to innovation and excellence.',
      order: 1, active: true },
    { title: 'Agrena Launch — Agricultural ERP', type: 'milestone',
      subtitle: 'Transforming agribusiness in Africa', date: '2022',
      description: 'We launched Agrena, our flagship Agricultural Management ERP, empowering flower farms, crop farms, and agribusinesses across Kenya and East Africa with end-to-end farm management technology.',
      order: 2, active: true },
    { title: '500+ Clients Milestone',           type: 'milestone',
      subtitle: 'Trusted by businesses across the region', date: '2022',
      description: 'Nanosoft reached the landmark of 500+ satisfied clients spanning healthcare, education, agriculture, finance, and real estate — a testament to our commitment to delivering real business value.',
      order: 3, active: true },
    { title: 'Hospital ERP Goes Live',           type: 'milestone',
      subtitle: 'Digitising healthcare operations', date: '2021',
      description: 'Our Hospital Management ERP was successfully deployed in multiple healthcare facilities, digitising patient records, pharmacy, laboratory, and billing operations.',
      order: 4, active: true },
    { title: 'ISO Certification Achievement',    type: 'award',
      subtitle: 'Quality management excellence', date: '2020',
      description: 'Nanosoft Technology achieved ISO quality management certification, reinforcing our commitment to world-class service delivery and customer satisfaction.',
      order: 5, active: true },
    { title: 'School ERP & LMS Launch',          type: 'milestone',
      subtitle: 'E-learning for Kenyan schools', date: '2020',
      description: 'We launched our School ERP and Learning Management System, enabling schools across Kenya to digitise admissions, fees, academics, and remote learning in one integrated platform.',
      order: 6, active: true },
    { title: 'Best IT Company — Kenya Tech Awards', type: 'award',
      subtitle: 'Recognised for innovation & impact', date: '2019',
      description: 'Nanosoft Technology was recognised as one of Kenya\'s top IT companies for innovation and impact, validating our mission to drive digital transformation across East Africa.',
      order: 7, active: true },
    { title: 'Biometric Division Launch',        type: 'milestone',
      subtitle: 'Expanding into physical security', date: '2018',
      description: 'We launched our Biometric & Security division, introducing fingerprint attendance systems, access control, and visitor management solutions to the East African market.',
      order: 8, active: true },
  ];

  let eCreated = 0, eSkipped = 0;
  for (const e of events) {
    const [, isNew] = await Event.findOrCreate({ where: { title: e.title }, defaults: e });
    isNew ? eCreated++ : eSkipped++;
  }
  console.log(`✓ Events seeded (${eCreated} new, ${eSkipped} existing)`);

  // ── Testimonials ──────────────────────────────────────────
  const testimonials = [
    { name: 'James Kariuki',   role: 'Finance Director',      company: 'Horizon Agri Ltd',
      quote: 'Agrena completely transformed how we run our farm. We now have real-time visibility into every acre, every input, and every harvest. The ROI was evident within the first season.',
      rating: 5, order: 1, active: true },
    { name: 'Dr. Mary Njoroge', role: 'Medical Director',     company: 'Lifecare Hospital',
      quote: 'The Hospital Management ERP from Nanosoft has digitised our entire operation — from patient registration to pharmacy. Our staff efficiency has improved dramatically and billing errors are a thing of the past.',
      rating: 5, order: 2, active: true },
    { name: 'Peter Omondi',    role: 'HR Manager',            company: 'BuildRight Construction',
      quote: 'NanoPay HR cut our payroll processing time from three days to under two hours. The biometric integration is flawless and PAYE compliance is now automatic. Highly recommended.',
      rating: 5, order: 3, active: true },
    { name: 'Sarah Waweru',    role: 'School Principal',      company: 'Greenfield Academy',
      quote: 'The School ERP has been a game-changer for our institution. Parents can now see fees balances, exam results, and communicate with teachers — all in one place. Our admin workload reduced by 60%.',
      rating: 5, order: 4, active: true },
    { name: 'Tom Muthoni',     role: 'Operations Manager',    company: 'Prime Properties Kenya',
      quote: 'Nanosoft\'s Real Estate ERP gave us complete control over our 400+ units. Rent collection, maintenance tracking, and tenant communication are now seamless. The M-Pesa integration is particularly impressive.',
      rating: 5, order: 5, active: true },
    { name: 'Alice Kamau',     role: 'IT Manager',            company: 'Nairobi Flowers Ltd',
      quote: 'Florena was built exactly for businesses like ours. Grading, cold-room management, export documentation — all in one system. Our export compliance reporting that used to take days now takes minutes.',
      rating: 5, order: 6, active: true },
  ];

  let tsCreated = 0, tsSkipped = 0;
  for (const t of testimonials) {
    const [, isNew] = await Testimonial.findOrCreate({ where: { name: t.name, company: t.company }, defaults: t });
    isNew ? tsCreated++ : tsSkipped++;
  }
  console.log(`✓ Testimonials seeded (${tsCreated} new, ${tsSkipped} existing)`);

  // ── Navigation Menu ─────────────────────────────────────────
  // Five Ws as the nav spine — one pill per question, storyboard order:
  // intro (Who) first, then the pitch (Why/What/How), close with Where.
  // Blog is intentionally not in the primary nav (reachable via footer).
  const menuItems = [
    { label: 'Who',   href: '/#about',    order: 1 },
    { label: 'Why',   href: '/#pain',     order: 2 },
    { label: 'Solutions',    href: '/products',     order: 3 },
    { label: 'How',          href: '/#how',         order: 4 },
    { label: 'Case Studies', href: '/case-studies', order: 5 },
    { label: 'Where',        href: '/#demo',        order: 6 },
  ];

  let mCreated = 0, mSkipped = 0;
  // Older databases have the pre-rename 'What' link; turn it into Solutions instead of adding a duplicate.
  await MenuItem.update({ label: 'Solutions', href: '/products' }, { where: { label: 'What', href: '/#products' } });
  await MenuItem.update({ order: 6 }, { where: { label: 'Where', href: '/#demo' } });
  for (const m of menuItems) {
    const [, isNew] = await MenuItem.findOrCreate({ where: { label: m.label }, defaults: m });
    isNew ? mCreated++ : mSkipped++;
  }
  console.log(`✓ Menu items seeded (${mCreated} new, ${mSkipped} existing)`);

  // ── Sample CRM data (local/dev only, clearly fictional) ──
  // Gives the admin deal / service-request / incident forms something to pick.
  const Company = require('./models/crm/Company');
  const Contact = require('./models/crm/Contact');
  const sampleCompanies = [
    { name: 'Sample Co A (example data)', domain: 'example.com', industry: 'Education', notes: 'Fictional sample company created by the seed script.' },
    { name: 'Sample Co B (example data)', domain: 'example.org', industry: 'Agriculture', notes: 'Fictional sample company created by the seed script.' },
  ];
  const companyIds = [];
  for (const c of sampleCompanies) {
    const [row] = await Company.findOrCreate({ where: { name: c.name }, defaults: c });
    companyIds.push(row.id);
  }
  const sampleContacts = [
    { firstName: 'Sample', lastName: 'Contact One', email: 'sample.contact1@example.com', jobTitle: 'IT Manager', companyId: companyIds[0], notes: 'Fictional sample contact.' },
    { firstName: 'Sample', lastName: 'Contact Two', email: 'sample.contact2@example.com', jobTitle: 'Operations Lead', companyId: companyIds[1], notes: 'Fictional sample contact.' },
  ];
  let ctCreated = 0;
  for (const c of sampleContacts) {
    const [, isNew] = await Contact.findOrCreate({ where: { email: c.email }, defaults: c });
    if (isNew) ctCreated++;
  }
  console.log(`Sample CRM data seeded (${companyIds.length} companies, ${ctCreated} new contacts)`);

  console.log('\n✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
