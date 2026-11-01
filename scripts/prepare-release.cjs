/** Freigabe-Helfer: Scriptreihenfolge und Offlinecache aus der Quellenliste aktualisieren. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const manifest=require('../scripts.json');
for(const file of manifest.scripts){if(!fs.existsSync(path.join(root,file)))throw Error('Script fehlt: '+file);}
const indexFile=path.join(root,'index.html');
const doc=fs.readFileSync(indexFile,'utf8');
const start='<!-- LEVELN_SCRIPTS_START -->',end='<!-- LEVELN_SCRIPTS_END -->';
if(!doc.includes(start)||!doc.includes(end))throw Error('Script-Marker fehlen in index.html');
const prefix=doc.slice(0,doc.indexOf(start)+start.length);
const suffix=doc.slice(doc.indexOf(end));
fs.writeFileSync(indexFile,prefix+manifest.scripts.map(f=>`<script src="./${f}" defer></script>`).join('')+suffix);
require('./refresh-sw.cjs');
console.log('index.html und Offlinecache aktualisiert. Jetzt Tests ausführen.');
