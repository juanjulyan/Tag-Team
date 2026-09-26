import {createHash, randomUUID} from 'node:crypto';
import {entity, escape, origin} from '../lib/site.mjs';
const topics=new Set(['Getting started','App support','Pricing and subscriptions','Feedback and ideas','Privacy or data request','Something else']);
const visits=new Map();
const MAX_BYTES=24000;
const help=`Please email ${entity.contactEmail} directly, or try again later.`;
function fail(status,message){return {status,body:{ok:false,error:message}};}
export function validateContact(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return 'Please complete the enquiry form.';
 if(typeof input.company==='string'&&input.company.trim())return 'honeypot';
 for(const field of ['name','email','subject','message'])if(typeof input[field]!=='string')return 'Please complete every required field.';
 const name=input.name.trim(),email=input.email.trim(),message=input.message.trim();
 if(name.length<2||name.length>100||/[\r\n\x00-\x1f]/.test(name))return 'Enter your name using 2 to 100 characters.';
 if(email.length>254||! /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(email)||/[\x00-\x1f]/.test(email))return 'Enter a valid email address.';
 if(!topics.has(input.subject))return 'Choose an enquiry topic.';
 if(message.length<10||message.length>5000||message.includes('\0'))return 'Enter a message between 10 and 5,000 characters.';
 if(![true,'on','true'].includes(input.consent))return 'Please agree to the use of your details to answer this enquiry.';
 if(input.submissionId&&!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(input.submissionId))return 'Refresh the page and try again.';
 return null;
}
function allowedOrigins(env){
 const result=new Set([origin(env)]);
 for(const name of ['VERCEL_URL','VERCEL_PROJECT_PRODUCTION_URL'])if(env[name])result.add(new URL('https://'+env[name]).origin);
 if(!env.VERCEL){result.add('http://localhost:3000');result.add('http://127.0.0.1:3000');}
 return result;
}
function limited(ip,now){
 for(const [key,item] of visits)if(item.until<=now)visits.delete(key);
 // This in-memory guard is per function instance. Turnstile / Vercel Firewall
 // provides the durable abuse-control layer for a public production site.
 if(visits.size>10000)visits.delete(visits.keys().next().value);
 const key=createHash('sha256').update(ip||'unknown').digest('hex');
 const item=visits.get(key)||{count:0,until:now+15*60*1000};item.count++;visits.set(key,item);
 return item.count>5;
}
export async function processContact({input,requestOrigin,ip='unknown',env=process.env,fetcher=fetch,now=Date.now(),rateLimit=true}){
 if(requestOrigin&&!allowedOrigins(env).has(requestOrigin))return fail(403,'Please send your enquiry from the TagTeam website.');
 const invalid=validateContact(input);
 if(invalid==='honeypot')return {status:200,body:{ok:true}};
 if(invalid)return fail(400,invalid);
 if(rateLimit&&limited(ip,now))return fail(429,'You have sent several enquiries. Please wait 15 minutes before trying again.');
 if(input.startedAt){const elapsed=now-Number(input.startedAt);if(!Number.isFinite(elapsed)||elapsed<1500)return fail(400,'Please take a moment to check your message, then send it again.');}
 if(!env.RESEND_API_KEY||!env.CONTACT_FROM)return fail(503,`The enquiry service is temporarily unavailable. ${help}`);
 if(Boolean(env.TURNSTILE_SITE_KEY)!==Boolean(env.TURNSTILE_SECRET_KEY))return fail(503,`The enquiry service is temporarily unavailable. ${help}`);
 if(env.TURNSTILE_SECRET_KEY){
  if(typeof input['cf-turnstile-response']!=='string'||!input['cf-turnstile-response'])return fail(400,'Complete the security check, then send your message.');
  try{
   const result=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:input['cf-turnstile-response']}),signal:AbortSignal.timeout(8000)});
   const verified=await result.json();
   const hosts=[...allowedOrigins(env)].map(value=>new URL(value).hostname);
   if(!result.ok||!verified.success||verified.action!=='contact'||!hosts.includes(verified.hostname))return fail(400,'The security check could not be verified. Please try again.');
  }catch{return fail(503,`The security check is temporarily unavailable. ${help}`);}
 }
 const id=input.submissionId||randomUUID();
 const subject=`TagTeam enquiry: ${input.subject}`;
 const text=`Name: ${input.name.trim()}\nEmail: ${input.email.trim()}\nTopic: ${input.subject}\n\n${input.message.trim()}\n\nPrivacy notice acknowledged: yes\nReference: ${id}`;
 try{
  const result=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`tagteam-contact/${id}`},body:JSON.stringify({from:env.CONTACT_FROM,to:[entity.contactEmail],reply_to:input.email.trim(),subject,text}),signal:AbortSignal.timeout(10000)});
  if(!result.ok)return fail(result.status===429?429:502,`We could not confirm delivery of your message. ${help}`);
  const delivered=await result.json();
  if(!delivered.id)return fail(502,`We could not confirm delivery of your message. ${help}`);
  return {status:200,body:{ok:true}};
 }catch{return fail(502,`We could not confirm delivery of your message. ${help}`);}
}
async function readBody(req){
 if(Number(req.headers['content-length'])>MAX_BYTES)throw Object.assign(new Error('Your message is too large.'),{status:413});
 if(req.body!==undefined){const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(raw)>MAX_BYTES)throw Object.assign(new Error('Your message is too large.'),{status:413});if(typeof req.body==='object')return req.body;return parse(raw,req.headers['content-type']);}
 let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>MAX_BYTES)throw Object.assign(new Error('Your message is too large.'),{status:413});}
 return parse(raw,req.headers['content-type']);
}
function parse(raw,type=''){if(type.includes('application/json'))return JSON.parse(raw);if(type.includes('application/x-www-form-urlencoded'))return Object.fromEntries(new URLSearchParams(raw));throw Object.assign(new Error('Unsupported form format.'),{status:415});}
function respond(req,res,status,data){
 res.statusCode=status;res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const html=String(req.headers['content-type']||'').includes('application/x-www-form-urlencoded');
 if(!html){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));return;}
 const title=data.ok?'Thank you. Your enquiry has been sent.':'Your enquiry could not be sent.';
 const message=data.ok?'Juan will reply to the email address you provided.':data.error;
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end(`<!doctype html><html lang="en-ZA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} | TagTeam</title><link rel="stylesheet" href="/assets/site.css"><link rel="icon" href="/favicon.svg"></head><body><main class="container section error-page"><p class="eyebrow">TagTeam</p><h1>${title}</h1><p>${escape(message)}</p><a class="button" href="/contact/">Back to Contact Us</a></main></body></html>`);
}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return respond(req,res,405,{ok:false,error:'Use the contact form to send an enquiry.'});}
 try{
  const input=await readBody(req);
  const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  const result=await processContact({input,ip,requestOrigin:req.headers.origin});
  if(result.status===429)res.setHeader('Retry-After','900');
  respond(req,res,result.status,result.body);
 }catch(error){respond(req,res,error.status||400,{ok:false,error:error.status?error.message:'Check your enquiry and try again.'});}
}
