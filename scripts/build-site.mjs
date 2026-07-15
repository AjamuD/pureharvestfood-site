import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const domain = 'https://www.pureharvestfood.com';
const whatsappNumber = '18683618990';
const generalMessage = 'Hello Pure Harvest, I would like to place an order. Please send me the current product list, prices and availability.';
const wa = (message) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

const products = [
  { slug: 'dehydrated-spices', name: 'Dehydrated Spices', image: '/assets/images/products/spices.svg', description: 'Ask about the dehydrated spice varieties currently available for home, retail or wholesale use.' },
  { slug: 'accra-mix', name: 'Accra Mix', image: '/assets/images/products/mixes.svg', description: 'A convenient Caribbean food-mix category. Contact Pure Harvest for current product details and availability.' },
  { slug: 'nutri-fuse', name: 'Nutri-Fuse', image: '/assets/images/products/mixes.svg', description: 'Enquire about the current Nutri-Fuse range, available varieties and ordering options.' },
  { slug: 'tropical-fruits', name: 'Tropical Fruits', image: '/assets/images/products/fruits.svg', description: 'Ask about available tropical fruit products, sizes and seasonal availability.' },
  { slug: 'caramel-browning', name: 'Caramel Browning', image: '/assets/images/products/browning.svg', description: 'A Caribbean cooking essential. Contact Pure Harvest for current sizes, ingredients and availability.' },
];

const navItems = [
  ['/', 'Home'], ['/shop/', 'Products'], ['/about/', 'About Us'], ['/retailer/', 'Become a Retailer'], ['/certificates/', 'Company Documents'], ['/contact/', 'Contact'],
];

function header(current) {
  return `<a class="skip-link" href="#main-content">Skip to main content</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="Pure Harvest Group of Companies Ltd. home">
        <img src="/assets/images/brand/pure-harvest-logo.png" alt="Pure Harvest" width="1200" height="700">
        <span>Pure Harvest Group of Companies Ltd.</span>
      </a>
      <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu">Menu</button>
      <nav class="primary-nav" id="primary-navigation" aria-label="Primary navigation"><ul class="nav-list">
        ${navItems.map(([href, label]) => `<li><a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}
      </ul></nav>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div><h2>Pure Harvest Group of Companies Ltd.</h2><p>Caribbean food products and ingredients from Tobago, Trinidad and Tobago.</p><ul class="social-list"><li><a href="https://www.instagram.com/pureharvestltd2022/" target="_blank" rel="noopener noreferrer">Instagram<span class="sr-only"> (opens in a new tab)</span></a></li><li><a href="https://www.facebook.com/profile.php?id=100089070173342" target="_blank" rel="noopener noreferrer">Facebook<span class="sr-only"> (opens in a new tab)</span></a></li><li><a href="https://www.tiktok.com/@pureharvest0" target="_blank" rel="noopener noreferrer">TikTok<span class="sr-only"> (opens in a new tab)</span></a></li></ul></div>
      <div><h3>Explore</h3><ul class="footer-links"><li><a href="/shop/">Products</a></li><li><a href="/about/">About Us</a></li><li><a href="/retailer/">Retailer Enquiries</a></li><li><a href="/certificates/">Company Documents</a></li></ul></div>
      <div><h3>Contact</h3><p>Congo Hill, Moriah, Tobago, Trinidad and Tobago<br><a href="tel:+18683618990">+1 868 361-8990</a><br><a href="mailto:pureharvest2022@gmail.com">pureharvest2022@gmail.com</a></p><p><a href="/privacy-policy/">Privacy Policy</a><br><a href="/terms-and-conditions/">Terms and Conditions</a></p></div>
    </div>
    <div class="container footer-bottom">© 2026 Pure Harvest Group of Companies Ltd. All rights reserved.</div>
  </footer>
  <a class="button olive whatsapp-float" href="${wa(generalMessage)}" target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp (opens in a new tab)">Order on WhatsApp</a>`;
}

function layout({ path, title, description, current = path, body, robots = 'index, follow' }) {
  const canonical = `${domain}${path}`;
  const organization = {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'Pure Harvest Group of Companies Ltd.', url: domain,
    email: 'pureharvest2022@gmail.com', telephone: '+1 868 361-8990',
    address: { '@type': 'PostalAddress', streetAddress: 'Congo Hill', addressLocality: 'Moriah', addressRegion: 'Tobago', addressCountry: 'TT' },
    founder: { '@type': 'Person', name: 'Ajamu Daniel' },
    sameAs: ['https://www.instagram.com/pureharvestltd2022/', 'https://www.facebook.com/profile.php?id=100089070173342', 'https://www.tiktok.com/@pureharvest0']
  };
  return `<!doctype html>
<html lang="en-TT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website"><meta property="og:site_name" content="Pure Harvest"><meta property="og:locale" content="en_TT">
  <meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${domain}/assets/images/brand/pure-harvest-logo.png"><meta property="og:image:alt" content="Pure Harvest logo">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/images/brand/pure-harvest-logo.png" type="image/png">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">${JSON.stringify(organization).replace(/</g, '\\u003c')}</script>
  <script src="/assets/js/site.js" defer></script>
</head>
<body>
  ${header(current)}
  <main id="main-content">${body}</main>
  ${footer()}
</body>
</html>`;
}

const pageHero = (eyebrow, title, text, crumbs = '') => `<section class="page-hero"><div class="container"><div class="breadcrumbs">${crumbs || '<a href="/">Home</a> / ' + escapeHtml(title)}</div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="lead">${text}</p></div></section>`;

const productCards = () => products.map((product) => `<article class="card"><img class="card-media" src="${product.image}" alt="Illustration representing ${product.name.toLowerCase()}" width="800" height="600" loading="lazy"><div class="card-body"><span class="tag">Contact for price</span><h3>${product.name}</h3><p>${product.description}</p><a class="button secondary" href="/shop/${product.slug}/">View product</a></div></article>`).join('');

const home = layout({
  path: '/', title: 'Pure Harvest | Caribbean Food Products from Tobago', description: 'Discover Caribbean spices, mixes and food products from Pure Harvest Group of Companies Ltd. in Tobago. Order and enquire through WhatsApp.', current: '/',
  body: `<section class="hero"><div class="container hero-grid"><div><div class="eyebrow">Proudly Tobagonian</div><h1>Caribbean Flavour, Naturally Crafted</h1><p class="lead">Discover spices, mixes, snacks and food products inspired by the traditions of Trinidad and Tobago.</p><div class="hero-actions"><a class="button olive" href="${wa(generalMessage)}" target="_blank" rel="noopener noreferrer">Order on WhatsApp</a><a class="button secondary" href="/shop/">Browse Products</a></div><ul class="trust-row"><li>Tobago based</li><li>Direct assistance</li><li>Retail & wholesale enquiries</li></ul></div><div class="hero-art"><img src="/assets/images/hero/caribbean-harvest.svg" alt="Illustration of Caribbean ingredients and Tobago hills" width="900" height="760"></div></div></section>
  <section class="section alt"><div class="container"><div class="section-heading"><div class="eyebrow">Our range</div><h2>Food rooted in Caribbean tradition</h2><p>Explore our product categories, then contact us for current sizes, ingredients, prices and availability.</p></div><div class="grid three">${productCards()}</div></div></section>
  <section class="section"><div class="container story-grid"><div><div class="eyebrow">From Tobago</div><h2>A company built close to home</h2><p class="lead">Pure Harvest Group of Companies Ltd. is based in Moriah, Tobago and led by director Ajamu Daniel.</p><p>We are developing Caribbean food products and building relationships with customers, retailers and wholesale partners. Verified company documents and certification updates are published openly.</p><a class="button secondary" href="/about/">Read our story</a></div><div class="story-panel"><h3>Clear information, direct service</h3><p>Orders are arranged directly through WhatsApp. Pure Harvest confirms current availability, pricing, payment and delivery details with each customer.</p><p>No card details are collected on this website.</p></div></div></section>
  <section class="section alt"><div class="container"><div class="section-heading"><div class="eyebrow">Featured enquiries</div><h2>Ask about current availability</h2></div><div class="grid three">${productCards().split('</article>').slice(0,3).map((x) => x + '</article>').join('')}</div></div></section>
  <section class="section deep"><div class="container"><div class="section-heading"><div class="eyebrow">Simple ordering</div><h2>How ordering works</h2></div><div class="steps"><div class="step"><h3>Browse</h3><p>Review the product categories and choose what interests you.</p></div><div class="step"><h3>Message us</h3><p>Open WhatsApp with the product or enquiry details prefilled.</p></div><div class="step"><h3>Confirm directly</h3><p>We confirm prices, availability, payment and delivery with you. An enquiry is not a confirmed order.</p></div></div></div></section>
  <section class="section"><div class="container story-grid"><div class="story-panel"><h2>Retail and wholesale enquiries</h2><p>Interested in stocking Pure Harvest products or discussing wholesale quantities? Tell us about your business through our WhatsApp enquiry form.</p><a class="button" href="/retailer/">Become a Retailer</a></div><div><div class="eyebrow">Transparent progress</div><h2>Company documents & certifications</h2><p>The Certificate of Incorporation is available online. Additional food-safety and quality certifications are in progress and will only be published after official issue.</p><a class="button secondary" href="/certificates/">View company documents</a></div></div></section>
  <section class="section alt"><div class="container contact-grid"><div><div class="eyebrow">Talk with us</div><h2>Questions about products?</h2><p>Contact Pure Harvest directly for current product information, prices, sizes, ingredients, allergens and availability.</p><p><strong>Phone and WhatsApp:</strong> <a href="tel:+18683618990">+1 868 361-8990</a><br><strong>Email:</strong> <a href="mailto:pureharvest2022@gmail.com">pureharvest2022@gmail.com</a></p></div><div class="form-card"><h3>Start an enquiry</h3><a class="button olive" href="${wa(generalMessage)}" target="_blank" rel="noopener noreferrer">Open WhatsApp</a></div></div></section>`
});

const shop = layout({ path: '/shop/', title: 'Products | Pure Harvest Tobago', description: 'Browse Pure Harvest product categories and ask about current prices, sizes, ingredients and availability through WhatsApp.', current: '/shop/', body: `${pageHero('Products', 'Explore our Caribbean food range', 'Browse product categories and contact us for current price, size, ingredient, allergen and availability information.')}<section class="section alt"><div class="container"><div class="grid three">${productCards()}</div><div class="notice" style="margin-top:2rem"><strong>Before ordering:</strong> Availability may vary. Please request current ingredient and allergen information if you have dietary requirements.</div></div></section>` });

const about = layout({ path: '/about/', title: 'About Pure Harvest | Tobago Food Company', description: 'Learn about Pure Harvest Group of Companies Ltd., a Tobago-based Caribbean food company led by director Ajamu Daniel.', current: '/about/', body: `${pageHero('About us', 'Rooted in Tobago', 'Pure Harvest Group of Companies Ltd. is based in Congo Hill, Moriah, Tobago, Trinidad and Tobago.')}<section class="section alt"><div class="container story-grid"><div><h2>Caribbean food, local ambition</h2><p>Pure Harvest is building a food business inspired by the flavours and traditions of Trinidad and Tobago. Our product range includes spices, mixes and other food categories, with current details confirmed directly when customers enquire.</p><p>We value honest information. Prices, availability, ingredients, allergens and delivery arrangements are confirmed directly rather than assumed online.</p></div><div class="story-panel"><h2>Leadership</h2><p><strong>Ajamu Daniel</strong><br>Director</p><p>For company, retailer or product enquiries, contact Pure Harvest through the verified details on this website.</p><a class="button" href="/founder/ajamu-daniel/">About the director</a></div></div></section><section class="section"><div class="container"><div class="section-heading"><div class="eyebrow">Our location</div><h2>Proudly based in Moriah</h2></div><p class="lead">Congo Hill, Moriah, Tobago, Trinidad and Tobago</p><a class="button olive" href="${wa('Hello Pure Harvest, I would like to learn more about your company and products.')}" target="_blank" rel="noopener noreferrer">Contact us on WhatsApp</a></div></section>` });

const retailer = layout({ path: '/retailer/', title: 'Become a Retailer | Pure Harvest Tobago', description: 'Enquire about retail and wholesale opportunities with Pure Harvest Group of Companies Ltd. through WhatsApp.', current: '/retailer/', body: `${pageHero('Retail & wholesale', 'Become a Pure Harvest retail partner', 'Tell us about your business and the products or quantities that interest you. We will respond directly with current information.')}<section class="section alt"><div class="container contact-grid"><div><h2>Start a direct conversation</h2><p>Wholesale quantities, lead times, prices, payment and delivery are confirmed directly by Pure Harvest. Submitting this enquiry does not create an order or retailer agreement.</p><div class="notice">We do not request payment-card information through this website.</div></div><form class="form-card whatsapp-form" data-message="Hello Pure Harvest, I would like to make a retailer or wholesale enquiry."><h2>Retailer enquiry</h2><div class="field"><label for="retailer-name">Your name</label><input id="retailer-name" name="name" data-wa-label="Name" autocomplete="name" required></div><div class="field"><label for="business-name">Business name</label><input id="business-name" name="business" data-wa-label="Business" autocomplete="organization" required></div><div class="field"><label for="retailer-location">Business location</label><input id="retailer-location" name="location" data-wa-label="Location" required></div><div class="field"><label for="retailer-interest">Products or quantities of interest</label><textarea id="retailer-interest" name="interest" data-wa-label="Products or quantities" required></textarea></div><button class="button olive" type="submit">Send enquiry on WhatsApp</button><p class="form-note">Your entries are used only to prepare a WhatsApp message. They are not stored by this website.</p></form></div></section>` });

const contact = layout({ path: '/contact/', title: 'Contact Pure Harvest | Tobago', description: 'Contact Pure Harvest Group of Companies Ltd. by WhatsApp, phone or email for product, order and business enquiries.', current: '/contact/', body: `${pageHero('Contact', 'Let’s talk', 'Contact Pure Harvest directly for product information, current availability, retailer enquiries and company questions.')}<section class="section alt"><div class="container contact-grid"><div><h2>Verified contact details</h2><p><strong>Address</strong><br>Congo Hill, Moriah, Tobago, Trinidad and Tobago</p><p><strong>Phone and WhatsApp</strong><br><a href="tel:+18683618990">+1 868 361-8990</a></p><p><strong>Email</strong><br><a href="mailto:pureharvest2022@gmail.com">pureharvest2022@gmail.com</a></p></div><form class="form-card whatsapp-form" data-message="Hello Pure Harvest, I would like to make an enquiry."><h2>WhatsApp enquiry</h2><div class="field"><label for="contact-name">Your name</label><input id="contact-name" name="name" data-wa-label="Name" autocomplete="name" required></div><div class="field"><label for="contact-topic">Enquiry type</label><select id="contact-topic" name="topic" data-wa-label="Enquiry type" required><option value="">Choose one</option><option>Product information</option><option>Order request</option><option>Retail or wholesale</option><option>Company information</option><option>Other</option></select></div><div class="field"><label for="contact-message">Message</label><textarea id="contact-message" name="message" data-wa-label="Message" required></textarea></div><button class="button olive" type="submit">Continue to WhatsApp</button><p class="form-note">This opens WhatsApp with your message prefilled. Nothing is submitted or stored on this website.</p></form></div></section>` });

const certificates = layout({ path: '/certificates/', title: 'Company Documents | Pure Harvest', description: 'View the Certificate of Incorporation and current certification status for Pure Harvest Group of Companies Ltd.', current: '/certificates/', body: `${pageHero('Company documents', 'Verified documents and certification status', 'Official company documents are published here. Additional certifications will only be shown after they are officially issued.')}<section class="section alt"><div class="container grid two"><article class="card"><div class="card-body"><span class="tag">Verified company document</span><h2>Certificate of Incorporation</h2><p>View the existing Certificate of Incorporation for Pure Harvest Group of Companies Ltd.</p><a class="button secondary" href="/certificates/incorporation/">View certificate</a></div></article><article class="card"><div class="card-body"><span class="tag">Status update</span><h2>Certifications in Progress</h2><p>Pure Harvest is currently working toward additional food-safety and quality certifications. Verified certificates will be published here after they are officially issued.</p></div></article></div></section>` });

const incorporation = layout({ path: '/certificates/incorporation/', title: 'Certificate of Incorporation | Pure Harvest', description: 'View the Certificate of Incorporation for Pure Harvest Group of Companies Ltd.', current: '/certificates/', body: `${pageHero('Company document', 'Certificate of Incorporation', 'The existing incorporation document is reproduced below without alteration.', '<a href="/">Home</a> / <a href="/certificates/">Company Documents</a> / Certificate of Incorporation')}<section class="section alt"><div class="container narrow"><div class="document-frame"><img src="/assets/documents/certificate-of-incorporation.png" alt="Certificate of Incorporation for Pure Harvest Group of Companies Ltd." width="667" height="900"></div><div class="actions"><a class="button secondary" href="/assets/documents/certificate-of-incorporation.png" download>Download certificate image</a><button class="button" type="button" data-print>Print this page</button></div><p class="form-note">For document verification questions, contact Pure Harvest using the verified company details on this website.</p></div></section>` });

const founder = layout({ path: '/founder/ajamu-daniel/', title: 'Ajamu Daniel | Director of Pure Harvest', description: 'Ajamu Daniel is the director of Pure Harvest Group of Companies Ltd. in Tobago, Trinidad and Tobago.', current: '/about/', body: `${pageHero('Leadership', 'Ajamu Daniel', 'Director of Pure Harvest Group of Companies Ltd.', '<a href="/">Home</a> / <a href="/about/">About Us</a> / Ajamu Daniel')}<section class="section alt"><div class="container narrow prose"><h2>Company leadership</h2><p>Ajamu Daniel serves as director of Pure Harvest Group of Companies Ltd., based in Congo Hill, Moriah, Tobago, Trinidad and Tobago.</p><p>For verified company information, product enquiries or business discussions, use the official contact details published on this website.</p><a class="button olive" href="/contact/">Contact Pure Harvest</a></div></section>` });

const privacy = layout({ path: '/privacy-policy/', title: 'Privacy Policy | Pure Harvest', description: 'Learn how Pure Harvest handles information shared through WhatsApp, email and this website.', current: '', body: `${pageHero('Legal', 'Privacy Policy', 'Effective 15 July 2026.')}<section class="section alt"><div class="container narrow prose"><h2>Information you choose to share</h2><p>This website does not collect payment-card details. When you contact Pure Harvest through WhatsApp, telephone or email, you may provide your name, contact details, business information, order interests and message content.</p><p>The WhatsApp enquiry forms on this website prepare a message on your device and open WhatsApp. The website does not store those form entries.</p><h2>How information is used</h2><p>Pure Harvest uses information you provide to respond to enquiries, discuss products, arrange orders, confirm prices and availability, support retailer or wholesale discussions, and provide customer service.</p><h2>Service providers</h2><p>WhatsApp and email providers may process communications according to their own privacy terms. Please review those services before sharing sensitive information.</p><h2>Sharing and selling</h2><p>Pure Harvest does not sell personal information. Information may be shared when necessary to respond to your request, meet legal obligations, or protect legitimate business and customer interests.</p><h2>Your choices</h2><p>You may ask about personal information held in company communications or request an appropriate correction or deletion by emailing <a href="mailto:pureharvest2022@gmail.com">pureharvest2022@gmail.com</a>.</p><h2>Contact</h2><p>Pure Harvest Group of Companies Ltd.<br>Congo Hill, Moriah, Tobago, Trinidad and Tobago<br><a href="tel:+18683618990">+1 868 361-8990</a></p></div></section>` });

const terms = layout({ path: '/terms-and-conditions/', title: 'Terms and Conditions | Pure Harvest', description: 'Read the terms for product enquiries and orders arranged directly with Pure Harvest through WhatsApp or email.', current: '', body: `${pageHero('Legal', 'Terms and Conditions', 'Effective 15 July 2026.')}<section class="section alt"><div class="container narrow prose"><h2>Website information</h2><p>Product information on this website is general and may change. Pure Harvest confirms current details directly with customers.</p><h2>Enquiries are not confirmed orders</h2><p>Sending a WhatsApp, telephone or email enquiry does not create or confirm an order. Pure Harvest will confirm products, quantities, prices, availability, payment arrangements, delivery or collection, and any other applicable terms directly.</p><h2>Prices and availability</h2><p>Prices and availability may change. Contact Pure Harvest for current information before making purchasing decisions.</p><h2>Ingredients and allergens</h2><p>Customers should request current ingredient and allergen information before ordering, particularly when food allergies, intolerances or dietary restrictions apply.</p><h2>Retail and wholesale</h2><p>Wholesale quantities, pricing, lead times, payment and delivery arrangements are confirmed directly. A retailer enquiry does not create a supply agreement.</p><h2>Payments</h2><p>This website does not collect card details or process online card payments. Pure Harvest will explain accepted payment arrangements directly when an order is confirmed.</p><h2>Contact</h2><p>Questions about these terms may be sent to <a href="mailto:pureharvest2022@gmail.com">pureharvest2022@gmail.com</a> or discussed by telephone or WhatsApp at <a href="tel:+18683618990">+1 868 361-8990</a>.</p></div></section>` });

function productPage(product) {
  const message = `Hello Pure Harvest, I would like to ask about ${product.name}. Please send me the current price, sizes and availability.`;
  return layout({ path: `/shop/${product.slug}/`, title: `${product.name} | Pure Harvest`, description: `Ask Pure Harvest about ${product.name}, including current price, available sizes, ingredients, allergens and availability.`, current: '/shop/', body: `${pageHero('Product enquiry', product.name, product.description, `<a href="/">Home</a> / <a href="/shop/">Products</a> / ${product.name}`)}<section class="section alt"><div class="container product-grid"><div><img class="card-media" style="border-radius:var(--radius)" src="${product.image}" alt="Illustration representing ${product.name.toLowerCase()}" width="800" height="600"></div><div><span class="tag">Contact for current price</span><h2>Product information</h2><div class="detail-list"><div class="detail"><strong>Sizes</strong>Ask about available sizes</div><div class="detail"><strong>Availability</strong>Availability may vary</div><div class="detail"><strong>Ingredients & allergens</strong>Contact us for current information</div><div class="detail"><strong>Retail & wholesale</strong>Enquiries welcome</div></div><p>Pure Harvest will confirm current product details directly. No order is confirmed until Pure Harvest responds and agrees the products, price, payment and delivery arrangements.</p><div class="actions"><a class="button olive" href="${wa(message)}" target="_blank" rel="noopener noreferrer">Ask About This Product</a><a class="button secondary" href="/retailer/">Wholesale enquiry</a></div></div></div></section>` });
}

const retired = (path, title, text) => layout({ path, title: `${title} | Pure Harvest`, description: text, current: '', robots: 'noindex, follow', body: `${pageHero('Page update', title, text)}<section class="section alt"><div class="container narrow"><p>The current website uses direct WhatsApp enquiries and verified company information.</p><a class="button olive" href="${wa(generalMessage)}" target="_blank" rel="noopener noreferrer">Order on WhatsApp</a> <a class="button secondary" href="/">Return home</a></div></section>` });

const pages = new Map([
  ['index.html', home], ['shop/index.html', shop], ['about/index.html', about], ['retailer/index.html', retailer], ['contact/index.html', contact],
  ['certificates/index.html', certificates], ['certificates/incorporation/index.html', incorporation], ['founder/ajamu-daniel/index.html', founder],
  ['privacy-policy/index.html', privacy], ['terms-and-conditions/index.html', terms],
  ['cart/index.html', retired('/cart/', 'Ordering has moved to WhatsApp', 'The prototype shopping cart has been removed. Contact Pure Harvest directly to request an order.')],
  ['certificates/origin/index.html', retired('/certificates/origin/', 'Certifications in Progress', 'Verified certificates will be published after they are officially issued.')],
  ['recipes/brown-stew-chicken/index.html', retired('/recipes/brown-stew-chicken/', 'Recipe information coming soon', 'Verified recipe details are not currently published on this website.')],
  ['team/candice-joseph/index.html', retired('/team/candice-joseph/', 'Team page retired', 'Please visit the About Us page for verified company leadership information.')],
]);

for (const product of products) pages.set(`shop/${product.slug}/index.html`, productPage(product));
pages.set('404.html', layout({ path: '/404.html', title: 'Page Not Found | Pure Harvest', description: 'The requested Pure Harvest page could not be found.', current: '', robots: 'noindex, follow', body: `${pageHero('404', 'Page not found', 'The page may have moved or may no longer be available.')}<section class="section alt"><div class="container narrow"><a class="button" href="/">Return home</a><a class="button secondary" href="/shop/">Browse products</a></div></section>` }));

for (const [relativePath, content] of pages) {
  const output = join(root, relativePath);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, content, 'utf8');
}

console.log(`Generated ${pages.size} HTML pages.`);
