import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {origin,site,layout,storeButtons,validateStoreUrl} from '../lib/site.mjs';
import * as pages from '../src/pages.mjs';
import {allFaqs} from '../src/faqs.mjs';
const names=['home','about','features','pricing','contact','privacy','terms','faqs','download'];
test('all public routes have unique titles, one H1, canonical metadata and valid structured data',()=>{
 const titles=new Set();
 for(const name of names){const page=pages[name](),html=layout(page);assert.equal((html.match(/<h1[> ]/g)||[]).length,1,name);assert.ok(html.includes('id="main"'));assert.ok(html.includes(`rel="canonical" href="${origin()+page.path}"`));assert.ok(!html.includes('{{'));assert.doesNotMatch(html,/<h[1-3][^>]*>[^]*?<br[^>]*>[^]*?<\/h[1-3]>/);const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(graph['@context'],'https://schema.org');titles.add(page.title);}
 assert.equal(titles.size,names.length);
});
test('origin rejects paths, credentials, query strings and unsafe schemes',()=>{for(const value of ['javascript:alert(1)','https://a.test/path','https://user:secret@a.test','https://a.test/?x=1'])assert.throws(()=>origin({SITE_URL:value}));assert.equal(origin({SITE_URL:'https://tagteam.example/'}),'https://tagteam.example');});
test('store links accept official listings and omit links while unavailable',()=>{
 assert.equal(validateStoreUrl('','apple'),'');
 for(const [value,kind] of [['https://example.com/id123','apple'],['javascript:alert(1)','google'],['https://play.google.com.evil.test/store/apps/details?id=a','google'],['https://apps.apple.com/','apple'],['https://play.google.com/store/apps/details','google']])assert.throws(()=>validateStoreUrl(value,kind));
 assert.equal(validateStoreUrl('https://apps.apple.com/za/app/tagteam/id123456789','apple'),'https://apps.apple.com/za/app/tagteam/id123456789');
 assert.equal(validateStoreUrl('https://play.google.com/store/apps/details?id=za.co.tagteam.app','google'),'https://play.google.com/store/apps/details?id=za.co.tagteam.app');
 const before=[site.appStoreUrl,site.googlePlayUrl];try{site.appStoreUrl='';site.googlePlayUrl='';assert.doesNotMatch(storeButtons(),/<a /);assert.equal((storeButtons().match(/Coming soon to/g)||[]).length,2);site.googlePlayUrl='https://play.google.com/store/apps/details?id=za.co.tagteam.app';assert.equal((storeButtons().match(/<a /g)||[]).length,1);}finally{[site.appStoreUrl,site.googlePlayUrl]=before;}
});
test('offer and branding are consistent; no APK download or stale trial remains',()=>{
 const html=names.map(name=>layout(pages[name]())).join('');assert.equal(site.trialDays,14);assert.equal(site.monthlyPrice,49);assert.match(pages.terms().body,/R49 per month per user/);assert.match(pages.terms().body,/R98 per month/);assert.match(html,/14-day free trial/);assert.match(html,/juan@tagteam\.co\.za/);assert.match(html,/tagteam-logo\.png/);assert.match(pages.about().body,/juan-family-960\.webp/);
 assert.doesNotMatch(html,/\.apk|7-day (free )?trial|7 days free|TagTeam[ -]1\.[0-9]|juanjulyan@gmail\.com|family-1200\.webp/);
 assert.match(pages.privacy().body,/do not describe TagTeam as end-to-end encrypted/);assert.match(pages.privacy().body,/files already exported/);
 assert.equal(pages.home().schema[0].softwareVersion,'2.0.0');assert.equal(pages.home().schema[0].offers,undefined);
});
test('all built local links and assets resolve, including fragments and social card',()=>{
 const root=new URL('../dist/',import.meta.url);
 for(const name of names){const page=pages[name](),html=fs.readFileSync(new URL('.'+page.path+'index.html',root),'utf8');
  for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(!raw.startsWith('/')&&!raw.startsWith('#'))continue;
   const url=new URL(raw,origin()+page.path);const relative=url.pathname==='/'?'index.html':url.pathname.slice(1)+(url.pathname.endsWith('/')?'index.html':'');
   const target=new URL(relative,root);assert.ok(fs.existsSync(target),`${page.path} -> ${raw}`);
   if(url.hash&&relative.endsWith('.html'))assert.ok(fs.readFileSync(target,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`Missing ${raw}`);
  }
 }
 assert.ok(fs.existsSync(new URL('assets/social-card.png',root)));
 const sitemap=fs.readFileSync(new URL('sitemap.xml',root),'utf8');assert.equal((sitemap.match(/<url>/g)||[]).length,names.length);for(const name of names)assert.ok(sitemap.includes(origin()+pages[name]().path));assert.doesNotMatch(sitemap,/404|downloads/);
});
test('the FAQ page includes every answer and matching schema',()=>{assert.equal(allFaqs.length,40);assert.equal(new Set(allFaqs.map(f=>f.id)).size,40);const page=pages.faqs();assert.equal(page.schema[0].mainEntity.length,40);for(const item of allFaqs){assert.ok(page.body.includes(`id="${item.id}"`));assert.ok(page.body.includes(item.a));}});
