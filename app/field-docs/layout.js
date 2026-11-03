import './field-docs.css';

export const metadata = {
  title: { default: 'Field Docs', template: '%s · Field Docs' },
  applicationName: 'Nanosoft Field Docs',
  icons: { apple: '/field-docs/icon-192.png' },
  appleWebApp: { capable: true, title: 'Field Docs' },
};

export const viewport = {
  themeColor: '#526e35',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function FieldDocsLayout({ children }) {
  return <div className="fd-root">{children}</div>;
}