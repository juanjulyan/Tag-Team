import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {layout,origin,site,entity,escape,validateStoreUrl} from '../lib/site.mjs';
import {allFaqs} from '../src/faqs.mjs';
import * as pages from '../src/pages.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
if(typeof site.publicServiceReady!=='boolean')throw new Error('publicServiceReady must be a boolean.');
if(!Number.isInteger(site.trialDays)||site.trialDays<1)throw new Error('trialDays must be a positive integer.');
if(!Number.isFinite(site.monthlyPrice)||site.monthlyPrice<0)throw new Error('monthlyPrice must be a valid price.');
validateStoreUrl(site.appStoreUrl,'apple');validateStoreUrl(site.googlePlayUrl,'google');
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
await fs.cp(path.join(root,'public'),out,{recursive:true});
const routes=[];
for(const name of ['home','about','features','pricing','faqs','download','contact','privacy','terms','notFound']){
 const page=pages[name](),file=page.noindex?path.join(out,'404.html'):path.join(out,page.path,'index.html');
 await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,layout(page));
 if(!page.noindex)routes.push(page.path);
}
const base=origin();
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route=>`  <url><loc>${escape(base+route)}</loc><lastmod>${site.lastUpdated}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(out,'sitemap.xml'),sitemap);
await fs.writeFile(path.join(root,'sitemap.xml'),sitemap);
await fs.writeFile(path.join(out,'robots.txt'),process.env.VERCEL_ENV==='preview'?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`);
const strip=html=>html.replace(/<[^>]*>/g,'').replaceAll('&amp;','&');
await fs.writeFile(path.join(out,'llms.txt'),`# TagTeam\n\n> ${site.description}\n\n## Product facts\n- Website and app reference version: ${site.version}. Updated ${site.lastUpdated}.\n- Created by Juan Julyan in Cape Town, South Africa.\n- Website offer: ${site.trialDays}-day free trial. No card needed. Trial does not automatically convert to a subscription. R${site.monthlyPrice}/month per user if they subscribe; R${site.monthlyPrice*2}/month for two subscribed parents.\n- ${site.publicServiceReady?'Public registration is open.':'Public registration is preparing to launch.'}\n- ${site.googlePlayUrl?'Google Play listing: '+site.googlePlayUrl:'Google Play listing is not yet linked.'}\n- ${site.appStoreUrl?'App Store listing: '+site.appStoreUrl:'iPhone release is not currently available; App Store listing is not yet linked.'}\n- Two linked parent accounts in one family per account. Separate email verification and subscription per parent.\n- Shared care routines, events, receipts, expenses, payment confirmations, contribution PDF reports, medical approvals, family documents and searchable activity.\n- Current Android app uses Payfast for subscriptions. Parents pay family expenses outside the app.\n- Optional weather location is not shared with the co-parent. No continuous tracking. Care routines use South African time.\n- Supabase records and private Azure file storage; current Android local files are encrypted. Not end-to-end encrypted. Exports are ordinary files.\n- Account and support contact: ${entity.contactEmail}.\n\n## Official pages\n${routes.map(route=>`- [${route==='/'?'Home':route.split('/')[1]}](${base+route})`).join('\n')}\n\n## Frequently asked questions\n${allFaqs.map(({q,a})=>`### ${q}\n${strip(a)}\n`).join('\n')}\nUse the official pages for current availability, full terms and privacy information.\n`);
console.log(`Built ${routes.length} pages, 404, sitemap.xml, robots.txt and llms.txt for ${base}`);
