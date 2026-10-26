// Institution-owned authentication adapter. No ChatGPT identity, account registration or default password.
import {scrypt as callbackScrypt,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(callbackScrypt),N=131072,r=8,p=1;
const digest=value=>createHash('sha256').update(value).digest('hex');
const cookieName='__Host-jcs-session';
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
export async function hashPassword(password){
 if(typeof password!=='string'||password.length<15||password.length>256)throw new Error('Usa entre 15 y 256 caracteres.');
 const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64,{N,r,p,maxmem:268435456});
 return `scrypt$${N}$${r}$${p}$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password,encoded){
 if(typeof password!=='string'||password.length>256)return false;
 const parts=String(encoded).split('$');if(parts.length!==6||parts[0]!=='scrypt'||+parts[1]!==N||+parts[2]!==r||+parts[3]!==p||!/^\w{32}$/.test(parts[4])||!/^[a-f0-9]{128}$/.test(parts[5]))return false;
 const actual=await scrypt(password,parts[4],64,{N,r,p,maxmem:268435456});return timingSafeEqual(actual,Buffer.from(parts[5],'hex'));
}
async function limitedJSON(req){
 const reader=req.body?.getReader();if(!reader)throw new Error('body');let text='',length=0;const decoder=new TextDecoder();
 while(true){const v=await reader.read();if(v.done)break;length+=v.value.byteLength;if(length>8192){await reader.cancel();throw new Error('body')}text+=decoder.decode(v.value,{stream:true});}
 return JSON.parse(text+decoder.decode());
}
export function institutionAuth({db,origin,email,subject,passwordHash,clock=()=>Date.now(),allowLocalHTTP=false}){
 const url=new URL(origin);const local=['localhost','127.0.0.1','terminal.local'].includes(url.hostname);
 if(url.origin!==origin||!(url.protocol==='https:'||(allowLocalHTTP&&local&&url.protocol==='http:'))||!email||!subject||!passwordHash)throw new Error('Configura origen HTTPS y administrador institucional antes de iniciar.');
 const secure=url.protocol==='https:',name=secure?cookieName:'jcs-session-local';
 const get=async(sql,...values)=>db.prepare(sql).bind(...values).first();
 const run=async(sql,...values)=>db.prepare(sql).bind(...values).run();
 const token=req=>{const v=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1);return /^[a-f0-9]{64}$/.test(v||'')?v:null;};
 const sessionCookie=(value,age)=>`${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;
 const authenticate=async req=>{
  const raw=token(req);if(!raw)return null;const record=await get('SELECT subject FROM admin_sessions WHERE token_hash=? AND expires>?',digest(raw),clock());
  return record?.subject===subject?{subject,email}:null;
 };
 const handle=async req=>{
  const path=new URL(req.url).pathname;if(!['/auth/login','/auth/logout'].includes(path))return null;
  if(req.method!=='POST')return json({error:'Método no permitido.'},405);
  if(req.headers.get('origin')!==origin||req.headers.get('x-jcs-request')!=='1')return json({error:'Origen no permitido.'},403);
  if(path==='/auth/logout'){const raw=token(req);if(raw)await run('DELETE FROM admin_sessions WHERE token_hash=?',digest(raw));return json({ok:true},200,{'set-cookie':sessionCookie('',0)});}
  if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'Se requiere JSON.'},415);
  const time=clock();
  // One persistent account-wide window; no trust in caller-supplied IP headers.
  const attempt=await get(`INSERT INTO login_attempts (slot,started,count) VALUES (1,?,1)
   ON CONFLICT(slot) DO UPDATE SET count=CASE WHEN started<? THEN 1 ELSE count+1 END, started=CASE WHEN started<? THEN ? ELSE started END RETURNING count`,time,time-900000,time-900000,time);
  if(attempt.count>5)return json({error:'Demasiados intentos. Intenta nuevamente en 15 minutos.'},429,{'retry-after':'900'});
  let input;try{input=await limitedJSON(req)}catch{return json({error:'Solicitud inválida.'},400)}
  if(!input||typeof input!=='object'||Array.isArray(input))return json({error:'Solicitud inválida.'},400);
  const valid=await verifyPassword(input.password,passwordHash);
  if(typeof input.email!=='string'||input.email.toLowerCase()!==email.toLowerCase()||!valid)return json({error:'Credenciales incorrectas.'},401);
  await run('DELETE FROM login_attempts WHERE slot=1');await run('DELETE FROM admin_sessions WHERE expires<=?',time);
  const raw=randomBytes(32).toString('hex');await run('INSERT INTO admin_sessions (token_hash,subject,expires) VALUES (?,?,?)',digest(raw),subject,time+28800000);
  return json({ok:true},200,{'set-cookie':sessionCookie(raw,28800)});
 };
 return {authenticate,handle};
}
