const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){if(!menuButton||!nav)return;menuButton.setAttribute('aria-expanded','false');nav.classList.remove('is-open');document.body.classList.remove('menu-open');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
window.matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
const form=document.querySelector('#contact-form');
if(form){
 const status=form.querySelector('[role=status]'),button=form.querySelector('button[type=submit]');
 form.querySelector('[name=startedAt]').value=String(Date.now());
 form.addEventListener('input',()=>{delete form.dataset.submissionId;});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=Object.fromEntries(new FormData(form));data.consent=form.elements.consent.checked;
  data.submissionId=form.dataset.submissionId||(form.dataset.submissionId=crypto.randomUUID());
  button.disabled=true;button.textContent='Sending your message…';status.textContent='';
  try{
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
   let result;try{result=await response.json();}catch{throw new Error('We could not send your message. Please try again, or email us directly.');}
   if(!response.ok||!result.ok)throw new Error(result.error||'We could not send your message. Please try again.');
   status.dataset.state='success';status.textContent='Thank you. Your message has been sent to Juan. We’ll reply by email.';
   form.reset();delete form.dataset.submissionId;form.elements.startedAt.value=String(Date.now());
  }catch(error){status.dataset.state='error';status.textContent=error.name==='TimeoutError'?'Delivery could not be confirmed. Please retry this same message, or email us directly.':error.message;}
  finally{button.disabled=false;button.textContent='Send enquiry';window.turnstile?.reset();status.focus();}
 });
}
