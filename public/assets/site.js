document.documentElement.classList.add('js');
const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){if(!menuButton||!nav)return;menuButton.setAttribute('aria-expanded','false');nav.classList.remove('is-open');document.body.classList.remove('menu-open');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
window.matchMedia('(min-width: 801px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
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

// The slideshow is progressive enhancement: the first photo remains visible without JS.
for (const carousel of document.querySelectorAll('.family-carousel')) {
 const slides=[...carousel.querySelectorAll('.carousel-slide')];
 const dots=[...carousel.querySelectorAll('[data-slide]')];
 const toggle=carousel.querySelector('.carousel-toggle');
 const live=carousel.querySelector('.carousel-status');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,timer=null,paused=reduced.matches,hovering=false,visible=true,touchStart=null;
 carousel.querySelector('.carousel-controls').hidden=false;
 function stop(){clearInterval(timer);timer=null;}
 function updateToggle(){toggle.textContent=paused?'Play':'Pause';toggle.setAttribute('aria-label',paused?'Start automatic slideshow':'Pause automatic slideshow');}
 function schedule(){stop();if(!paused&&!hovering&&visible&&!document.hidden)timer=setInterval(()=>show(current+1),7000);}
 function show(index,manual=false){
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>{slide.hidden=i!==current;slide.classList.toggle('is-active',i===current);});
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
  slides[(current+1)%slides.length].querySelector('img').loading='eager';
  carousel.dataset.currentSlide=String(current);
  if(manual){paused=true;stop();updateToggle();live.textContent=`Photo ${current+1} of ${slides.length}: ${slides[current].querySelector('img').alt}.`;}
 }
 carousel.querySelector('.carousel-prev').addEventListener('click',()=>show(current-1,true));
 carousel.querySelector('.carousel-next').addEventListener('click',()=>show(current+1,true));
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i,true)));
 toggle.addEventListener('click',()=>{paused=!paused;updateToggle();schedule();});
 carousel.addEventListener('mouseenter',()=>{hovering=true;stop();});
 carousel.addEventListener('mouseleave',()=>{hovering=false;schedule();});
 carousel.addEventListener('focusin',()=>{paused=true;stop();updateToggle();});
 carousel.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1),true);}});
 carousel.addEventListener('touchstart',event=>{const t=event.changedTouches[0];touchStart={x:t.clientX,y:t.clientY};stop();},{passive:true});
 carousel.addEventListener('touchend',event=>{if(!touchStart)return;const t=event.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(current+(dx<0?1:-1),true);else schedule();touchStart=null;},{passive:true});
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',event=>{if(event.matches){paused=true;updateToggle();stop();}});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(carousel);
 show(0);updateToggle();schedule();
}

const search=document.querySelector('#faq-search');
if(search){
 const groups=[...document.querySelectorAll('.faq-group')],buttons=[...document.querySelectorAll('[data-filter]')];
 const count=document.querySelector('#faq-count'),none=document.querySelector('.no-results');
 const normalize=text=>text.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
 let category='all';
 document.querySelector('.faq-tools').hidden=false;
 function filter(){
  const tokens=normalize(search.value.trim()).split(/\s+/).filter(Boolean);let total=0;
  for(const group of groups){let found=0;for(const item of group.querySelectorAll('details')){const matches=(category==='all'||category===group.dataset.category)&&tokens.every(token=>normalize(item.textContent).includes(token));item.hidden=!matches;if(matches){found++;total++;}}group.hidden=found===0;}
  count.textContent=`${total} ${total===1?'question':'questions'}${search.value.trim()?' matching your search':''}`;none.hidden=total!==0;
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===category)));
 }
 search.addEventListener('input',filter);
 buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;filter();}));
 document.querySelector('#faq-clear').addEventListener('click',()=>{search.value='';category='all';filter();search.focus();});
 function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target?.tagName==='DETAILS'){search.value='';category='all';filter();target.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}}
 window.addEventListener('hashchange',openHash);openHash();
}
