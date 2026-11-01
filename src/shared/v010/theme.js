/*
 * LEVELN 0.10 · src/shared/v010/theme.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function lv10Skin(){return S.theme==='dark'?'dark':S.theme==='mono'?'retro':S.theme==='light'?'light':(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');}

function applyTheme() {
  const skin=lv10Skin(), root=document.documentElement;
  root.dataset.theme=skin==='dark'?'dark':'light';root.dataset.levelnSkin=skin;
  root.classList.add('lv10-root');
  root.style.setProperty('--save',S.colors.save);
  root.style.setProperty('--level',S.colors.level);
  root.style.setProperty('--background-layer', S.bgMode==='image' && S.bgImage?`url("${S.bgImage}")`:'none');
  root.style.setProperty('--background-opacity',S.bgMode==='image'?String((S.bgShade||0)/100):'0');
  root.style.setProperty('--custom-bg',S.bgMode==='color'?S.bgColor:(skin==='dark'?'#071310':'#fffdf8'));
  LevelnPalette10.applyGlobal(root,{leveln:S.colors.level,zaubern:S.colors.save,character:profile().color});
  document.querySelector('#themeMeta').content=skin==='dark'?'#071310':'#fffdf8';
  const variant=['light','dark','mono'].includes(S.iconVariant)?S.iconVariant:(skin==='dark'?'dark':skin==='retro'?'mono':'light');
  const apple=document.querySelector('link[rel="apple-touch-icon"]'),fav=document.querySelector('link[rel="icon"]'),manifest=document.querySelector('link[rel="manifest"]');
  if(apple)apple.href=`./icons/icon-${variant}-180.png`;
  if(fav){fav.href=`./icons/icon-${variant}-192.png`;fav.type='image/png';}
  if(manifest)manifest.href=`./manifest-${variant}.webmanifest`;
}

function lv10Paint(){
  const root=document.documentElement;
  LevelnPalette10.refresh(root);
  for(const el of document.querySelectorAll('[data-quest-color]')){
    const c=el.dataset.questColor;
    if(c)LevelnPalette10.applyQuest(el,c);
  }
}

function lv10CardColor(a){
  if(isOnce(a))return hex(a.color,a.kind==='reduce'?S.colors.save:S.colors.level);
  const g=allGoals().find(g=>g.a.id===a.id);
  return g?goalColor(g):a.kind==='reduce'?S.colors.save:S.colors.level;
}

function lv10Lab(hexValue){
  const m=hexValue?.match(/^#([\da-f]{6})$/i);if(!m)return [0,0,0];
  const rgb=[0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)/255);
  const lin=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  const [r,g,b]=rgb.map(lin),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),
    mm=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),
    s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*mm-.0040720468*s,
    1.9779984951*l-2.4285922050*mm+.4505937099*s,
    .0259040371*l+.7827717662*mm-.8086757660*s];
}

function lv10Distance(a,b){const x=lv10Lab(a),y=lv10Lab(b);return Math.hypot((x[0]-y[0])*1.4,x[1]-y[1],x[2]-y[2]);}

function lv10HslColor(h,s=.72,l=.48){const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};return '#'+[0,8,4].map(n=>f(n).toString(16).padStart(2,'0')).join('');}

function lv10DistinctColor(desired,used){
  desired=hex(desired,'#2caa78');
  if(!used.length||Math.min(...used.map(c=>lv10Distance(desired,c)))>=.115)return desired;
  return LV10_STAT_CANDIDATES.reduce((best,c)=>{
    const score=Math.min(...used.map(u=>lv10Distance(c,u)));
    return score>best.score?{color:c,score}:best;
  },{color:desired,score:-1}).color;
}

function lv10StatisticColor(a){return hex(a.statisticColor,lv10CardColor(a));}

function lv10SkillStatisticColor(skill){return hex(skill.statisticColor,skillColor(skill));}

function lv10NewStatColor(raw,excludeId,forSkills=false){
  const source=forSkills?S.skills:S.activities;
  const used=source.filter(o=>o.id!==excludeId).map(o=>forSkills?lv10SkillStatisticColor(o):lv10StatisticColor(o));
  return lv10DistinctColor(raw,used);
}
