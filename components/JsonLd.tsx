export default function JsonLd({
  title = "Nanosoft Technologies",
  description = "ERP, biometric, and managed IT solutions for African enterprises.",
  url = "https://ntlafrica.com",
  phone = "+254734818350",
  email = "info@ntlafrica.com",
}: {
  title?: string;
  description?: string;
  url?: string;
  phone?: string;
  email?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "Nanosoft Technologies Limited",
        url: url,
        logo: `${url}/logo.png`,
        description: description,
        email: email,
        telephone: phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
        sameAs: [
          "https://www.facebook.com/nanosofttechnology",
          "https://www.linkedin.com/company/nanosoft-technology",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${url}/#localbusiness`,
        name: "Nanosoft Technologies Limited",
        url: url,
        description: description,
        telephone: phone,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url: url,
        name: title,
        description: description,
        publisher: {
          "@id": `${url}/#organization`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
