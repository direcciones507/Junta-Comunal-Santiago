(async()=>{
 try {
  const response=await fetch('/api/public');if(!response.ok)return;
  const {items}=await response.json();
  const make=(tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;return el;};
  for(const item of items.filter(i=>i.kind==='seccion')){
   const section=document.getElementById(item.slot);if(!section)continue;
   section.querySelector(item.slot==='inicio'?'h1':'h2').textContent=item.title;
   const paragraph=item.slot==='inicio'?section.querySelector('.hero>p:not(.eyebrow)'):section.querySelector('p');
   if(paragraph){paragraph.textContent=item.body;paragraph.classList.add('published-body');}
   if(item.image&&item.details?.logo){const logo=make('img');logo.src='/media/'+item.image;logo.alt=item.alt;logo.className='official-logo';document.querySelector('.brand b, .brand .official-logo')?.replaceWith(logo);}
   if(item.slot==='contacto'&&item.details){const d=item.details;const box=make('div');box.className='published-contact';for(const key of ['address','hours'])if(d[key])box.append(make('p',d[key]));for(const [key,label,prefix] of [['phone','Llamar','tel:'],['email','Correo','mailto:'],['instagram','Instagram',''],['facebook','Facebook',''],['map','Ubicación','']])if(d[key]){const a=make('a',label+' · '+d[key]);a.href=prefix+d[key];a.className='source-link';box.append(a,make('br'));}section.querySelector('.contact-grid')?.replaceWith(box);const footer=document.querySelector('footer');footer.querySelector('.published-contact')?.remove();footer.querySelector('.source-link')?.remove();footer.append(box.cloneNode(true));}
   if(item.image&&!item.details?.logo){const image=make('img');image.src='/media/'+item.image;image.alt=item.alt;image.className='section-photo';image.loading='lazy';section.append(image);}
  }
  const publications=items.filter(i=>!['seccion','carrusel','proyecto','documento'].includes(i.kind)).sort((a,b)=>b.published.localeCompare(a.published));
  if(publications.length){const list=make('div');list.className='published-list';for(const item of publications){const article=make('article');article.className='publication';article.append(make('small',({noticia:'NOTICIA',comunicado:'COMUNICADO',actividad:'ACTIVIDAD',aviso:'AVISO INSTITUCIONAL'})[item.kind]),make('h3',item.title),make('p',item.body));if(item.image){const img=make('img');img.src='/media/'+item.image;img.alt=item.alt;img.loading='lazy';article.append(img);}list.append(article);}document.getElementById('news-list').append(list);document.querySelector('#noticias .pending')?.remove();}
  for(const kind of ['proyecto','documento']){
   const records=items.filter(i=>i.kind===kind);const root=document.getElementById(kind==='proyecto'?'projects-list':'documents-list');
   for(const item of records){const d=item.details||{};const card=make('article');card.className='publication';card.append(make('h3',item.title),make('p',item.body));
    if(kind==='proyecto')card.append(make('p',[d.date,d.location,d.state].filter(Boolean).join(' · ')));
    else card.append(make('small',[d.category,d.date].filter(Boolean).join(' · ')));
    if(d.source){const a=make('a','Consultar fuente ↗');a.href=d.source;a.className='source-link';a.rel='noopener noreferrer';a.target='_blank';card.append(a);}
    if(kind==='documento'&&d.file){const a=make('a','Descargar PDF');a.href='/media/'+d.file;a.className='source-link';a.download='documento-institucional.pdf';card.append(make('br'),a);}
    const gallery=make('div');gallery.className='project-gallery';for(const g of [...(item.image?[{id:item.image,alt:item.alt}]:[]),...(d.gallery||[])]){const img=make('img');img.src='/media/'+g.id;img.alt=g.alt;img.loading='lazy';gallery.append(img);}card.append(gallery);root.append(card);
   }
   if(records.length&&kind==='proyecto')document.querySelector('#proyectos .pending')?.remove();
  }
  globalThis.jcsCarousel(items.filter(i=>i.kind==='carrusel'&&i.image).sort((a,b)=>a.position-b.position||a.id.localeCompare(b.id)));
 }catch{ /* Retain the existing institutional base when the content service is unavailable. */ }
})();
