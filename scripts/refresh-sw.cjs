/** Leveln: JS/CSS/HTML/Icons als Offline-Ressourcen synchronisieren. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const walk=(d)=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>{
 const name=path.posix.join(d,e.name);
 if(e.isDirectory())return walk(name);
 return [name];
});
const sources=['index.html','scripts.json',...walk('pages'),...walk('src'),...walk('theme'),...walk('assets'),...walk('icons'),...fs.readdirSync(root).filter(n=>/\.webmanifest$/.test(n)||n==='styles.css')];
const assets=['./',...Array.from(new Set(sources.filter(x=>/\.(?:html|js|css|json|svg|png|webmanifest)$/.test(x)&&!x.endsWith('/README.md')&&!x.includes('/tests/')).map(p=>'./'+p))).sort()];
const src=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const version='leveln-pwa-v0.11.4-20261104-1';
const newSrc=src.replace(/const CACHE='[^']+';/,`const CACHE='${version}';`).replace(/const ASSETS=\[[\s\S]*?\];/,`const ASSETS=${JSON.stringify(assets,null,2)};`);
// Idempotent: zweimaliges Aufrufen darf das Ergebnis nicht verändern.
fs.writeFileSync(path.join(root,'sw.js'),newSrc);
console.log(`${assets.length} Dateien für Offlinebetrieb vorgemerkt.`);
