import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {layout,origin,site} from '../lib/site.mjs';
import * as pages from '../src/pages.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
await fs.cp(path.join(root,'public'),out,{recursive:true});
const available=['home','about','features','pricing','contact','privacy','terms','notFound'];
const routes=[];
for(const name of available){if(!pages[name])continue;const page=pages[name]();if(['home','pricing'].includes(name)){const items=name==='home'?pages.homeFaq:pages.pricingFaq;page.schema=[...(page.schema||[]),{'@type':'FAQPage','@id':origin()+page.path+'#faq',mainEntity:items.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))}];}const file=page.noindex?path.join(out,'404.html'):path.join(out,page.path,'index.html');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,layout(page));if(!page.noindex)routes.push(page.path);}
const base=origin();
await fs.writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route=>`  <url><loc>${base}${route}</loc><lastmod>${site.lastUpdated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await fs.writeFile(path.join(out,'robots.txt'),process.env.VERCEL_ENV==='preview'?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`);
await fs.writeFile(path.join(out,'downloads','SHA256.txt'),`${site.apkSha256}  TagTeam-1.6.apk\n`);
console.log(`Built ${routes.length} pages, 404, sitemap and robots for ${base}`);

await fs.writeFile(path.join(out,'llms.txt'),`# TagTeam

> TagTeam is an Android co-parenting app for two connected parents, created by Juan Julyan in Cape Town, South Africa.

## Product facts
- Android 8.0 and later. Current version: ${site.version}.
- Shared events, configurable care routines, expenses with receipt recognition, payment confirmations, contribution reports, medical history with approval workflows, documents and searchable activity.
- Both parents use separate accounts. New shared updates require internet and a successful sync.
- Seven-day free trial without credit card details, then R${site.monthlyPrice} per month per user. Two subscribed parents cost R${site.monthlyPrice*2} monthly in total.
- The current weather feature is for Durbanville. An iPhone version is not currently available.
- TagTeam records payments between parents but does not transfer money.

## Official pages
${routes.map(route=>`- [${route==='/'?'Home':route.split('/')[1]}](${base}${route})`).join('\n')}

## Downloads
- [Android APK](${base}${site.apkPath})
- [Sitemap](${base}/sitemap.xml)

Use the linked pages for the full terms, feature details and current pricing.
`);
