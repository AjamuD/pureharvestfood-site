Pure Harvest website deployment
================================

This is a static website for Pure Harvest Group of Companies Ltd. GitHub Pages
serves it at https://www.pureharvestfood.com.

Ordering
--------
The website does not collect payment-card details. Product, contact and retailer
requests open a pre-filled WhatsApp conversation with +1 868 361-8990.

Images
------
Company and product uploads are stored under assets/images/original. Temporary
neutral category photographs are under assets/images/generated and can be
replaced later while keeping the same WebP filenames.

Company document
----------------
Do not delete or alter assets/documents/certificate-of-incorporation.png or the
page at certificates/incorporation/index.html.

Styles
------
The production pages use the compiled assets/css/site.css file and do not load
the Tailwind browser runtime. After changing Tailwind classes, rebuild it with:

  pnpm dlx tailwindcss@3.4.16 -c tailwind.config.js -i assets/css/input.css -o assets/css/site.css --minify

Checks
------
Run the repository audit before publishing:

  python scripts/audit_site.py

The audit checks page metadata, internal links, local images, accessible forms,
WhatsApp ordering and the incorporation document checksum.
