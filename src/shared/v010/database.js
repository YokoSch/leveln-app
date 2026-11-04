/*
 * LEVELN 0.10 · src/shared/v010/database.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function migrateV09toV010(input){
  const d=structuredClone(input);
  validateBackup(d);
  const used=[];
  for(const a of d.activities){
    a.cardShown=a.cardShown!==false;
    a.deckOrder=Number.isFinite(a.deckOrder)?a.deckOrder:(Number.isFinite(a.order)?a.order:0);
    const rev=[...(a.revisions||[])].sort((x,y)=>x.from.localeCompare(y.from)).at(-1);
    const c=hex(a.color,hex(rev?.rules?.[0]?.color,a.kind==='reduce'?'#168a70':'#9be948'));
    a.statisticColor=lv10DistinctColor(a.statisticColor||c,used);
    used.push(a.statisticColor);
  }
  const skillUsed=[];
  for(const skill of d.skills){
    skill.statisticColor=lv10DistinctColor(skill.statisticColor||hex(skill.color,'#65be62'),skillUsed);
    skillUsed.push(skill.statisticColor);
  }
  d.meta=d.meta.filter(x=>x.key!=='schemaVersion');
  d.meta.push({key:'schemaVersion',value:LV10.schema});
  return d;
}

async function migrateInstalled(){
  const version=meta('schemaVersion',1);
  if(version!==4)return;
  const data=migrateV09toV010({activities:S.activities,entries:S.entries,overrides:S.overrides,meta:S.meta,skills:S.skills});
  validateBackup(data);
  await dbTx(STORES,t=>{
    for(const name of STORES)for(const row of data[name])t.objectStore(name).put(row);
  });
  await sync();
}

async function setup(){
  db=await dbOpen();await sync();
  const firstLaunch=!meta('initialized',false)&&!S.activities.length&&!S.entries.length;
  const version=meta('schemaVersion',null);
  if(version===4)await migrateInstalled();
  else if(version!==null && version!==5)throw Error('Leveln 0.10 übernimmt installierte Daten aus Leveln 0.9. Bitte zunächst 0.9 verwenden.');
  else if(version===null)await saveMeta('schemaVersion',5);
  if(!meta('initialized',false))await saveMeta('initialized',true);
  if(!S.started){await saveMeta('v04StartedOn',nowDay());S.started=nowDay();}
  S.skills=await dbAll('skills');
  S.deckKind='build';S.deckManagerKind='build';S.deckManagerOpen=false;S.statSkill='all';
  await reconcile();
  // Remove any discontinued 0.11.4 tutorial session without editing quests,
  // entries, XP, wallet balances or the established schema (version 5).
  if(meta('intro114Stage',null))await saveMeta('intro114Stage',null);
  S.tutorialStage=null;
  applyTheme();render();
  if(firstLaunch&&!meta('handbookHintSeen',false)){
    await saveMeta('handbookHintSeen',true);
    S.modal={type:'handbook-hint'};
    renderModal();
  }else maybeCheckin();
  if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(console.warn);
}

async function importBackup(file){
  if(file.size>60*1024*1024)throw Error('Backup größer als 60 MB');
  const json=JSON.parse(await file.text());
  if(json.format!=='progress-local-backup'||![4,5].includes(json.version))throw Error('Nur Backups aus Leveln 0.9 oder 0.10 sind kompatibel.');
  let data=json.version===4?migrateV09toV010(json.data):structuredClone(json.data);
  validateBackup(data);
  if(meta('schemaVersion',null)!==5)throw Error('App-Datenformat noch nicht initialisiert.');
  if(!confirm(`${data.activities.length} Quests, ${data.entries.length} Tageswerte und ${data.skills.length} Skills importieren? Der derzeitige Datenstand wird ersetzt.`))return;
  await dbTx(STORES,t=>{
    for(const name of STORES){const store=t.objectStore(name);store.clear();for(const item of data[name])store.put(item);}
  });
  S.cardDrafts.clear();S.modal=null;S.packet=null;S.page='today';S.day=nowDay();S.card=0;S.deckKind='build';
  await sync();await reconcile();render();toast('Backup importiert · Datenformat 5');
}

async function exportBackup(){
  const fileName=`Leveln-Backup-${nowDay()}.json`;
  const data={activities:S.activities,entries:S.entries,overrides:S.overrides,meta:S.meta,skills:S.skills};
  const blob=new Blob([JSON.stringify({format:'progress-local-backup',version:5,exportedAt:new Date().toISOString(),appVersion:'0.11.4',data},null,2)],{type:'application/json'});
  const file=new File([blob],fileName,{type:'application/json'});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
    try{await navigator.share({files:[file]});return;}catch(error){if(error?.name==='AbortError')return;}
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
