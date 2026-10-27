document.documentElement.classList.add('js');
const nav = document.querySelector('#nav');
const menu = document.querySelector('#menu');
function closeMenu(returnFocus = false) {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
});
matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
// Featured approved image first; keep the three existing review slides.
const featuredSlide={title:'Mantenimiento de Áreas Verdes',src:'assets/carrusel-mantenimiento-areas-verdes.png',alt:'Mantenimiento de áreas verdes de la Junta Comunal de Santiago, con trabajadores y vehículos',body:''};
const originalSlides=[
 {title:'Fotografía institucional pendiente de aprobación'},
 {title:'Fotografía de la comunidad pendiente de aprobación'},
 {title:'Fotografía de servicios pendiente de aprobación'}
];
const reviewActivitySlide={"title": "Curso de Puntadas Típicas · Entrega de certificados", "src": "assets/curso-puntadas-tipicas-certificados.jpg", "alt": "Collage original de entrega de certificados del curso de Puntadas Típicas, con participantes y representantes institucionales.", "body": "Conoce esta actividad de capacitación para mujeres de la comunidad.", "newsId": "puntadas-tipicas-20261002"};
let slides=[featuredSlide,reviewActivitySlide,...originalSlides],page=0,timer=null;
const carousel=document.querySelector('.carousel');
const slide=document.querySelector('#slide');
const photo=document.querySelector('#carousel-photo');
const caption=document.querySelector('#slide-description');
const symbol=document.querySelector('.photo-symbol');
const controls=document.querySelector('.controls');
const pauseButton=document.querySelector('#carousel-pause');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reducedMotion.matches;
function stopRotation(){if(timer!==null){clearInterval(timer);timer=null;}}
function updateRotationControl(){pauseButton.textContent=paused?'Reanudar carrusel':'Pausar carrusel';pauseButton.setAttribute('aria-label',pauseButton.textContent);slide.setAttribute('aria-live',paused?'polite':'off');}
function startRotation(){stopRotation();if(!paused&&!document.hidden&&slides.length>1)timer=setInterval(()=>show(page+1),7000);}
function pauseRotation(){paused=true;stopRotation();updateRotationControl();}
function show(index){
 page=(index+slides.length)%slides.length;const item=slides[page];
 photo.hidden=!item.src;symbol.hidden=!!item.src;
 const link=document.querySelector('#carousel-link');if(link){link.hidden=!item.src;if(item.newsId)link.setAttribute('href','#publicacion-'+item.newsId);else link.removeAttribute('href');}
 if(item.src){photo.src=item.src;photo.alt=item.alt||item.title;}
 caption.textContent=item.body||'';caption.hidden=!item.body;
 document.querySelector('#slide-title').textContent=item.title;
 document.querySelector('#slide-count').textContent=`${page+1} de ${slides.length}`;
 slide.classList.toggle('placeholder-slide',!item.src);
 document.querySelectorAll('[data-page]').forEach(button=>{const active=Number(button.dataset.page)===page;button.setAttribute('aria-current',String(active));button.setAttribute('aria-label',`Diapositiva ${Number(button.dataset.page)+1}${active?', actual':''}`);});
}
function manualShow(index){pauseRotation();show(index);}
function rebuildPages(){
 controls.querySelectorAll('[data-page]').forEach(button=>button.remove());
 slides.forEach((item,index)=>{const button=document.createElement('button');button.dataset.page=String(index);button.textContent=String(index+1);button.addEventListener('click',()=>manualShow(index));controls.insertBefore(button,document.querySelector('#next'));});
}
document.querySelector('#prev').addEventListener('click',()=>manualShow(page-1));
document.querySelector('#next').addEventListener('click',()=>manualShow(page+1));
carousel.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();manualShow(page+(event.key==='ArrowRight'?1:-1));}});
pauseButton.addEventListener('click',()=>{paused=!paused;updateRotationControl();if(paused)stopRotation();else startRotation();});
carousel.addEventListener('mouseenter',stopRotation);
carousel.addEventListener('mouseleave',()=>{if(!carousel.contains(document.activeElement))startRotation();});
carousel.addEventListener('focusin',stopRotation);
carousel.addEventListener('focusout',event=>{if(!carousel.contains(event.relatedTarget))startRotation();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRotation();else if(!carousel.contains(document.activeElement))startRotation();});
reducedMotion.addEventListener('change',event=>{if(event.matches)pauseRotation();});
// Published administrative slides are retained after the featured image; no panel changes.
globalThis.jcsCarousel=items=>{if(!items.length)return;slides=[featuredSlide,...items.map(item=>({title:item.title,src:'/media/'+item.image,alt:item.alt,body:item.body}))];rebuildPages();show(0);startRotation();};
rebuildPages();show(0);updateRotationControl();startRotation();

// A shared publication link opens its full content, including on initial navigation.
function openLinkedNews(){if(['#curso-sistemas-fotovoltaicos','#apoyo-ayuda-sona'].includes(location.hash)){const publication=document.getElementById(location.hash.slice(1));const full=publication?.querySelector('details');if(full)full.open=true;}}
if(typeof location!=='undefined'){openLinkedNews();window.addEventListener('hashchange',openLinkedNews);}
