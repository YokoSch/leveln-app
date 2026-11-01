/** Regression test: ALL rendered icons are our original detailed SVG assets. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ctx=vm.createContext({console});ctx.globalThis=ctx;
const library=fs.readFileSync('assets/icons/inline-library.js','utf8');
vm.runInContext(library,ctx,{filename:'assets/icons/inline-library.js'});
const lib=ctx.LevelnSvgArtwork;
const files=[];
function walk(p){for(const dirent of fs.readdirSync(p,{withFileTypes:true})) {
 const x=path.join(p,dirent.name);
 if(dirent.isDirectory())walk(x); else if(x.endsWith('.svg'))files.push(x);
}}
walk('assets/icons/mono');
assert.equal(lib.count,files.length,'Every original icon must be in the inline library');
assert.equal(files.length,64,'Original Leveln icon count changed; review asset updates explicitly');
const ids=new Set();
for(const file of files){
 const key=path.relative('assets/icons/mono',file).split(path.sep).join('/').replace(/\.svg$/,'');
 const original=fs.readFileSync(file,'utf8');
 const html=lib.render(key,'card-art');
 assert(html.startsWith('<svg class="ico lv-designed-svg card-art"'),'SVG markup must be inlined, never external <img> or CSS-mask');
 assert(html.includes('viewBox=')&&html.includes('currentColor'),'Original paths and dynamic colors required: ' + key);
 assert(html.includes('data-icon="'+key+'"'));
 const canonical=html.replace(/<svg class="ico lv-designed-svg card-art" data-icon="[^"]+" aria-hidden="true" focusable="false" /,'<svg ')
   .replaceAll(/-lvsvg-\d+/g,'');
 assert.equal(canonical,original,'SVG paths were modified: '+key);
 for(const id of [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])){
  assert(!ids.has(id),'Duplicate SVG mask ID found: '+id);
  ids.add(id);
  assert(html.includes('url(#'+id+')'),'Orphan mask ID: '+id);
 }
}
const other=lib.render('tiere/katze');
assert.notEqual(other.match(/id="([^"]+)"/)[1],lib.render('tiere/katze').match(/id="([^"]+)"/)[1], 'Repeated icons must have independent internal IDs');
const app=fs.readFileSync('src/shared/v010/assets.js','utf8');
assert(app.includes('LevelnSvgArtwork.render'),'App must use this same detailed icon library');
assert(!app.includes('lv-inline-icon'),'Simplified fallback icons are forbidden');
const designkit=fs.readFileSync('theme/designkit.js','utf8');
assert(designkit.includes('LevelnSvgArtwork.render'),'Design helper must use the same artwork');
assert(fs.readFileSync('sw.js','utf8').includes('"./assets/icons/inline-library.js"'),'Icons must be precached offline');
const scripts=require('../scripts.json').scripts;
assert(scripts.indexOf('assets/icons/inline-library.js')<scripts.indexOf('src/shared/v010/assets.js'));
console.log(`OK: ${files.length} originale detaillierte SVGs, Geometrie 1:1, individuelle Masken-IDs, CSS-currentColor, Offline-Einbindung`);
