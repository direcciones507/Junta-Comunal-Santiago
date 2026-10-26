import test from 'node:test';
import assert from 'node:assert/strict';
import {institutionAuth,hashPassword} from '../server/institution-auth.mjs';
import {openDatabase,memoryBucket} from '../scripts/sqlite-adapter.mjs';
import {createHandler} from '../server/index.mjs';
import {readAssets} from '../scripts/build.mjs';
// Disposable fixture only. Never installed as a runtime/default account.
const fixturePassword='Solo prueba de integracion 2026!';
const passwordHash=await hashPassword(fixturePassword);
const handler=createHandler(await readAssets());
function setup(){let time=Date.now();const db=openDatabase();const auth=institutionAuth({db,origin:'https://jcs.test',email:'admin@example.test',subject:'institution-admin-test',passwordHash,clock:()=>time});return {db,auth,advance:()=>time+=900001,env:{AUTH_PROVIDER:'institution',ADMIN_EMAIL:'admin@example.test',AUTHENTICATOR:auth.authenticate,DB:db,BUCKET:memoryBucket()}};}
function request(path,data,headers={}){return new Request('https://jcs.test'+path,{method:'POST',headers:{origin:'https://jcs.test','x-jcs-request':'1','content-type':'application/json',...headers},body:JSON.stringify(data)});}
test('institution login works without ChatGPT, sets hardened cookie and stores no raw session token',async()=>{
 const {db,auth,env}=setup();const bad=await auth.handle(request('/auth/login',{email:'admin@example.test',password:'incorrect'}));assert.equal(bad.status,401);
 const r=await auth.handle(request('/auth/login',{email:'admin@example.test',password:fixturePassword}));assert.equal(r.status,200);const cookie=r.headers.get('set-cookie');for(const s of ['__Host-','HttpOnly','Secure','SameSite=Strict','Path=/'])assert(cookie.includes(s));
 const session=cookie.split(';')[0];assert.deepEqual(await auth.authenticate(new Request('https://jcs.test/api/me',{headers:{cookie:session}})),{subject:'institution-admin-test',email:'admin@example.test'});
 const me=await handler(new Request('https://jcs.test/api/me',{headers:{cookie:session}}),env);assert.equal(me.status,200);
 const row=await db.prepare('SELECT * FROM admin_sessions').first();assert(!session.includes(row.token_hash));
 assert.equal((await handler(new Request('https://jcs.test/api/me',{headers:{'oai-authenticated-user-id':'institution-admin-test','oai-authenticated-user-email':'admin@example.test'}}),env)).status,401);
 const logout=await auth.handle(request('/auth/logout',{}, {cookie:session}));assert.equal(logout.status,200);assert.equal(await auth.authenticate(new Request('https://jcs.test/api/me',{headers:{cookie:session}})),null);db.close();
});
test('institution login enforces CSRF, bounded requests and persistent attempt window',async()=>{
 const {db,auth,advance}=setup();assert.equal((await auth.handle(request('/auth/login',{}, {origin:'https://evil.test'}))).status,403);
 const wrong={email:'admin@example.test',password:'wrong'};for(let i=0;i<5;i++)assert.equal((await auth.handle(request('/auth/login',wrong))).status,401);
 assert.equal((await auth.handle(request('/auth/login',wrong))).status,429);advance();assert.equal((await auth.handle(request('/auth/login',{email:'admin@example.test',password:fixturePassword}))).status,200);db.close();
});
test('institution configuration rejects exposed HTTP and never has a default password',()=>{
 const db=openDatabase();assert.throws(()=>institutionAuth({db,origin:'http://jcs.example',email:'admin@example.test',subject:'admin',passwordHash}));assert.throws(()=>institutionAuth({db,origin:'https://jcs.test',email:'admin@example.test',subject:'admin'}));db.close();
});
