# TagTeam Website V2.0

A responsive marketing website for TagTeam App V2.0.0, using the supplied app logo and its blue, orange and navy palette. This package retains the original Node static-build architecture and Vercel contact endpoint. There are no runtime npm dependencies.

## Add your store links

Open `config/site.json` and fill these two values with your real, published listings:

```json
"appStoreUrl": "",
"googlePlayUrl": ""
```

Use an `https://apps.apple.com/.../id...` listing for Apple, and an `https://play.google.com/store/apps/details?id=...` listing for Google Play. Leave a value empty until that listing exists. Empty values show an honest “Coming soon” store panel without a broken or fake link. Each store can go live independently. Store URLs are validated during the build.

Set `publicServiceReady` to `true` only once account registration and the public service are live. Rebuild and redeploy after changing configuration. The website does not deploy or modify the app backend.

The site now advertises **14 days free**, followed by **R49/month per user**, or **R98/month for two subscribed parents**. The trial does not automatically create a paid subscription. As requested, the Android app and backend have not been changed. Before enabling public registration, align their trial duration with this website offer. Confirm release-specific billing and device requirements when publishing future store releases. The current supplied application is Android; the iPhone listing remains forthcoming.

## Preview and build

Use Node.js 24 (the project already targets this version):

```sh
npm run build
npm run dev
```

Open `http://localhost:3000`. The compiled pages are in `dist/`. Do not double-click HTML files: root-relative links need a web server.

Run the final checks after a build:

```sh
npm test
```

No package installation is required for the production build or tests. The existing package lock remains included.

## Deploy through GitHub and Vercel

1. Replace the existing repository’s website source with the contents of this project folder. Preserve your repository’s own Git history and existing secret environment configuration.
2. Keep `vercel.json`, `api/`, `config/`, `lib/`, `src/`, `scripts/`, `content/`, `public/` and the package files at the configured project root.
3. On Vercel, use the existing project, Node.js 24, build command `npm run build` and output directory `dist`. Framework is Other / no framework. The included Vercel configuration specifies these settings.
4. Retain `SITE_URL=https://tagteam.co.za` or set it to the actual canonical production origin. `config/entity.json` also contains the canonical site URL and operator details.
5. Push to your configured deployment branch. Verify the live site, then submit `/sitemap.xml` in your search-engine webmaster tools.

`dist/` is included as a ready-built copy, but GitHub/Vercel should rebuild from the source. Vercel preview deployments are marked `noindex` and blocked in their generated robots file. Production pages allow indexing. The old direct-download URLs redirect to `/download/`; no APK is packaged or publicly served.

## Contact form

All TagTeam support and privacy addresses are **juan@tagteam.co.za**. The existing Vercel handler is retained, including validation, honeypot, origin checks, request-size limits, a per-instance rate limiter, and optional Turnstile protection.

Set these server-side Vercel environment values for delivery:

- `RESEND_API_KEY`: your email provider key.
- `CONTACT_FROM`: a sender on your verified domain, for example `TagTeam <website@tagteam.co.za>`.
- Optional: set both `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, then rebuild.

See `.env.example` for local development. Do not commit a completed `.env`. Without delivery credentials, the form returns a clear error and directs the visitor to email Juan; it never claims an email was sent. Live email delivery was not attempted during verification. Browser form checks used a mocked local response.

## Pages and content

- `/`: homepage with three diverse family scenarios, shared feature cards, illustrative app overview, getting-started steps, FAQ highlights and store panels.
- `/about/`: founder story and the supplied superhero family portrait.
- `/features/`: the seven areas of the V2.0.0 app, including operational limits.
- `/pricing/`: the 14-day offer and R49 per-user monthly pricing.
- `/faq/`: 40 searchable, filterable questions and answers across six topics; each answer has a stable anchor.
- `/download/`: Apple App Store and Google Play availability and links.
- `/contact/`, `/privacy/`, `/terms/`: retained contact and legal structure with matching design and offer.
- `/404.html`: the styled missing-page response.

Edit product facts in `config/site.json`, operator details in `config/entity.json`, FAQs in `src/faqs.mjs`, feature details in `src/features.mjs`, marketing pages in `src/pages.mjs`, and legal text in `content/`.

Images are served locally as responsive WebP files. The exact original app logo is preserved in `public/assets/tagteam-logo-original.png`; the display logo, icons and social card derive from it. The app overview is explicitly labelled as an illustration with sample information, not a device screenshot. Photography sources are recorded in `IMAGE-CREDITS.md`.

The carousel supports previous/next, direct selection, keyboard arrows, swipe, pause and play. It pauses on focus, hover, a hidden page or when offscreen; reduced-motion users start with autoplay off. FAQs and navigation remain available without JavaScript. Large headings use fluid sizing and balanced wrapping with no forced line breaks.

## Search and AI discovery

Each public page has a unique title and description, canonical URL, semantic headings, crawlable links, and Open Graph/Twitter metadata with a local 1200 × 630 share image. JSON-LD describes the organisation, website, page, breadcrumbs, app, and visible FAQ answers. No invented ratings, testimonials or review counts are included. The software offer is only published in structured data when public registration is marked ready.

The build generates the root and `dist/sitemap.xml`, production/preview-aware `robots.txt`, and a readable `llms.txt` product reference from the same content. The sitemap covers all nine public pages and excludes the 404 and API. `lastmod` uses the explicit content date in `config/site.json`, not every build time.

Google’s current guidance focuses on useful content, indexability, links, good page experience and matching structured data. `llms.txt` is supplementary; it is not a ranking mechanism or a guarantee of AI recommendations. Google removed its FAQ rich result feature in 2026; the FAQ schema is retained as machine-readable page semantics, with no rich-result promise. See `RESEARCH-SOURCES.md`.

## Verification

See `VERIFICATION.json` for the final executed build, automated checks and browser results. The code is packaged for deployment; no live GitHub/Vercel publication, app-store publication, backend deployment, or real contact email submission is performed by this package.
