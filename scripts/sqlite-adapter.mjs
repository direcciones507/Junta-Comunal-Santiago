// Reference adapter for tests and a future institution-owned Node gateway.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,mkdirSync} from 'node:fs';
export function openDatabase(filename=':memory:'){
 const sqlite=new DatabaseSync(filename);sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
 sqlite.exec('CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY)');
 for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())if(!sqlite.prepare('SELECT name FROM _local_migrations WHERE name=?').get(name)){sqlite.exec(readFileSync('drizzle/'+name,'utf8'));sqlite.prepare('INSERT INTO _local_migrations VALUES (?)').run(name);}
 const db={prepare(sql){let params=[];const query={bind(...p){params=p;return query;},async first(){return sqlite.prepare(sql).get(...params)||null;},async all(){return {results:sqlite.prepare(sql).all(...params)};},async run(){return query.syncRun();},syncRun(){const r=sqlite.prepare(sql).run(...params);return {success:true,meta:{changes:Number(r.changes)}};}};return query;},async batch(queries){sqlite.exec('BEGIN IMMEDIATE');try{const results=queries.map(q=>q.syncRun());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}},close(){sqlite.close();}};return db;
}
export function memoryBucket(){const files=new Map();return{async put(id,bytes,opts){files.set(id,{body:bytes,httpMetadata:opts.httpMetadata});},async get(id){return files.get(id)||null;},async delete(id){files.delete(id);}};}
