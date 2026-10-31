/*
 * Leveln 0.10 – Runtime-Farbadapter (nur Darstellung; keine Datenpersistenz).
 * Nutzerfarben bleiben in ihrer originalen Hexform erhalten. Die Paletten
 * werden pro Skin in OKLCH abgeleitet; weder Quests noch XP-Daten ändern sich.
 *
 * Anwendung:
 *   LevelnPalette10.applyQuest(cardElement, quest.color);
 *   LevelnPalette10.applyGlobal(appRoot, {leveln: settings.levelColor, zaubern: settings.spellColor});
 *   LevelnDesign10.setSkin(appRoot, 'dark'); // leitet Nutzerfarben neu ab
 *
 * Integration: <script src="theme/palette.js"> VOR theme/designkit.js.
 */
(function (global) {
  'use strict';
  const DEFAULTS = Object.freeze({leveln:'#45c66c', zaubern:'#3589d5', mana:'#226ec7', glut:'#d88a32', xp:'#45c66c', character:'#45c66c'});
  const FACES = Object.freeze({dark:'#071a15', light:'#ffffff', retro:'#ffffff'});
  const PALETTE_FIELDS=['--lv-user-color','--lv-card-accent','--lv-card-ink','--lv-card-soft','--lv-card-rgb','--lv-card-core','--lv-quest-accent'];
  const profiles = new WeakMap();
  function parseColor(value) {
    if(typeof value!=='string')return null;
    const m=value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if(!m)return null;
    let h=m[1];if(h.length===3)h=[...h].map(c=>c+c).join('');
    return {hex:'#'+h.toLowerCase(), rgb:[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)};
  }
  function clamp(x,a=0,b=1){return Math.min(b,Math.max(a,x));}
  function lin(x){return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4;}
  function enc(x){x=clamp(x);return x<=0.0031308?x*12.92:1.055*x**(1/2.4)-0.055;}
  function toLab(rgb){
    const [r,g,b]=rgb.map(lin),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
    return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.4285922050*m+.4505937099*s,.0259040371*l+.7827717662*m-.8086757660*s];
  }
  function toLch(lab){const [L,a,b]=lab;return {L,C:Math.hypot(a,b),h:Math.atan2(b,a)};}
  function fromLch(L,C,h){
    const a=C*Math.cos(h),b=C*Math.sin(h);
    const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.2914855480*b)**3;
    return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.7076147010*s];
  }
  function toRgb(L,C,h){
    // Reduce chroma until the resulting color fits the sRGB gamut; do not
    // clamp RGB channels independently (which would shift user-selected hue).
    let lo=0,hi=Math.max(0,C),best=fromLch(L,0,h);
    for(let i=0;i<24;i++){
      const mid=(lo+hi)/2,candidate=fromLch(L,mid,h);
      if(candidate.every(x=>x>=-1e-7&&x<=1+1e-7)){lo=mid;best=candidate;}else hi=mid;
    }
    return best.map(enc);
  }
  function hex(rgb){return '#'+rgb.map(x=>Math.round(clamp(x)*255).toString(16).padStart(2,'0')).join('');}
  function channels(h){return parseColor(h).rgb.map(x=>Math.round(x*255)).join(', ');}
  function relativeLum(rgb){const [r,g,b]=rgb.map(lin);return .2126*r+.7152*g+.0722*b;}
  function contrast(a,b){const L1=relativeLum(parseColor(a).rgb),L2=relativeLum(parseColor(b).rgb);return (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);}
  function colorAt(src,L,Cfactor=1){return hex(toRgb(clamp(L,.02,.98),Math.min(src.C*Cfactor,.235),src.h));}
  function ensureContrast(src,L,background,ratio,direction){
    let value=colorAt(src,L),i=0;
    while(contrast(value,background)<ratio&&i++<70){L=clamp(L+(direction==='lighter'?.008:-.008),.03,.97);value=colorAt(src,L);}
    if(contrast(value,background)<ratio)return direction==='lighter'?'#ffffff':'#111111';
    return value;
  }
  function derive(source,skin='dark'){
    if(!FACES[skin])throw new Error('Unbekanntes Farbschema: '+skin);
    const parsed=parseColor(source)||parseColor(DEFAULTS.leveln);
    const lch=toLch(toLab(parsed.rgb)),bg=FACES[skin],neutral=lch.C<.015;
    let edge,ink,soft,core;
    if(skin==='dark'){
      // Every hue, including orange, purple, white, gray and near-black,
      // becomes legible luminous ink on the dark card. Neutral stays neutral.
      edge=ensureContrast(lch,.74,bg,3,'lighter');
      ink=ensureContrast(lch,.83,bg,4.5,'lighter');
      soft=colorAt(lch,.26,.58);
      core=colorAt(lch,.91,neutral?1:.38);
    } else if(skin==='light'){
      // Soft pastel border, but icon and labels have a *separate* accessible
      // dark ink tone. Never rely on a yellow/pale outline for readable text.
      edge=colorAt(lch,.76,.66);
      ink=ensureContrast(lch,.43,bg,4.5,'darker');
      soft=colorAt(lch,.95,.18);
      core=colorAt(lch,.86,.4);
    } else {
      // Retro is predominantly black on white. User hue is retained only in
      // restrained functional accents (progress, thin marker, selection).
      edge='#161616';ink='#151515';soft='#ffffff';
      core=ensureContrast(lch,.52,bg,3,'darker');
    }
    const accent=skin==='retro'?core:edge;
    return Object.freeze({source:parsed.hex,skin,accent,edge,ink,soft,core,rgb:channels(accent),neutral,contrastText:contrast(ink,bg),contrastBorder:contrast(edge,bg)});
  }
  function tokens(c){return {
    '--lv-user-color':c.source,'--lv-card-accent':c.accent,'--lv-card-ink':c.ink,
    '--lv-card-soft':c.soft,'--lv-card-rgb':c.rgb,'--lv-card-core':c.core,
    '--lv-quest-accent':c.accent
  };}
  function setVars(element,obj){for(const [k,v] of Object.entries(obj))element.style.setProperty(k,v);}
  function closestSkin(el){return el.closest('.lv10-root')?.getAttribute('data-leveln-skin')||'dark';}
  function applyQuest(element,source){
    if(!element||!element.style)throw new Error('Quest-Element fehlt');
    const parsed=parseColor(source)||parseColor(DEFAULTS.leveln);
    element.dataset.levelnColor=parsed.hex;
    const result=derive(parsed.hex,closestSkin(element));setVars(element,tokens(result));return result;
  }
  function applyGlobal(root,overrides={}){
    if(!root||!root.style)throw new Error('Leveln-Wurzel fehlt');
    const safe={...DEFAULTS};
    for(const [key,value] of Object.entries(overrides))if(key in safe && parseColor(value))safe[key]=parseColor(value).hex;
    profiles.set(root,safe);return setGlobalColors(root,safe);
  }
  function setGlobalColors(root,safe){
    const skin=root.dataset.levelnSkin||'dark';
    const defs={leveln:'--lv-leveln',zaubern:'--lv-zaubern',mana:'--lv-mana',glut:'--lv-ember',xp:'--lv-xp',character:'--lv-character-color'};
    for(const [key,prop] of Object.entries(defs)){
      const c=derive(safe[key],skin);
      // Semantic resource colors are preserved but adapted to each background.
      const roleColor=skin==='retro'?c.core:c.ink;
      root.style.setProperty(prop,roleColor);
      root.style.setProperty(prop+'-rgb',channels(roleColor));
      if(key==='leveln')root.style.setProperty('--lv-active',roleColor);
    }
    return safe;
  }
  function refresh(root){
    if(!root)return;
    if(profiles.has(root))setGlobalColors(root,profiles.get(root));
    for(const el of root.querySelectorAll('[data-leveln-color]'))applyQuest(el,el.dataset.levelnColor);
  }
  global.LevelnPalette10=Object.freeze({DEFAULTS,parseColor,derive,applyQuest,applyGlobal,refresh,contrast});
})(typeof window!=='undefined'?window:globalThis);
