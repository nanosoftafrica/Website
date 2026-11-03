import type { Company, FooterSection, ProductSummary } from "@/lib/db";
import { waNumber } from "@/lib/whatsapp";
import NewsletterForm from "./NewsletterForm";

export default function Footer({
  company,
  allProducts,
  section,
}: {
  company: Company;
  allProducts: ProductSummary[];
  section?: FooterSection;
}) {
  const phoneDigits = company.phone ? company.phone.replace(/\D/g, "") : "";
  const telHref = company.phone ? `tel:+254${phoneDigits.replace(/^0/, "")}` : "tel:+254734818350";
  const waHref = `https://wa.me/${waNumber(company.phone)}`;

  return (
    <footer className="home-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo" style={{ gap: 10 }}>
              {company.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo} alt={company.name || "Nanosoft Technologies"} className="nav-logo-img footer-logo-img" />
              ) : (
                <>
                  <div className="logo-mark">N</div>
                  <div className="logo-text">
                    <span style={{ color: "#fff" }}>Nanosoft</span>
                    <span style={{ color: "rgba(255,255,255,.35)" }}>Technology</span>
                  </div>
                </>
              )}
            </a>
            <p>{company.tagline ? `"${company.tagline}"` : section?.tagline || `"We mind your business" — delivering IT solutions across Africa since 2001.`}</p>
            <div className="footer-social">
              <a
                className="fsoc"
                href={company.linkedin || "https://linkedin.com"}
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                data-analytics-event="social_click"
                data-analytics-category="Social"
                data-analytics-label="LinkedIn"
              >
                in
              </a>
              {company.instagram && (
                <a
                  className="fsoc"
                  href={company.instagram}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  data-analytics-event="social_click"
                  data-analytics-category="Social"
                  data-analytics-label="Instagram"
                >
                  📷
                </a>
              )}
              {company.facebook && (
                <a
                  className="fsoc"
                  href={company.facebook}
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  data-analytics-event="social_click"
                  data-analytics-category="Social"
                  data-analytics-label="Facebook"
                >
                  f
                </a>
              )}
              <a
                className="fsoc"
                href={waHref}
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                data-analytics-event="contact_whatsapp"
                data-analytics-category="Contact"
                data-analytics-label="Footer WhatsApp"
              >
                💬
              </a>
            </div>
            <NewsletterForm />
          </div>
          <div className="footer-col">
            <h4>{section?.productsHeading || "Products"}</h4>
            <ul>
              {allProducts.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <a
                    href={`/products/${p.slug}`}
                    data-analytics-event="view_product"
                    data-analytics-category="Products"
                    data-analytics-label={p.name}
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>{section?.companyHeading || "Company"}</h4>
            <ul>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/#testimonials">Clients</a>
              </li>
              <li>
                <a href="/#demo">Contact</a>
              </li>
              <li>
                <a
                  href={telHref}
                  data-analytics-event="contact_phone"
                  data-analytics-category="Contact"
                  data-analytics-label={company.phone || "0734 818 350"}
                >
                  {company.phone || "0734 818 350"}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email || "info@ntlafrica.com"}`}
                  data-analytics-event="contact_email"
                  data-analytics-category="Contact"
                  data-analytics-label={company.email || "info@ntlafrica.com"}
                >
                  {company.email || "info@ntlafrica.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Nanosoft Technologies Limited. All rights reserved.</span>
          <div className="footer-links">
            <a href="/admin/">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
