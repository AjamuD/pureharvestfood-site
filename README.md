# Pure Harvest website

Production static website for Pure Harvest Group of Companies Ltd.

## Local preview

The generated HTML is committed, so no build step is required for deployment. To regenerate pages after editing `scripts/build-site.mjs`:

```powershell
node scripts/build-site.mjs
```

Serve the repository root with any static web server. For example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

The site is compatible with GitHub Pages or Cloudflare Pages. Publish the repository root. No environment variables, server functions, package installation, card processor, or build command are required.

The `CNAME` file must remain exactly `www.pureharvestfood.com`. Cloudflare Pages can apply the security rules in `_headers`.

## Ordering and forms

Orders, contact requests, and retailer enquiries open WhatsApp with a prefilled message to `18683618990`. The website does not store form entries or collect card details.

## Company documents

The existing Certificate of Incorporation image is stored at `assets/documents/certificate-of-incorporation.png` and displayed at `/certificates/incorporation/`. Do not replace or alter that file without explicit company approval.
