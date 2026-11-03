const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const root = process.cwd();
const appRoot = path.join(root, 'app/field-docs');
const apiRoot = path.join(root, 'app/api/field-docs');
const componentRoot = path.join(root, 'components/field-docs');
const libRoot = path.join(root, 'lib/fieldDocs');
const cssPath = path.join(appRoot, 'field-docs.css');
const appRoutes = [
  'workorders', 'documents', 'assets', 'schedules', 'reports', 'escalations',
  'clients', 'settings', 'account', 'audit', 'products', 'templates', 'users',
  'docs', 'login', 'forgot', 'reset', 's', 'a',
];

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(entryPath) : [entryPath];
  });
}

function rewriteSource(file) {
  if (!file.endsWith('.js')) return;
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(/@\/lib\/(?!fieldDocs\/)/g, '@/lib/fieldDocs/');
  source = source.replace(/@\/components\/(?!field-docs\/)/g, '@/components/field-docs/');
  source = source.replace(/\/api\/(?!field-docs\/)/g, '/api/field-docs/');

  const routePattern = new RegExp(`(["'\x60])\\/(${appRoutes.join('|')})(?=[\\/?#"'\x60])`, 'g');
  source = source.replace(routePattern, '$1/field-docs/$2');
  source = source.replace(/(["'\x60])\/(["'\x60])/g, '$1/field-docs$2');
    source = source.replace(/(["'\x60])\/(sw\.js|offline\.html|icon-192\.png|icon-512\.png)/g, '$1/field-docs/$2');

  if (file.startsWith(appRoot) && file.endsWith('page.js')) {
    source = source.replace(/(export default async function [^(]+\(\{[^}]*searchParams[^}]*\}\)\s*\{)/g, '$1searchParams=await searchParams;');
    source = source.replace(/(export default async function [^(]+\(\{[^}]*params[^}]*\}\)\s*\{)/g, '$1params=await params;');
  }

  if (file === path.join(appRoot, 'reset/[token]/page.js')) {
    source = source.replace("import {useState} from 'react';", "import {useState} from 'react';import {useParams} from 'next/navigation';");
    source = source.replace('export default function Reset({params}){', 'export default function Reset(){const params=useParams();');
  }

  fs.writeFileSync(file, source);
}

for (const file of [...filesUnder(appRoot), ...filesUnder(apiRoot), ...filesUnder(componentRoot), ...filesUnder(libRoot)]) {
  rewriteSource(file);
}

const css = postcss.parse(fs.readFileSync(cssPath, 'utf8'));
css.walkRules((rule) => {
  if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map((selector) => {
    const trimmed = selector.trim();
    if (trimmed === ':root' || trimmed === 'html' || trimmed === 'body') return '.fd-root';
    if (trimmed.startsWith(':root ')) return `.fd-root${trimmed.slice(5)}`;
    if (trimmed.startsWith('html ' ) || trimmed.startsWith('body ')) return `.fd-root ${trimmed.slice(trimmed.indexOf(' ') + 1)}`;
    return `.fd-root ${trimmed}`;
  });
});
fs.writeFileSync(cssPath, css.toString());

const manifestPath = path.join(appRoot, 'manifest.js');
let manifest = fs.readFileSync(manifestPath, 'utf8');
manifest = manifest.replace("start_url:'/'", "start_url:'/field-docs'").replace("scope:'/'", "scope:'/field-docs/'");
manifest = manifest.replaceAll("'/icon-", "'/field-docs/icon-");
fs.writeFileSync(manifestPath, manifest);

const workerPath = path.join(root, 'public/field-docs/sw.js');
let worker = fs.readFileSync(workerPath, 'utf8');
worker = worker.replaceAll("'/offline.html'", "'/field-docs/offline.html'").replaceAll("'/icon-", "'/field-docs/icon-");
worker = worker.replace("caches.match('/offline.html')", "caches.match('/field-docs/offline.html')");
worker = worker.replace("u.pathname.startsWith('/api/')", "u.pathname.startsWith('/api/field-docs/')");
worker = worker.replace("u.pathname.startsWith('/_next/static/')", "u.pathname.startsWith('/_next/static/') || u.pathname.startsWith('/field-docs/_next/static/')");
fs.writeFileSync(workerPath, worker);

console.log('Field Docs routes, imports, PWA paths, and CSS are namespaced.');