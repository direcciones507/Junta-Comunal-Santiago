// Standard Fetch handler; storage uses the small SQLite/R2 interfaces in docs/admin-architecture.md.
export const sections = ['inicio','nosotros','noticias','proyectos','servicios','transparencia','contacto'];
const kinds = ['noticia','comunicado','actividad','aviso','carrusel','seccion'];
class HttpError extends Error { constructor(status,message) { super(message); this.status=status; } }
const fail=(s,m)=>{throw new HttpError(s,m)};
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json; charset=utf-8'}});
const one=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results;
const statement=(db,sql,...p)=>db.prepare(sql).bind(...p);
const uuid=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const clean=(v,max,required=false)=>{ if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail(400,'Campos incompletos o demasiado largos.'); return v.trim(); };
function input(v) {
 if(!v||typeof v!=='object'||Array.isArray(v))fail(400,'Contenido inválido.');
 if(!kinds.includes(v.kind))fail(400,'Tipo de contenido inválido.');
 const slot=v.kind==='seccion'?clean(v.slot,30,true):null;
 if(slot&&!sections.includes(slot))fail(400,'Sección inválida.');
 const image=v.image||null;
 if(image&&!/^[a-f0-9-]{36}$/.test(image))fail(400,'Imagen inválida.');
 const alt=clean(v.alt??'',200,!!image);
 if(!Number.isInteger(v.position)||v.position<0||v.position>99)fail(400,'Orden inválido.');
 return {kind:v.kind,slot,title:clean(v.title,160,true),body:clean(v.body,20000,v.kind!=='carrusel'),image,alt,position:v.position};
}
const snapshot=r=>({id:r.id,kind:r.kind,slot:r.slot,title:r.title,body:r.body,image:r.image,alt:r.alt,position:r.position});
function audit(db,id,action,actor,data) {return statement(db,'INSERT INTO audit (id,content,action,actor,at,snapshot) VALUES (?,?,?,?,?,?)',uuid(),id,action,actor,now(),JSON.stringify(data));}
async function admin(req,env) {
 // Sites dispatch authenticates these headers and strips visitor-supplied identity headers.
 // Any other deployment must use an authenticating gateway; fail closed without explicit configuration.
 if(env.AUTH_PROVIDER!=='sites'||!env.ADMIN_EMAIL)fail(503,'Identidad administrativa sin configurar.');
 const subject=req.headers.get('oai-authenticated-user-id');
 const email=req.headers.get('oai-authenticated-user-email');
 if(!subject||!email)fail(401,'Inicia sesión para continuar.');
 if(email.toLowerCase()!==env.ADMIN_EMAIL.toLowerCase())fail(403,'Acceso reservado al administrador.');
 await statement(env.DB,'INSERT OR IGNORE INTO administrator (slot,subject,email) VALUES (1,?,?)',subject,email).run();
 const a=await one(env.DB,'SELECT * FROM administrator WHERE slot=1');
 if(a?.subject!==subject)fail(403,'La cuenta no corresponde al administrador registrado.');
 return {subject,email};
}
async function body(req) {const n=Number(req.headers.get('content-length')||0);if(n>40000)fail(413,'Solicitud demasiado grande.'); const raw=await req.text();if(raw.length>40000)fail(413,'Solicitud demasiado grande.');try{return JSON.parse(raw)}catch{fail(400,'JSON inválido.')}}
async function api(req,env,url) {
 const path=url.pathname;
 if(path==='/api/public'&&req.method==='GET') {
  const rows=await all(env.DB,"SELECT live FROM contents WHERE live IS NOT NULL AND status!='archived'");
  return json({items:rows.map(r=>JSON.parse(r.live))});
 }
 const a=await admin(req,env);
 if(req.method!=='GET') {
  if(req.headers.get('origin')!==url.origin||req.headers.get('x-jcs-request')!=='1')fail(403,'Origen de solicitud no permitido.');
  if(path!=='/api/media'&&!req.headers.get('content-type')?.startsWith('application/json'))fail(415,'Se requiere JSON.');
 }
 if(path==='/api/me'&&req.method==='GET')return json({email:a.email});
 if(path==='/api/contents'&&req.method==='GET')return json({items:await all(env.DB,"SELECT * FROM contents WHERE status!='archived' ORDER BY updated DESC")});
 if(path==='/api/audit'&&req.method==='GET')return json({items:await all(env.DB,'SELECT * FROM audit ORDER BY at DESC LIMIT 100')});
 if(path==='/api/export'&&req.method==='GET')return json({format:'jcs-content-v1',exported:now(),contents:await all(env.DB,'SELECT * FROM contents'),media:await all(env.DB,'SELECT * FROM media'),audit:await all(env.DB,'SELECT * FROM audit')});
 if(path==='/api/media'&&req.method==='POST') {
  if(Number(req.headers.get('content-length'))>3145728)fail(413,'Máximo 3 MB por imagen.');
  const reader=req.body?.getReader();if(!reader)fail(400,'Selecciona una fotografía.');
  const chunks=[];let size=0;while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>3145728){await reader.cancel();fail(413,'Máximo 3 MB por imagen.');}chunks.push(part.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  if(bytes.length>3145728)fail(413,'Máximo 3 MB por imagen.');
  const png=bytes.length>=33&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)&&String.fromCharCode(...bytes.slice(12,16))==='IHDR';
  const jpg=bytes.length>=20&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255&&bytes.at(-2)===255&&bytes.at(-1)===217;
  const mime=png?'image/png':jpg?'image/jpeg':null;
  if(!mime||req.headers.get('content-type')!==mime)fail(415,'Solo fotografías PNG o JPEG válidas.');
  if(png) {const d=new DataView(bytes.buffer); if(d.getUint32(16)>8192||d.getUint32(20)>8192||!d.getUint32(16)||!d.getUint32(20))fail(400,'Dimensiones inválidas.');}
  const quota=await one(env.DB,'SELECT COALESCE(SUM(size),0) AS total, COUNT(*) AS count FROM media');
  if(quota.total+bytes.length>104857600||quota.count>=200)fail(409,'Límite de la vista previa alcanzado. Exporta o revisa las fotografías.');
  const id=uuid();await env.BUCKET.put(id,bytes,{httpMetadata:{contentType:mime}});
  try {await statement(env.DB,'INSERT INTO media (id,mime,size,created,author) VALUES (?,?,?,?,?)',id,mime,bytes.length,now(),a.subject).run();}catch(e){await env.BUCKET.delete(id);throw e;}
  return json({id,mime,size:bytes.length},201);
 }
 if(path==='/api/contents'&&req.method==='POST') {
  const v=input(await body(req));
  if(v.image&&!await one(env.DB,'SELECT id FROM media WHERE id=?',v.image))fail(400,'La imagen no existe.');
  const id=uuid();
  if(v.slot&&await one(env.DB,"SELECT id FROM contents WHERE slot=? AND status!='archived'",v.slot))fail(409,'La sección ya tiene un borrador. Edítalo en la lista.');
  await env.DB.batch([statement(env.DB,'INSERT INTO contents (id,kind,slot,title,body,image,alt,position,status,version,live,updated,author) VALUES (?,?,?,?,?,?,?,?,?,1,NULL,?,?)',id,v.kind,v.slot,v.title,v.body,v.image,v.alt,v.position,'draft',now(),a.subject),audit(env.DB,id,'create',a.subject,v)]);
  return json({id},201);
 }
 const match=path.match(/^\/api\/contents\/([a-f0-9-]{36})(?:\/(submit|approve|publish|withdraw|delete))?$/);
 if(match&&req.method==='POST') {
  const data=await body(req);const r=await one(env.DB,'SELECT * FROM contents WHERE id=?',match[1]);
  if(!r||r.status==='archived')fail(404,'Contenido no disponible.');
  if(data.version!==r.version)fail(409,'Otro cambio fue guardado. Recarga antes de continuar.');
  const action=match[2]||'save';let v=snapshot(r),status=r.status,live=r.live;
  if(action==='save') {
   v={id:r.id,...input(data)};
   if(v.kind!==r.kind||v.slot!==r.slot)fail(400,'No se puede cambiar el tipo o sección.');
   if(v.image&&!await one(env.DB,'SELECT id FROM media WHERE id=?',v.image))fail(400,'La imagen no existe.');
   status='draft';
  } else if(action==='submit') {if(!['draft','approved'].includes(status))fail(409,'Guarda el borrador antes de enviarlo.');status='review';}
  else if(action==='approve') {if(status!=='review')fail(409,'Primero envía el contenido a revisión.');status='approved';}
  else if(action==='publish') {
   if(status!=='approved')fail(409,'El contenido necesita aprobación antes de publicarse.');
   if(r.kind==='carrusel'&&!r.image)fail(400,'El carrusel necesita una fotografía.');
   status='published';live=JSON.stringify({...v,published:now()});
  } else if(action==='withdraw') {live=null;status='draft';}
  else if(action==='delete') {live=null;status='archived';}
  // SQLite transaction plus version predicate prevent concurrent stale writes.
  const result=await env.DB.batch([
   statement(env.DB,'UPDATE contents SET title=?,body=?,image=?,alt=?,position=?,status=?,live=?,version=version+1,updated=?,author=? WHERE id=? AND version=?',v.title,v.body,v.image,v.alt,v.position,status,live,now(),a.subject,r.id,r.version),
   statement(env.DB,'INSERT INTO audit (id,content,action,actor,at,snapshot) SELECT ?,?,?,?,?,? WHERE changes()=1',uuid(),r.id,action,a.subject,now(),JSON.stringify({...v,status,version:r.version+1}))
  ]);
  if(result[0].meta.changes!==1)fail(409,'Cambio concurrente. Recarga la lista.');
  return json({id:r.id,status,version:r.version+1});
 }
 fail(404,'Ruta no encontrada.');
}
export function createHandler(assets) {return async(req,env)=>{
 let response;const url=new URL(req.url);
 try {
  if(!['GET','POST'].includes(req.method))fail(405,'Método no permitido.');
  if(url.pathname.startsWith('/api/'))response=await api(req,env,url);
  else if(url.pathname.startsWith('/media/')) {
   const id=url.pathname.slice(7);if(!/^[a-f0-9-]{36}$/.test(id))fail(404,'No disponible.');
   const lives=await all(env.DB,"SELECT live FROM contents WHERE live IS NOT NULL AND status!='archived'");
   if(!lives.some(r=>JSON.parse(r.live).image===id))await admin(req,env);
   const file=await env.BUCKET.get(id);if(!file)fail(404,'No disponible.');
   response=new Response(file.body,{headers:{'Content-Type':file.httpMetadata.contentType,'Content-Disposition':'inline'}});
  } else {
   const route=url.pathname==='/admin'||url.pathname==='/admin/'?'/admin/index.html':url.pathname==='/'?'/index.html':url.pathname;
   const asset=assets[route];if(!asset)fail(404,'No encontrado.');
   response=new Response(asset.body,{headers:{'Content-Type':asset.type}});
  }
 }catch(e){response=json({error:e instanceof HttpError?e.message:'No se pudo completar la operación.'},e.status||500);}
 const headers=new Headers(response.headers);
 headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');headers.set('X-Frame-Options','DENY');
 headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
 headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');headers.set('X-Robots-Tag','noindex, nofollow');
 return new Response(response.body,{status:response.status,headers});
};}
