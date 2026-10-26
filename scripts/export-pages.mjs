// Reproducible static review export. No administrator data, database or secrets.
import {mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
const dest=resolve(process.argv[2]||'pages-preview');
if(dest===resolve('.')||!dest.startsWith(resolve('.')+'/'))throw new Error('Selecciona una subcarpeta de salida.');
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
await mkdir(dest,{recursive:true});
let html=await readFile('index.html','utf8');html=html.replace('<html lang="es">','<html lang="es" data-preview="static">').replace('</footer>',`<p class="source-version">Vista estática de revisión · Código GitHub <a class="source-link" href="https://github.com/direcciones507/Junta-Comunal-Santiago/commit/${commit}">${commit.slice(0,7)}</a> · Administración disponible al instalar el servidor institucional.</p></footer>`);await writeFile(join(dest,'index.html'),html);
for(const f of ['styles.css','app.js','public-content.js'])await cp(f,join(dest,f));await cp('assets',join(dest,'assets'),{recursive:true});await mkdir(join(dest,'admin'),{recursive:true});
let admin=await readFile('admin/index.html','utf8');admin=admin.replace('href="/admin/admin.css"','href="admin.css"').replace('href="/admin"','href="./"').replace('href="/"','href="../"').replace('<div id="workspace" hidden>','<div id="workspace">').replace('id="identity">Verificando acceso…','id="identity">Demostración visual · Sin sesión ni datos privados').replace('<script src="/admin/admin.js" defer></script>','<script src="preview.js" defer></script>').replace('VISTA PRIVADA DE REVISIÓN · SIN PUBLICACIÓN INSTITUCIONAL','DEMOSTRACIÓN ESTÁTICA · NO GUARDA NI ENVÍA DATOS').replace('<button id="sign-out" type="button">Cerrar sesión</button>','<a href="../">Volver al portal</a>');await writeFile(join(dest,'admin/index.html'),admin);await cp('admin/admin.css',join(dest,'admin/admin.css'));await cp('admin/preview.js',join(dest,'admin/preview.js'));
const files=['index.html','styles.css','app.js','public-content.js','assets/logo-institucional.png','assets/parques-comunitarios.png','assets/curso-sistemas-fotovoltaicos-inadeh.png','admin/index.html','admin/admin.css','admin/preview.js'];
const checksums={};for(const f of files)checksums[f]=createHash('sha256').update(await readFile(join(dest,f))).digest('hex');await writeFile(join(dest,'revision.json'),JSON.stringify({source_commit:commit,preview_only:true,admin_mode:'static-readonly',checksums},null,2)+'\n');await writeFile(join(dest,'.nojekyll'),'');console.log(`Exported GitHub review from ${commit} to ${dest}`);
