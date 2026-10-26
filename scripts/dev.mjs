// Local adapter. Identity is NEVER synthesized. Use the private hosted preview to sign in.
import {createServer} from 'node:http';
import {mkdirSync,readFileSync,writeFileSync,existsSync,unlinkSync} from 'node:fs';
import {createHandler} from '../server/index.mjs';
import {readAssets} from './build.mjs';
import {openDatabase} from './sqlite-adapter.mjs';
mkdirSync('.data/media',{recursive:true});
const env={AUTH_PROVIDER:process.env.AUTH_PROVIDER,ADMIN_EMAIL:process.env.ADMIN_EMAIL,DB:openDatabase('.data/preview.sqlite'),BUCKET:{async put(id,bytes,opts){writeFileSync('.data/media/'+id,bytes);writeFileSync('.data/media/'+id+'.json',JSON.stringify(opts));},async get(id){if(!existsSync('.data/media/'+id))return null;return {body:readFileSync('.data/media/'+id),httpMetadata:JSON.parse(readFileSync('.data/media/'+id+'.json')).httpMetadata};},async delete(id){for(const p of [id,id+'.json'])if(existsSync('.data/media/'+p))unlinkSync('.data/media/'+p);}}};
const portArg=process.argv.indexOf('--port');const port=Number(process.env.PORT||(portArg>=0?process.argv[portArg+1]:5173));
const handler=createHandler(await readAssets());
createServer(async(req,res)=>{try{const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers,...(req.method==='POST'?{body:req,duplex:'half'}:{})});const response=await handler(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Preview request failed');}}).listen(port,'0.0.0.0',()=>console.log('Local preview http://localhost:'+port));
