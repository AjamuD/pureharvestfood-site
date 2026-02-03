Replace your current GitHub repo contents with this folder's contents.

1) Download the ZIP I provided and unzip it.
2) In your GitHub repo (pureharvestfood-site):
   - Delete everything in the repo (folders + files)
   - Upload the new folders + files from the unzipped package
   - Commit changes
3) Cloudflare Pages will auto-deploy.

After deploy:
- Create a Cloudflare Turnstile widget and replace YOUR_TURNSTILE_SITE_KEY in /contact/ and /retailer/ pages.
- Add environment variables in Cloudflare Pages:
  TURNSTILE_SECRET_KEY
  RESEND_API_KEY
  FROM_EMAIL (e.g. Pure Harvest <no-reply@pureharvestfood.com>)
  (optional) TO_EMAIL (defaults to pureharvest2022@gmail.com)

Note: Recipes are not linked in the main nav (secondary only), but the page exists at /recipes/brown-stew-chicken/
