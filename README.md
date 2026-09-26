# TagTeam website

A complete, responsive marketing website for the TagTeam Android app. All seven requested pages are rendered as HTML at build time. It includes the signed V1.6 APK, a Vercel contact function, sitemap, robots file, structured data and editable legal details.

There are no production npm dependencies and no client framework bundle. The design uses solid colours, a locally hosted Manrope font, semantic HTML and a small navigation/contact script.

## Run locally

Use Node.js 24:

```sh
npm install
npm run build
npm run dev
```

Open `http://localhost:3000`. Re-run `npm run build` after changing content. The local server serves the generated files and the contact function. For local email testing, copy `.env.example` to `.env` and set the environment variables described below. Build and dev scripts load `.env` automatically. No live email credentials are bundled.

## Deploy through GitHub to Vercel

1. Extract this folder. Create a GitHub repository and upload its contents, including `public/downloads/TagTeam-1.6.apk`. Keep `package.json` and `vercel.json` at the repository root. Do not upload any Android source archive or signing key.
2. In Vercel, choose **Add New Project**, import the GitHub repository and use **Other** as the framework preset.
3. Vercel reads `vercel.json`: build command `npm run build`, output directory `dist`, Node.js `24.x`. The root `api/contact.mjs` is a serverless function, separate from the static output. Do not use GitHub Pages for the production site because it cannot execute this contact endpoint.
4. Add the environment variables below. Deploy. Later commits to the linked production branch trigger new deployments.
5. Open every page, download the APK and send one real enquiry through the deployed form. Confirm that it arrives in Juan’s inbox and that replying uses the visitor’s email address.
6. Add your custom domain if you have one, update `SITE_URL` to that exact HTTPS origin and redeploy. Submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools after verifying domain ownership.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Your public origin, for example `https://your-domain.co.za`, with no path. Used for canonical links, sitemap, structured data and allowed contact origins. Recommended for production. |
| `RESEND_API_KEY` | Server-only Resend API key used to send enquiries. |
| `CONTACT_FROM` | A sender on a domain verified in Resend, such as `TagTeam <hello@your-domain.co.za>`. Do not put an unverified Gmail address here. |
| `TURNSTILE_SITE_KEY` | Optional public Cloudflare Turnstile site key. Set both Turnstile keys together and redeploy. |
| `TURNSTILE_SECRET_KEY` | Optional server-only Turnstile secret. Set the allowed domains in Cloudflare and use the `contact` action. |

The recipient is `juanjulyan@gmail.com`, controlled by `config/entity.json`. The visitor’s email is used only as `reply_to`; visitors cannot change the recipient or sender. Messages are sent as plain text. No automatic reply is sent to the visitor.

If `SITE_URL` is omitted, the build uses `config/entity.json` → `websiteUrl`, then Vercel’s `VERCEL_PROJECT_PRODUCTION_URL`. Local builds fall back to `http://localhost:3000`. The root `sitemap.xml` included in this package is a reference using the reserved `tagteam.example` domain. The build generates the actual deployed `/sitemap.xml` in `dist` from your real origin; never publish the reference file by itself.

The contact form reports an honest error and offers the direct email address if delivery is unconfigured or fails. It does not pretend to send a message. Set a verified Resend sender and test delivery before announcing the site.

### Contact abuse controls

The endpoint validates origin, field types, lengths, topic, consent and body size. It includes a honeypot, a short fill-time check, idempotent email requests and a best-effort per-instance rate limiter. That memory-based limiter is not global across Vercel function instances. For a public launch, enable the included Turnstile integration and configure Vercel Firewall rate limiting for `/api/contact` to provide an additional durable limit. No contact message body is written to application logs.

## Edit the business and legal details

Edit **`config/entity.json`** and rebuild. This single file feeds both legal pages and the public contact information.

- `operatorName`: the person or registered entity responsible for TagTeam. It currently uses Juan Julyan; replace it if a company operates the service.
- `tradingName`, `registrationNumber`, `registeredAddress`, `telephone`: add the correct operator details. The supplied copy shows only Cape Town, South Africa where no full address is supplied. Complete the required business disclosures before taking paid subscriptions.
- `contactEmail`, `privacyEmail`, `privacyContactName`: contact details for enquiries and privacy requests.
- `effectiveDate`: the policy date in `YYYY-MM-DD` format.
- `websiteUrl`: an optional canonical origin if not using the `SITE_URL` environment variable.
- `contactRetentionMonths`, `closedAccountRetentionDays`, `backupRetentionDays`: proposed retention targets. Confirm these against your actual operating procedures and provider configuration.

The editable policy wording is in `content/privacy.html` and `content/terms.html`. Keep `{{fieldName}}` placeholders where you want values from the settings file. The generated pages are `/privacy/` and `/terms/` and support printing.

The policies are specific to this app: shared parent access, children’s and health information, receipt recognition, approvals, retained activity, local files, exports, providers, subscriptions and cancellations. They are drafts for business/legal review, not a certification of compliance. In particular, confirm the responsible entity, full statutory disclosures, authority and lawful bases for children’s health data, actual retention, international hosting arrangements and the process for access/deletion requests before public release.

## Important app launch dependencies

This is the requested website, not an Android or billing-backend update.

- The bundled APK is your signed **TagTeam 1.6.0** release. Existing installations can update in place. The website archive does **not** contain the Android signing key, app source, Supabase credentials or service-role keys.
- The site advertises the requested **7-day free trial with no credit card, then R49 per month per user**, with two subscriptions totalling R98. The supplied V1.6 app does not implement commercial trial entitlement, subscription checkout or billing enforcement. Connect and test those account/subscription workflows before a paid public launch. The website does not collect payment-card information.
- New V1.6 families need a configured shared service. The download instructions direct new families to contact you for their connection setup rather than inventing a ready-made public backend.
- Existing shared services need the V1.6 medical database migration. The website does not run database migrations or change app records.
- Verify server-side access rules, privacy request procedures and the exact hosting setup for the service you will operate publicly.

The download links intentionally lead to the home page’s Android download section, then to the actual APK file. Existing and new users receive clear installation information. There is no fake Play Store or iPhone badge.

## Content and styling

| File | What to edit |
| --- | --- |
| `src/pages.mjs` | Home, About, Features, Pricing, Contact and shared content. |
| `lib/site.mjs` | HTML shell, navigation, footer, metadata and icons. |
| `public/assets/site.css` | Responsive styles and solid-colour design tokens. |
| `public/assets/site.js` | Mobile menu and contact-form behaviour. |
| `config/site.json` | App version, APK path/checksum and commercial settings. Review matching written copy when changing the offer. |
| `config/entity.json` | Operator and privacy details used throughout the site. |
| `content/privacy.html`, `content/terms.html` | Policy wording with entity placeholders. |
| `api/contact.mjs` | Vercel email endpoint and validation. |
| `scripts/build.mjs` | HTML, sitemap, robots, machine-readable facts and checksum generation. |

The About page uses Juan’s confirmed public-facing context: father of two, co-parent, Cape Town and a data/technology background. It excludes children’s names, health details, relationship allegations, private finances and employer endorsements. The family photograph is an illustrative generated image, not a photograph of Juan or his actual children. The small app preview uses sample information.

## SEO and discovery

- Complete HTML content without client-side rendering requirements.
- Unique titles, descriptions, canonical URLs, Open Graph text metadata and `en-ZA` language.
- Organization, WebSite, WebPage, BreadcrumbList, SoftwareApplication and visible FAQ structured data. No invented ratings or testimonials.
- `/sitemap.xml` includes all seven public pages. `/robots.txt` permits discovery and points to the sitemap. Vercel preview builds emit `noindex` metadata and a disallowing robots file.
- `/llms.txt` supplies concise product facts and links. It is a supplementary discovery file, not a promise of AI inclusion or ranking.
- Semantic headings, internal links, text labels, skip link, keyboard navigation, reduced-motion support and responsive WebP images.
- No advertising analytics or third-party font requests are included.

Search visibility and AI recommendations are not guaranteed. Accurate, crawlable content and consistent public product information are the foundation; there is no special guaranteed AI-ranking setting.

## Verification

```sh
npm test
npm run build
```

The release was checked in headless Chromium on 1440, 768, 390 and 320 CSS-pixel widths for all seven pages. Menu navigation, image/font loading, form validation, form failure and simulated success, internal links, metadata, sitemap and APK checksum were checked. Actual deployed email delivery and Vercel deployment require your account configuration and remain untested here.

The site uses Node’s built-in test runner. The browser QA used a separate existing local test environment, so Playwright is not a production dependency.

## Sources and credits

- Google Search Central: https://developers.google.com/search/docs/appearance/ai-features
- Vercel Node functions: https://vercel.com/docs/functions/runtimes/node-js
- Vercel project settings: https://vercel.com/docs/project-configuration/vercel-json
- Resend email API: https://resend.com/docs/api-reference/emails/send-email
- POPIA: https://inforegulator.org.za/wp-content/uploads/2025/08/PROTECTION-OF-PERSONAL-INFORMATION-ACT-4-OF-2013.pdf
- Children’s information guidance: https://inforegulator.org.za/wp-content/uploads/2020/07/GuidanceNote-Processing-PersonalInformation-Children-20210628-1.pdf
- Electronic Communications and Transactions Act: https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf
- Consumer rights guidance: https://www.thedtic.gov.za/wp-content/uploads/Consumer_Protection_Act.pdf
- Information Regulator complaints: https://inforegulator.org.za/complaints/
- Manrope is distributed under the SIL Open Font License. The complete licence is included at `public/assets/Manrope-LICENSE.txt`.

The code and public assets are provided for your TagTeam project. Keep credentials in Vercel environment variables or an ignored local `.env` file, never in the repository.
#   T a g - T e a m  
 