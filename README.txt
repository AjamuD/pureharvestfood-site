Deploy to Cloudflare Pages
- Connect a GitHub repo containing these files to Cloudflare Pages.
- No build command. Output directory: / (root).

Turnstile:
- Replace YOUR_TURNSTILE_SITE_KEY in HTML with your site key.
- Set TURNSTILE_SECRET_KEY in Pages environment variables.

Email (Resend):
- Set RESEND_API_KEY
- Set FROM_EMAIL (example: "Pure Harvest <no-reply@pureharvestfood.com>")
- Optional: TO_EMAIL (defaults to pureharvest2022@gmail.com)

Endpoint:
- Forms POST to /api/lead (Pages Function at /functions/api/lead.js)
