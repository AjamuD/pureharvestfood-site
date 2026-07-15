import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const note = (condition, message) => { if (!condition) failures.push(message); };

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(path)); else output.push(path);
  }
  return output;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => extname(file) === '.html');
const allText = (await Promise.all(files.filter((file) => ['.html', '.js', '.css', '.xml', '.txt', ''].includes(extname(file))).map((file) => readFile(file, 'utf8').catch(() => '')))).join('\n').toLowerCase();
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

const forbidden = [
  ['readdy', '.ai'], ['data-', 'readdy'], ['api/', 'search-image'], ['cdn.', 'tailwind', 'css.com'],
  ['pay', 'pal'], ['master', 'card'], ['ri-', 'visa'], ['turn', 'stile'], ['resend', '_api_key'],
  ['haccp', ' certified'], ['gmp', ' certified'],
].map((parts) => parts.join(''));
for (const token of forbidden) {
  note(!allText.includes(token), `Forbidden dependency or claim remains: ${token}`);
}
note(!allText.includes('href="#"'), 'Placeholder href="#" remains');
note(!allText.includes(['/', 'check', 'out'].join('')), 'Legacy payment-flow link remains');
note(!allText.includes(['message', ' sent'].join('')), 'Simulated success language remains');
note((await readFile(join(root, 'CNAME'), 'utf8')).trim() === 'www.pureharvestfood.com', 'CNAME is incorrect');
const certificate = await readFile(join(root, 'assets', 'documents', 'certificate-of-incorporation.png'));
note(createHash('sha256').update(certificate).digest('hex').toUpperCase() === '3AAD483B029D43544B2760B2B69055043A85D12574ACFB52A2FB3A4437A66782', 'Certificate of Incorporation asset has changed');

for (const file of htmlFiles) {
  const relative = file.slice(root.length + 1).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');
  note(/<html lang="en-TT">/i.test(html), `${relative}: missing correct lang`);
  note((html.match(/<h1[\s>]/gi) || []).length === 1, `${relative}: expected exactly one H1`);
  note(/<title>[^<]+<\/title>/i.test(html), `${relative}: missing title`);
  note(/<meta name="description" content="[^"]+">/i.test(html), `${relative}: missing meta description`);
  note(/<link rel="canonical" href="https:\/\/www\.pureharvestfood\.com\//i.test(html), `${relative}: missing canonical`);
  note(/<meta property="og:image"/i.test(html), `${relative}: missing Open Graph image`);
  note(/application\/ld\+json/i.test(html), `${relative}: missing structured data`);
  note(!/<script(?![^>]*src=)/i.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')), `${relative}: inline script remains`);
  note(!/\bsrc="https?:/i.test(html), `${relative}: external resource source remains`);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)">/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
  if (title) { note(!titles.has(title), `${relative}: duplicate title also used by ${titles.get(title)}`); titles.set(title, relative); }
  if (description) { note(!descriptions.has(description), `${relative}: duplicate description also used by ${descriptions.get(description)}`); descriptions.set(description, relative); }
  if (canonical) { note(!canonicals.has(canonical), `${relative}: duplicate canonical also used by ${canonicals.get(canonical)}`); canonicals.set(canonical, relative); }

  for (const match of html.matchAll(/<img\b([^>]+)>/gi)) {
    const attrs = match[1];
    note(/\balt="[^"]*"/i.test(attrs), `${relative}: image missing alt`);
    note(/\bwidth="\d+"/i.test(attrs) && /\bheight="\d+"/i.test(attrs), `${relative}: image missing dimensions`);
    const src = attrs.match(/\bsrc="([^"]+)"/i)?.[1];
    if (src?.startsWith('/')) note(files.includes(join(root, src.slice(1).replaceAll('/', '\\'))), `${relative}: missing image ${src}`);
  }

  for (const match of html.matchAll(/href="([^"]+)"/gi)) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = clean.endsWith('/') ? join(root, clean.slice(1), 'index.html') : join(root, clean.slice(1));
    note(files.includes(normalize(target)), `${relative}: broken internal link ${href}`);
  }

  if (html.includes('data-menu-toggle')) {
    note(/aria-expanded="false"/.test(html) && /aria-controls="primary-navigation"/.test(html), `${relative}: mobile menu ARIA missing`);
  }
  for (const match of html.matchAll(/<(input|select|textarea)\b([^>]+)>/gi)) {
    const id = match[2].match(/\bid="([^"]+)"/i)?.[1];
    note(Boolean(id), `${relative}: form control missing id`);
    if (id) note(html.includes(`for="${id}"`), `${relative}: form control ${id} missing label`);
  }
  for (const match of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/gi)) {
    note(/\brel="[^"]*noopener[^"]*"/i.test(match[1]), `${relative}: new-tab link missing noopener`);
  }
}

for (const product of ['Accra Mix', 'Caramel Browning', 'Dehydrated Spices', 'Nutri-Fuse', 'Tropical Fruits']) {
  const slug = product.toLowerCase().replaceAll(' ', '-');
  const file = join(root, 'shop', slug, 'index.html');
  const html = await readFile(file, 'utf8');
  note(html.includes(encodeURIComponent(product).replaceAll('%20', '+')) || html.includes(encodeURIComponent(product)), `${product}: WhatsApp message does not include product name`);
}

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const match of sitemap.matchAll(/<loc>https:\/\/www\.pureharvestfood\.com([^<]*)<\/loc>/g)) {
  const pathname = match[1] || '/';
  const target = pathname.endsWith('/') ? join(root, pathname.slice(1), 'index.html') : join(root, pathname.slice(1));
  note(files.includes(normalize(target)), `Sitemap route is missing: ${pathname}`);
}

if (failures.length) {
  console.error(`Audit failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Audit passed: ${htmlFiles.length} HTML pages and ${files.length} repository files checked.`);
