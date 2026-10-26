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
   if(item.image){const image=make('img');image.src='/media/'+item.image;image.alt=item.alt;image.className='section-photo';image.loading='lazy';section.append(image);}
  }
  const publications=items.filter(i=>!['seccion','carrusel'].includes(i.kind)).sort((a,b)=>b.published.localeCompare(a.published));
  if(publications.length){const list=make('div');list.className='published-list';for(const item of publications){const article=make('article');article.className='publication';article.append(make('small',({noticia:'NOTICIA',comunicado:'COMUNICADO',actividad:'ACTIVIDAD',aviso:'AVISO INSTITUCIONAL'})[item.kind]),make('h3',item.title),make('p',item.body));if(item.image){const img=make('img');img.src='/media/'+item.image;img.alt=item.alt;img.loading='lazy';article.append(img);}list.append(article);}document.getElementById('noticias').append(list);}
  globalThis.jcsCarousel(items.filter(i=>i.kind==='carrusel'&&i.image).sort((a,b)=>a.position-b.position||a.id.localeCompare(b.id)));
 }catch{ /* Retain the existing institutional base when the content service is unavailable. */ }
})();
