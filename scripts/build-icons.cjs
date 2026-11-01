/**
 * Build the original detailed Leveln SVG artwork into an offline-safe inline
 * library. The graphics themselves are NOT redrawn, traced, simplified or
 * substituted. Only the DOM id references are namespaced at render time.
 *
 * Usage: node scripts/build-icons.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const base=path.join(root,'assets/icons/mono');
const output=path.join(root,'assets/icons/inline-library.js');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
  const full=path.join(dir,entry.name);
  return entry.isDirectory()?walk(full):entry.name.endsWith('.svg')?[full]:[];
});}
const originals=Object.fromEntries(walk(base).sort().map(file=>[
  path.relative(base,file).split(path.sep).join('/').replace(/\.svg$/,''),
  fs.readFileSync(file,'utf8')
]));
const source=`/* AUTO GENERATED with scripts/build-icons.cjs from the ORIGINAL detailed SVG assets.\n`+
  ` * Do not hand-edit these graphics; run node scripts/build-icons.cjs after editing an asset. */\n`+
  `(function(global){\n  'use strict';\n  const ARTWORK=${JSON.stringify(originals)};\n`+
  `  let nextId=0;\n`+
  `  function has(name){return Object.prototype.hasOwnProperty.call(ARTWORK,name);}\n`+
  `  function render(name,extraClass=''){\n`+
  `    if(!has(name))throw Error('Original-Leveln-SVG fehlt: '+name);\n`+
  `    const suffix='-lvsvg-'+(++nextId);\n`+
  `    const svg=ARTWORK[name]\n`+
  `      .replace(/\\bid="([^"]+)"/g,(_,id)=>'id="'+id+suffix+'"')\n`+
  `      .replace(/url\\(#([^)]+)\\)/g,(_,id)=>'url(#'+id+suffix+')')\n`+
  `      .replace(/(href=")#([^"]+)(")/g,(_,open,id,end)=>open+'#'+id+suffix+end);\n`+
  `    const classes='ico lv-designed-svg'+(extraClass?' '+String(extraClass).replace(/[^a-zA-Z0-9 _-]/g,''):'');\n`+
  `    return svg.replace('<svg ', '<svg class="'+classes+'" data-icon="'+name+'" aria-hidden="true" focusable="false" ');\n`+
  `  }\n  global.LevelnSvgArtwork=Object.freeze({has,render,count:Object.keys(ARTWORK).length});\n`+
  `})(typeof window!=='undefined'?window:globalThis);\n`;
fs.writeFileSync(output,source,'utf8');
console.log(`Original-SVG-Bibliothek: ${Object.keys(originals).length} Assets, ${(fs.statSync(output).size/1024).toFixed(1)} KiB; Geometrie unverändert.`);
