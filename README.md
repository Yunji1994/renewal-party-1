# Party Invitation Site

Static GitHub Pages site with a Cloudflare Worker API to store RSVPs in D1 and host images from R2.

Quick steps

- Update `frontend/src/index.html` replacing `API_URL` and R2 image links.
- Publish static files to GitHub Pages (use `gh-pages` branch or `docs/` folder).
- Deploy the Worker to Cloudflare and bind a D1 database (`DB`) and an R2 bucket (`IMAGES`).
- Set a secret admin token `ADMIN_TOKEN` in the Worker environment for protected endpoints.

Files added

- `frontend/src/index.html` – static site and RSVP form
- `frontend/src/styles.css` – simple styles
- `frontend/src/script.js` – client-side JS posting to the Worker API
- `worker/src/index.js` – example Cloudflare Worker handling D1 + R2 interactions
- `worker/wrangler.toml` – sample wrangler config
- `worker/package.json` – worker dev deps (optional)

Notes

- GitHub Pages serves only static assets. The Worker (hosted on Cloudflare) is the API endpoint that writes to D1.
- Replace placeholder URLs and tokens before deploying.

Deploy the Worker (recommended steps)

1. Install wrangler and deps:

```powershell
cd worker
npm install
# or: npm install -g wrangler
```

2. Authenticate / configure Cloudflare credentials:

- Either run `npx wrangler login` to authenticate interactively, or set env vars `CF_API_TOKEN` and `CF_ACCOUNT_ID`.

3. Create a D1 database and apply the migration (wrangler will prompt or use your account):

```powershell
npx wrangler d1 create rsvp_db
npx wrangler d1 migrations apply rsvp_db
```

4. Set the admin secret (enter a random token):

```powershell
npx wrangler secret put ADMIN_TOKEN
```

5. Publish the Worker:

```powershell
npx wrangler publish
```

6. After publish, update `frontend/src/index.html`'s `window.API_URL` to your worker URL (shown after `publish`).

Notes on R2

- Create an R2 bucket named `rsvp-images` in the Cloudflare dashboard and upload images. Use the R2 object URLs in `index.html`.

If you already have a D1 database

- Database name: `renewal-party`
- Database ID: `6dd2d7f1-0fa8-4b9d-9b51-cb6cd4b271bd`

To apply the migration and publish (using your existing DB):

```powershell
cd worker
npm install
npx wrangler d1 migrations apply renewal-party
npx wrangler secret put ADMIN_TOKEN
npx wrangler publish
```

After publish, update `frontend/src/index.html`'s `window.API_URL` to the Worker URL.

