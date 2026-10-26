// Explicit maintenance command. Back up database and objects before running on an existing installation.
import {resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
import {openDatabase} from './sqlite-adapter.mjs';
if(process.env.NODE_ENV==='production'&&process.env.JCS_MIGRATION_APPROVED!=='1')throw new Error('Requiere respaldo verificado y JCS_MIGRATION_APPROVED=1 en el servidor autorizado.');
const root=resolve(process.env.JCS_DATA_DIRECTORY||'.data');mkdirSync(root,{recursive:true});openDatabase(root+'/institution.sqlite').close();console.log('Migraciones institucionales aplicadas.');
