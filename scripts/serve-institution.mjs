// Reference Node 24+ host; PUBLIC_ORIGIN and all credentials belong to the host environment.
import {createServer} from 'node:http';
import {mkdirSync,readFileSync,writeFileSync,existsSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHandler} from '../server/index.mjs';
import {institutionAuth} from '../server/institution-auth.mjs';
import {readAssets} from './build.mjs';
import {openDatabase} from './sqlite-adapter.mjs';
const portArg=process.argv.indexOf('--port');const port=Number(process.env.PORT||(portArg>=0?process.argv[portArg+1]:5173));
if(process.env.NODE_ENV==='production'&&(!process.env.PUBLIC_ORIGIN||!process.env.ADMIN_PASSWORD_HASH||!process.env.ADMIN_EMAIL||!process.env.ADMIN_SUBJECT))throw new Error('Configura identidad y origen institucional antes de iniciar.');
const root=resolve(process.env.JCS_DATA_DIRECTORY||'.data');mkdirSync(root+'/media',{recursive:true});
const db=openDatabase(root+'/institution.sqlite',{migrate:process.env.NODE_ENV!=='production'});
const origin=process.env.PUBLIC_ORIGIN;
const auth=origin&&process.env.ADMIN_PASSWORD_HASH?institutionAuth({db,origin,email:process.env.ADMIN_EMAIL,subject:process.env.ADMIN_SUBJECT,passwordHash:process.env.ADMIN_PASSWORD_HASH,allowLocalHTTP:process.env.JCS_ALLOW_LOCAL_HTTP==='1'}):null;
if(process.env.NODE_ENV==='production'&&!auth)throw new Error('Falta configurar el acceso institucional.');
const env={AUTH_PROVIDER:'institution',ADMIN_EMAIL:process.env.ADMIN_EMAIL,AUTHENTICATOR:auth?.authenticate,DB:db,BUCKET:{async put(id,bytes,opts){writeFileSync(root+'/media/'+id,bytes);writeFileSync(root+'/media/'+id+'.json',JSON.stringify(opts));},async get(id){if(!existsSync(root+'/media/'+id))return null;return {body:readFileSync(root+'/media/'+id),httpMetadata:JSON.parse(readFileSync(root+'/media/'+id+'.json'))};},async delete(id){for(const path of [id,id+'.json'])if(existsSync(root+'/media/'+path))unlinkSync(root+'/media/'+path);}}};
const handler=createHandler(await readAssets());
createServer(async(req,res)=>{try{
 // Never infer origin, HTTPS or identity from forwarded/request headers. Configure the canonical origin.
 const base=origin||`http://localhost:${port}`;const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);
 const request=new Request(new URL(req.url,base),{method:req.method,headers,...(req.method==='POST'?{body:req,duplex:'half'}:{})});
 let response;
 const route=new URL(request.url).pathname;
 if(process.env.NODE_ENV!=='production'&&['/__preview/responsive','/__preview/responsive.js'].includes(route))response=new Response(readFileSync(route.endsWith('.js')?'tests/responsive.js':'tests/responsive.html'),{headers:{'content-type':route.endsWith('.js')?'text/javascript':'text/html'}});
 else response=(auth&&await auth.handle(request))||await handler(request,env);
 const out=new Headers(response.headers);out.set('cache-control','no-store');out.set('x-content-type-options','nosniff');out.set('x-frame-options','DENY');out.set('referrer-policy','same-origin');
 // Allow only same-origin framing of the public home in the unconfigured local QA host. Never apply to an authenticated or production host.
 if(!auth&&process.env.NODE_ENV!=='production'&&route==='/'){out.set('x-frame-options','SAMEORIGIN');out.set('content-security-policy',(out.get('content-security-policy')||'').replace("frame-ancestors 'none'","frame-ancestors 'self'"));}
 res.writeHead(response.status,Object.fromEntries(out));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500,{'cache-control':'no-store'});res.end('No se pudo completar la solicitud.');}
}).listen(port,'0.0.0.0',()=>console.log(`Junta Comunal · http://localhost:${port} · acceso institucional ${auth?'configurado':'pendiente'}`));
