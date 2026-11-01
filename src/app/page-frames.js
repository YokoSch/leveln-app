/* HTML-Seitenvorlagen laden und als layoutneutrale Slots verwenden.
 * Bei Fetchfehler (z.B. lokaler file://-Vorschau) bleibt die App bedienbar.
 * Die Navigations-URL bleibt index.html: installierte PWA = Single-Page-App. */
'use strict';
const LevelnPageFrames = (() => {
  const files={today:'pages/heute/page.html',goals:'pages/quests/page.html',character:'pages/charakter/page.html',stats:'pages/statistik/page.html',settings:'pages/einstellungen/page.html'};
  const frames=Object.create(null);
  return {
    async load(){
      await Promise.all(Object.entries(files).map(async([key,path])=>{
        try { const response=await fetch('./'+path,{cache:'no-cache'}); if(!response.ok)throw Error('HTTP '+response.status);
          const source=await response.text();
          if(!source.includes('{{LEVELN_CONTENT}}'))throw Error('Ungültige Seitenvorlage: '+path);
          frames[key]=source;
        } catch(err){console.warn('Leveln Seitenvorlage nicht geladen:',path,err);}
      }));
    },
    wrap(page,html){ return frames[page]?frames[page].replace('{{LEVELN_CONTENT}}',html):html; },
    loaded(){return Object.keys(frames);}
  };
})();
