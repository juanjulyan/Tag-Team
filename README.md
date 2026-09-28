# TagTeam website

A complete, responsive marketing website for the TagTeam Android app. All seven requested pages are rendered as HTML at build time. It includes the signed Public V2.0.0 APK, a Vercel contact function, sitemap, robots file, structured data and editable legal details. The existing seven pages and solid-colour design are retained.

There are no production npm dependencies and no client framework bundle. The design uses solid colours, a locally hosted Manrope font, semantic HTML and a small navigation/contact script.

## Run locally

Use Node.js 24:

```sh
npm install
npm run build
npm run dev
```

Open `http://localhost:3000`. Re-run `npm run build` after changing content. The local server serves the generated files and the contact function. For local email testing, copy `.env.example` to `.env` and set the environment variables described below. Build and dev scripts load `.env` automatically. No live email credentials are bundled. For a local-origin canonical preview, set `SITE_URL=http://localhost:3000`; otherwise metadata uses the production domain.

## Update your existing GitHub/Vercel website

1. Replace the website source in your existing repository with this folder's contents. Keep your repository history and Vercel project connection. Do not upload the enclosing ZIP or `dist` as the project root.
2. Remove the old `public/downloads/TagTeam-1.6.apk` from the current repository tree. This release includes only `TagTeam-Public-2.0.0.apk`; its link, download headers and checksum have all changed together.
3. Keep server secrets in Vercel environment variables. Confirm `SITE_URL=https://tagteam.co.za`, a working Resend key and a verified `CONTACT_FROM` sender. Enquiries now go to `juan@tagteam.co.za`.
4. Complete the entity details and review the public-service readiness section below. Leave `publicServiceReady` false until the app's services are deployed and checked.
5. Commit to your connected production branch. Vercel rebuilds the seven pages, `/sitemap.xml`, `/robots.txt`, `/llms.txt` and the download checksum. After deployment, check the new APK download, all pages and one real contact enquiry.

## Deploy through GitHub to Vercel

1. Extract this folder. Create a GitHub repository and upload its contents, including `public/downloads/TagTeam-Public-2.0.0.apk`. Keep `package.json` and `vercel.json` at the repository root. Do not upload any Android source archive or signing key.
2. In Vercel, choose **Add New Project**, import the GitHub repository and use **Other** as the framework preset.
3. Vercel reads `vercel.json`: build command `npm run build`, output directory `dist`, Node.js `24.x`. The root `api/contact.mjs` is a serverless function, separate from the static output. Do not use GitHub Pages for the production site because it cannot execute this contact endpoint.
4. Add the environment variables below. Deploy. Later commits to the linked production branch trigger new deployments.
5. Open every page, download the APK and send one real enquiry through the deployed form. Confirm that it arrives in Juan’s inbox and that replying uses the visitor’s email address.
6. Add your custom domain if you have one, update `SITE_URL` to that exact HTTPS origin and redeploy. Submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools after verifying domain ownership.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Your public origin, for example `https://tagteam.co.za`, with no path. Used for canonical links, sitemap, structured data and allowed contact origins. Recommended for production. |
| `RESEND_API_KEY` | Server-only Resend API key used to send enquiries. |
| `CONTACT_FROM` | A sender on a domain verified in Resend, such as `TagTeam <hello@tagteam.co.za>`. Do not put an unverified Gmail address here. |
| `TURNSTILE_SITE_KEY` | Optional public Cloudflare Turnstile site key. Set both Turnstile keys together and redeploy. |
| `TURNSTILE_SECRET_KEY` | Optional server-only Turnstile secret. Set the allowed domains in Cloudflare and use the `contact` action. |

The recipient is `juan@tagteam.co.za`, controlled by `config/entity.json`. The visitor’s email is used only as `reply_to`; visitors cannot change the recipient or sender. Messages are sent as plain text. No automatic reply is sent to the visitor.

If `SITE_URL` is omitted, the build uses `config/entity.json` → `websiteUrl`, then Vercel’s `VERCEL_PROJECT_PRODUCTION_URL`. Local builds fall back to `http://localhost:3000`. The included `sitemap.xml` uses `https://tagteam.co.za`, which is now the default in `config/entity.json`. The build regenerates `/sitemap.xml` in `dist` from the selected origin. Use `SITE_URL` to override it for a different production domain.

The contact form reports an honest error and offers the direct email address if delivery is unconfigured or fails. It does not pretend to send a message. Set a verified Resend sender and test delivery before announcing the site.

### Contact abuse controls

The endpoint validates origin, field types, lengths, topic, consent and body size. It includes a honeypot, a short fill-time check, idempotent email requests and a best-effort per-instance rate limiter. That memory-based limiter is not global across Vercel function instances. For a public launch, enable the included Turnstile integration and configure Vercel Firewall rate limiting for `/api/contact` to provide an additional durable limit. No contact message body is written to application logs.

## Edit the business and legal details

Edit **`config/entity.json`** and rebuild. This single file feeds both legal pages and the public contact information.

- `operatorName`: the person or registered entity responsible for TagTeam. It currently uses Juan Julyan; replace it if a company operates the service.
- `tradingName`, `registrationNumber`, `registeredAddress`, `telephone`: add the correct operator details. The supplied copy shows only Cape Town, South Africa where no full address is supplied. Complete the required business disclosures before taking paid subscriptions. Keep the public website policies and the app's activation notices aligned.
- `contactEmail`, `privacyEmail`, `privacyContactName`: contact details for enquiries and privacy requests.
- `effectiveDate`: the policy date in `YYYY-MM-DD` format.
- `websiteUrl`: an optional canonical origin if not using the `SITE_URL` environment variable.
- `contactRetentionMonths`, `closedAccountRetentionDays`, `backupRetentionDays`: proposed retention targets. Confirm these against your actual operating procedures and provider configuration. Define retention and deletion procedures for trial-eligibility email hashes, payment records, shared audit history and Azure soft-deleted files as well; the website does not implement a retention job.

The editable policy wording is in `content/privacy.html` and `content/terms.html`. Keep `{{fieldName}}` placeholders where you want values from the settings file. The generated pages are `/privacy/` and `/terms/` and support printing.

The policies are specific to this app: shared parent access, children’s and health information, receipt recognition, approvals, retained activity, local files, exports, providers, subscriptions and cancellations. They are drafts for business/legal review, not a certification of compliance. In particular, confirm the responsible entity, full statutory disclosures, authority and lawful bases for children’s health data, actual retention, international hosting arrangements and the process for access/deletion requests before public release.

## Public 2.0.0 and launch status

This website includes the existing **TagTeam Public 2.0.0** signed APK. It does not rebuild or change the app or deploy the app's backend.

- APK: `public/downloads/TagTeam-Public-2.0.0.apk`, 5,487,751 bytes.
- SHA-256: `aa4cdf673c8f10b330092a00bbbfb5dd7e36261bdd4da4d49f712a1d3895f10f`.
- Android package: `za.co.tagteam.app`, version code `20000`, Android 8.0 or later.
- Public signing certificate SHA-256: `857e7adf91e79c8895042d7caa70d71701b1e61858a21e92b34cc036ba7d86e1`.
- It installs **separately** from the private `za.co.coparent` app. It does not upgrade or import that private family's records. Keep the old app and its data until you have exported anything you need.
- Public sign-up, email verification, family creation and invitation, per-user trials, Payfast subscriptions, location consent and in-app support are implemented in the separately delivered app/backend source.

**Cloud deployment has not been completed here.** `config/site.json` deliberately contains `"publicServiceReady": false`. The website's download and pricing sections explain that the APK is available while registration, sync and subscriptions are preparing to open. The FAQ and `llms.txt` use the same status. Paid Offer structured data is omitted until the flag is true.

Before setting this flag to `true`, complete the previously delivered **TagTeam-Public-Setup.md** for a fresh Supabase project, private Azure storage/API, authentication email, commercial weather API, Resend support and Payfast. Verify registration, two-family access separation, upload/download, both phones syncing, optional location, initial and recurring billing, cancellation and support delivery using the deployed services and real Android phones. The API must be reachable at the APK's embedded `https://api.tagteam.co.za`. Only then set `publicServiceReady` to `true`, rebuild and commit the change to your GitHub production branch.

The website stays on GitHub/Vercel. The app's Azure Functions handlers, database setup and Payfast webhooks belong to the separate app backend. **Do not copy app backend handlers into this website's Vercel `api` directory.** The website never asks parents for Supabase details, accepts subscription payments itself or handles private family uploads.

### What the updated copy describes

- New parents use their own verified emails and names. One family supports two parent accounts. Invitations are email-bound, single-use and valid for seven days.
- Each 7-day trial starts on verified account activation, without payment details. It does not automatically convert. Checkout is offered after trial expiry: the user opts into R49 initially and R49 monthly through Payfast. Two subscribed parents total R98/month.
- Cancel renewal in Family → Subscription; confirmed cancellation retains access through the paid period. Subscription controls and Support remain available after expiry. Refunds, deletion and access requests are support-managed.
- Supabase stores authentication and structured family/billing records; Azure stores private uploaded files and serves the app API. Access checks separate families. Local app records and files are encrypted; exported files are not. The app is not end-to-end encrypted.
- Weather uses an optional approximate location saved on the phone and sent for forecast requests. It is not shared with the other parent. There is no continuous location tracking. Schedules and evening briefings remain on South African time.
- Existing events, care routines, receipt recognition, expense categories, confirmed-contribution reports, medical approvals, documents and activity history remain covered.
- The contact form sends to `juan@tagteam.co.za`; in-app Family → Support uses the same address through the separate Azure backend.

The archive contains no Android signing keys, Supabase credentials, Azure account keys or Payfast merchant secrets. The download section links directly to the APK and its checksum. There is no Play Store or iPhone availability claim.

## Content and styling

| File | What to edit |
| --- | --- |
| `src/pages.mjs` | Home, About, Features, Pricing, Contact and shared content. |
| `lib/site.mjs` | HTML shell, navigation, footer, metadata and icons. |
| `public/assets/site.css` | Responsive styles and solid-colour design tokens. |
| `public/assets/site.js` | Mobile menu and contact-form behaviour. |
| `config/site.json` | App version, APK path/checksum, public-service readiness and commercial settings. Review matching written copy when changing the offer. |
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

The V2.0.0 website update was checked in headless Chromium on 1440, 768, 390 and 320 CSS-pixel widths for all seven pages. Menu navigation, image/font loading, form validation, form failure and simulated success, internal links, metadata, sitemap and APK checksum were checked. Actual deployed email delivery and Vercel deployment require your account configuration and remain untested here.

The site uses Node’s built-in test runner. The browser QA used a separate existing local test environment, so Playwright is not a production dependency.

## Sources and credits

- Google Search Central: https://developers.google.com/search/docs/appearance/ai-features
- Vercel supported Node versions (Node 24 verified): https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Payfast subscriptions: https://payfast.io/features/subscriptions/
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
