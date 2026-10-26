const $=id=>document.getElementById(id);
const labels={draft:'Borrador',review:'En revisión',approved:'Aprobado',published:'Publicado'};
const types={noticia:'Noticia',comunicado:'Comunicado',actividad:'Actividad',aviso:'Aviso institucional',carrusel:'Carrusel',seccion:'Sección',proyecto:'Proyecto',documento:'Documento PDF'};
const actionNames={create:'Creado',save:'Borrador guardado',submit:'Enviado a revisión',approve:'Aprobado',publish:'Publicado',withdraw:'Retirado',delete:'Eliminado (historial conservado)'};
let items=[],view='contents',editing=null,image=null,uploading=false,busy=false,pdf=null,gallery=[];
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
async function api(path,data,options={}) {
 const opts={...options,headers:{...options.headers}};
 if(data!==undefined){opts.method='POST';opts.body=JSON.stringify(data);opts.headers['Content-Type']='application/json';}
 if(opts.method==='POST')opts.headers['X-JCS-Request']='1';
 const r=await fetch(path,opts);const value=await r.json();if(!r.ok)throw new Error(value.error||'No se pudo completar la operación.');return value;
}
function notice(message){$('status').textContent=message;}
async function load(){items=(await api('/api/contents')).items;render();}
function category(r){return view==='carousel'?r.kind==='carrusel':view==='sections'?r.kind==='seccion':view==='projects'?r.kind==='proyecto':view==='documents'?r.kind==='documento':!['carrusel','seccion','proyecto','documento'].includes(r.kind);}
function render(){
 const titles={projects:['Proyectos','Registra fuente, fecha, ubicación, estado y fotografías autorizadas.'],documents:['Documentos PDF','Clasifica documentos, revisa su contenido y aprueba su publicación.'],contents:['Publicaciones','Organiza noticias, comunicados, actividades y avisos.'],carousel:['Carrusel principal','Gestiona fotografías, textos alternativos y orden de presentación.'],sections:['Secciones de la web','Actualiza las siete secciones conservando la estructura aprobada.'],audit:['Historial de cambios','Consulta quién guardó, aprobó, publicó o retiró cada contenido.']};
 $('heading').textContent=titles[view][0];$('intro').textContent=titles[view][1];
 $('new').hidden=view==='audit';$('toolbar').hidden=view==='audit';$('stats').hidden=view==='audit';$('list').hidden=view==='audit';$('history').hidden=view!=='audit';
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('selected',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false');});
 const selected=items.filter(category);
 $('stats').replaceChildren(...Object.entries(labels).map(([k,v])=>{const el=node('div',undefined,'stat');el.append(node('strong',String(selected.filter(r=>r.status===k).length)),node('span',v));return el;}));
 $('list').replaceChildren();
 const filtered=selected.filter(r=>(!$('filter').value||r.status===$('filter').value)&&`${r.title} ${r.body}`.toLowerCase().includes($('search').value.toLowerCase()));
 if(!filtered.length){const e=node('div',undefined,'empty');e.append(node('h2','Tu próximo contenido empieza aquí'),node('p',view==='sections'?'Crea una propuesta para una de las siete secciones. La versión aprobada permanecerá visible hasta publicar los cambios.':'Crea un borrador, revísalo y apruébalo antes de publicarlo.'));$('list').append(e);}
 for(const r of filtered){const el=node('article',undefined,'card'),top=node('div',undefined,'card-top'),title=node('div');title.append(node('small',`${types[r.kind]}${r.slot?' · '+r.slot:''}${r.kind==='carrusel'?' · Orden '+r.position:''}`),node('h2',r.title));top.append(title,node('span',labels[r.status],'badge '+r.status));el.append(top,node('p',r.body.slice(0,190)+(r.body.length>190?'…':'')),node('small',`Actualizado ${new Date(r.updated).toLocaleString('es-PA')} · Versión ${r.version}${r.live&&r.status!=='published'?' · Hay una versión anterior publicada':''}`));
 const actions=node('div',undefined,'actions');
 function button(label,fn,cls){const b=node('button',label,cls);b.onclick=()=>Promise.resolve(fn()).catch(e=>notice(e.message));actions.append(b);}
 button('Editar',()=>openEditor(r));
 if(r.status==='draft')button('Enviar a revisión',()=>act(r,'submit'));
 if(r.status==='review'){button('Revisar contenido',()=>openEditor(r));button('Aprobar',()=>act(r,'approve'));}
 if(r.status==='approved')button('Publicar',()=>act(r,'publish'),'primary');
 if(r.live)button('Retirar de la web',()=>act(r,'withdraw'));
 button('Eliminar',()=>act(r,'delete'),'danger');el.append(actions);$('list').append(el);}
}
async function confirmation(title,message){$('confirm-title').textContent=title;$('confirm-message').textContent=message;$('confirm').showModal();return new Promise(resolve=>{const finish=v=>{$('confirm').close();resolve(v);};$('confirm-yes').onclick=()=>finish(true);$('confirm-no').onclick=()=>finish(false);$('confirm').oncancel=e=>{e.preventDefault();finish(false);};});}
async function act(r,action){
 if(busy)return;
 const messages={submit:['Enviar a revisión','El contenido quedará pendiente de aprobación.'],approve:['Aprobar contenido',`Confirma que revisaste el texto y la fotografía de “${r.title}”. La aprobación no lo publica todavía.`],publish:['Publicar contenido','Esta versión aprobada será visible en la página de esta vista previa.'],withdraw:['Retirar publicación','Dejará de verse en la página. El borrador y el historial se conservan.'],delete:['Eliminar contenido','Se retirará de la web y de la lista de edición. El historial se conserva para auditoría.']};
 if(!await confirmation(...messages[action]))return;
 busy=true;try{await api(`/api/contents/${r.id}/${action}`,{version:r.version});await load();notice(actionNames[action]+'.');}finally{busy=false;}
}
function updateKind(){const k=$('kind').value;$('slot-label').hidden=k!=='seccion';$('body').required=k!=='carrusel';$('position-label').hidden=k!=='carrusel';$('project-state-label').hidden=k!=='proyecto';$('doc-category-label').hidden=$('pdf-label').hidden=k!=='documento';$('gallery-fields').hidden=k!=='proyecto';$('logo-label').hidden=!(k==='seccion'&&$('slot').value==='inicio');$('contact-fields').hidden=!(k==='seccion'&&$('slot').value==='contacto');}
function photoPreview(){ $('photo-preview').hidden=!image;$('preview-img').src=image?'/media/'+image:''; }
function openEditor(r=null){editing=r;image=r?.image||null;const d=typeof r?.details==='string'?JSON.parse(r.details):(r?.details||{});pdf=d.file||null;gallery=(d.gallery||[]).map(g=>({...g}));for(const key of ['source','date','location'])$(key).value=d[key]||'';$('project-state').value=d.state||'';$('doc-category').value=d.category||'';$('pdf').value='';$('gallery-upload').value='';$('use-logo').checked=!!d.logo;for(const key of ['phone','email','address','hours','instagram','facebook','map'])$('contact-'+key).value=d[key]||'';$('pdf-status').textContent=pdf?'PDF cargado':'';renderGallery();$('editor-heading').textContent=r?'Editar contenido':'Nuevo contenido';$('kind').value=r?.kind||(view==='carousel'?'carrusel':view==='sections'?'seccion':view==='projects'?'proyecto':view==='documents'?'documento':'noticia');$('kind').disabled=!!r;$('slot').value=r?.slot||'inicio';$('slot').disabled=!!r;$('title').value=r?.title||'';$('body').value=r?.body||'';$('alt').value=r?.alt||'';$('position').value=r?.position??0;$('photo').value='';$('editor-error').textContent='';updateKind();photoPreview();$('editor').showModal();}
async function upload(file){
 if(!['image/jpeg','image/png'].includes(file.type)||file.size>3145728)throw new Error('Selecciona una fotografía JPEG o PNG de hasta 3 MB.');
 const bitmap=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));if(!blob)throw new Error('No se pudo procesar la fotografía.');
 return api('/api/media',undefined,{method:'POST',body:blob,headers:{'Content-Type':'image/jpeg'}});
}
$('photo').onchange=async()=>{if(!$('photo').files[0])return;uploading=true;$('save').disabled=true;$('editor-error').textContent='Optimizando fotografía…';try{image=(await upload($('photo').files[0])).id;photoPreview();$('editor-error').textContent='Fotografía lista. Agrega su texto alternativo y guarda el borrador.';}catch(e){$('editor-error').textContent=e.message;}finally{uploading=false;$('save').disabled=false;}};
$('remove-photo').onclick=()=>{image=null;$('photo').value='';photoPreview();};
$('kind').onchange=$('slot').onchange=updateKind;$('new').onclick=()=>openEditor();
$('close').onclick=$('cancel').onclick=()=>$('editor').close();
$('edit-form').onsubmit=async e=>{e.preventDefault();if(uploading||busy)return;busy=true;$('save').disabled=true;
 try{const data={kind:$('kind').value,slot:$('slot').value,title:$('title').value,body:$('body').value,image,alt:$('alt').value,position:Number($('position').value),details:{source:$('source').value,date:$('date').value,location:$('location').value,state:$('project-state').value,category:$('doc-category').value,file:pdf||'',gallery,logo:$('use-logo').checked,...Object.fromEntries(['phone','email','address','hours','instagram','facebook','map'].map(key=>[key,$('contact-'+key).value]))}};if(editing)data.version=editing.version;await api(editing?'/api/contents/'+editing.id:'/api/contents',data);$('editor').close();await load();notice('Borrador guardado. Todavía no se han publicado estos cambios.');}catch(e){$('editor-error').textContent=e.message;}finally{busy=false;$('save').disabled=false;}};
$('search').oninput=$('filter').onchange=render;
$('refresh').onclick=()=>load().catch(e=>notice(e.message));
for(const b of document.querySelectorAll('[data-view]'))b.onclick=async()=>{view=b.dataset.view;render();if(view==='audit')try{const data=await api('/api/audit');$('audit-list').replaceChildren(...data.items.map(r=>{const el=node('div',undefined,'audit-item');const s=JSON.parse(r.snapshot);el.append(node('strong',actionNames[r.action]||r.action),node('p',s.title||r.content),node('small',`${new Date(r.at).toLocaleString('es-PA')} · ${r.actor}`));return el;}));}catch(e){notice(e.message);}};
$('export').onclick=async()=>{try{const data=await api('/api/export');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=node('a');a.href=url;a.download='junta-contenidos-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){notice(e.message);}};
(async()=>{try{const me=await api('/api/me');$('identity').textContent=me.email;$('workspace').hidden=false;await load();}catch(e){$('identity').textContent='Sesión requerida';$('access').hidden=false;notice(e.message);}})();

function renderGallery(){ $('gallery-list').replaceChildren(...gallery.map((g,i)=>{const row=node('div');const label=node('label','Descripción de fotografía '+(i+1));const field=node('input');field.value=g.alt;field.maxLength=200;field.required=true;field.oninput=()=>g.alt=field.value;label.append(field);const img=node('img');img.src='/media/'+g.id;img.alt=g.alt;img.width=100;const remove=node('button','Retirar');remove.type='button';remove.onclick=()=>{gallery.splice(i,1);renderGallery();};row.append(img,label,remove);return row;}));}
$('gallery-upload').onchange=async()=>{if(uploading)return;uploading=true;$('save').disabled=true;try{const files=[...$('gallery-upload').files];if(files.length+gallery.length>8)throw new Error('Máximo ocho fotografías adicionales.');for(const file of files)gallery.push({id:(await upload(file)).id,alt:''});renderGallery();}catch(e){renderGallery();$('editor-error').textContent=e.message;}finally{uploading=false;$('save').disabled=false;}};
$('pdf').onchange=async()=>{const file=$('pdf').files[0];if(!file||uploading)return;uploading=true;$('save').disabled=true;try{if(file.type!=='application/pdf'||file.size>3145728)throw new Error('Selecciona un PDF de hasta 3 MB.');pdf=(await api('/api/media',undefined,{method:'POST',body:file,headers:{'Content-Type':'application/pdf'}})).id;$('pdf-status').textContent='PDF cargado. Se mantendrá privado hasta publicar el documento.';}catch(e){$('editor-error').textContent=e.message;}finally{uploading=false;$('save').disabled=false;}};
