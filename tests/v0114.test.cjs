/** Leveln 0.11.4 – per-quest wallets, pause, deletion, archive and guided intro. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const fake=()=>({addEventListener(){},querySelector(){return fake()},querySelectorAll(){return []},classList:{add(){},remove(){}},style:{setProperty(){}},dataset:{},setAttribute(){},innerHTML:'',closest(){return null}});
const c=vm.createContext({console,document:{addEventListener(){},querySelector(){return fake()},querySelectorAll(){return []},documentElement:fake()},addEventListener(){},navigator:{},crypto:require('node:crypto').webcrypto,structuredClone,File,Blob,URL,performance:{now:()=>500},matchMedia:()=>({matches:false}),setInterval(){},setTimeout(){},clearTimeout(){},confirm:()=>true,alert(){}});c.window=c;c.__LEVELN_UNIT_TEST__=true;
for(const file of require('../scripts.json').scripts)vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
const E=x=>vm.runInContext(x,c),today=E('nowDay()'),yesterday=E('dayAdd(nowDay(),-1)');
c.yesterday=yesterday;c.today=today;
c.activities=[{id:'read',name:'Lesen',kind:'build',order:0,createdAt:yesterday+'T12:00:00',revisions:[{from:yesterday,rules:[{id:'r',period:'day',mode:'calendar',minutes:30,count:null,standardMinutes:15,color:'#66aa55'}],skillRates:{minutes:[{skillId:'s1',rate:60}],count:[]}}]},{id:'spell',name:'Spielen',kind:'reduce',order:1,createdAt:yesterday+'T12:00:00',revisions:[{from:yesterday,rules:[{id:'s',period:'day',mode:'calendar',minutes:60,count:null,standardMinutes:15,color:'#3355bb'}],skillRates:{minutes:[{skillId:'s1',rate:10}],count:[]}}]}];
c.entries=[{id:'read|r|'+yesterday,activityId:'read',ruleId:'r',date:yesterday,mode:'up',source:'user',minutes:30,count:null,status:'yes'},{id:'read|r|'+today,activityId:'read',ruleId:'r',date:today,mode:'up',source:'user',minutes:30,count:null,status:'yes'}];
E('S.activities=activities;S.entries=entries;EM=new Map(entries.map(e=>[e.id,e]));S.skills=[{id:"s1",name:"Lesen",color:"#66aa55"}];S.meta=[];S.started=yesterday;S.day=today;S.deckKind="build";S.card=0;S.wallet={glut:0,inventory:0,byQuest:{read:{glut:5,inventory:0},spell:{glut:0,inventory:0}},awarded:[],frozen:[],history:[]};');
assert.equal(E('xpStats().sum'),60);
const calA=E('goalByKey("read|r")');
assert(E('goalsView().includes("lv114-archive-toggle")'));
assert(E('goalsView().includes("quest-delete")'));
assert(!E('goalsView().includes("lv114-archive-contents")'),'archive starts collapsed');
assert(E('lv114Row(goalByKey("read|r")).includes("quest-pause")'),'pause swipe action present');
assert(E('todayView().indexOf("lv10-play-amounts") < todayView().indexOf("lv11-progress")'));
assert(!E('todayView().includes("deck-caption")'));
E('S.activities[0].pauseRanges=[{start:today,end:null}]');
assert.equal(E('xpStats().sum'),30,'pre-pause XP retained, new paused XP not granted');
assert.equal(E('stData(goalByKey("read|r")).current'),1,'pause protects existing streak without growing');
assert(E('badgeFor(goalByKey("read|r"),today).includes("lv114-pause-icon")'));
assert(E('lv114HasPause(S.activities[0],today)'));
E('S.activities[0].pauseRanges[0].end=today');
assert(!E('lv114HasPause(S.activities[0],today)'),'can resume pause');
assert.equal(E('xpStats().sum'),60,'after unpausing same day normal entries resume');
E('S.activities[0].removedAt=dayAdd(nowDay(),1)+"T00:00:00"');
assert(!E('goals().some(g=>g.a.id==="read")'),'removed quest stays hidden from active goals');
assert.equal(E('xpStats().sum'),60,'removed quest retains XP');
E('S.statGoal="past";S.statMetric="xp";S.statPeriod="all";S.statAnchor=nowDay();');
assert(E('statsView().includes("Vergangenes")'),'removed quest grouped under Vergangenes');
E('S.activities[0].removedAt=null');
// Wallet spending for the first quest must not touch the second.
E('saveMeta=async(k,v)=>{S.wallet=v;S.meta=[...S.meta.filter(x=>x.key!==k),{key:k,value:v}]};render=()=>{};toast=()=>{};');
(async()=>{
 await E('buyFreeze(null,"read")');
 assert.equal(E('lv114WalletView("read").glut'),0);assert.equal(E('lv114WalletView("read").inventory'),1);
 assert.equal(E('lv114WalletView("spell").inventory'),0);
 await assert.rejects(()=>E('buyFreeze(null,"spell")'),/5 Glut/);
 // Existing generic wallet is attributable only through an original milestone.
 c.old={glut:1,inventory:0,awarded:['read|r|2026-10-20|milestone-10'],frozen:[],history:[{type:'glut-earned',key:'read|r|2026-10-20|milestone-10'}]};
 assert.equal(E('lv114NormalizeWallet(old).byQuest.read.glut'),1);
 c.old.glut=0;assert.equal(E('lv114NormalizeWallet(old).byQuest.read.glut'),0,'spent Glut never reappears');
 // Archived entries render with the De-Archivieren control instead of crashing.
 E('S.activities[0].archivedAt=dayAdd(nowDay(),-4)+"T00:00:00"');
 assert(E('lv114Row(allGoals().find(g=>g.a.id==="read"),true).includes("quest-reopen")'));
 E('S.activities[0].createdAt=dayAdd(nowDay(),-8)+"T12:00:00";S.activities[0].revisions[0].from=dayAdd(nowDay(),-8)');
 const gap=E('lv114GapEntries(S.activities[0],[{start:dayAdd(nowDay(),-3),end:dayAdd(nowDay(),-2),minutes:42,count:null}])');
 assert.equal(gap.filter(x=>x.minutes===42).length,2,'reopen backfill uses original archived start, not current date');
 assert(gap.some(x=>x.date===E('dayAdd(nowDay(),-4)')&&x.source==='zero-auto'));
 E('S.activities[0].archivedAt=null');
 // Delete all permanently removes underlying entries and account, not just row visibility.
 E('S.wallet.byQuest.read={glut:5,inventory:1};S.modal=null;');
 c.stores={activities:new Map(c.activities.map(x=>[x.id,x])),entries:new Map(c.entries.map(x=>[x.id,x])),overrides:new Map(),meta:new Map(),skills:new Map()};
 E('dbTx=async(ns,run)=>{run({objectStore(n){const m=stores[n];return {put(v){m.set(n==="meta"?v.key:v.id,structuredClone(v))},delete(id){m.delete(id)},clear(){m.clear()}}}})};sync=async()=>{S.activities=[...stores.activities.values()];S.entries=[...stores.entries.values()];S.meta=[...stores.meta.values()];EM=new Map(S.entries.map(e=>[e.id,e]));if(stores.meta.get("emberWallet"))S.wallet=stores.meta.get("emberWallet").value};');
 // Full IndexedDB-like reactivation: gap values must survive reload and
 // the originally archived start date is the lower bound for catch-up.
 const archived=structuredClone(c.stores.activities.get('read'));
 archived.createdAt=E('dayAdd(nowDay(),-8)')+'T12:00:00';
 archived.revisions[0].from=E('dayAdd(nowDay(),-8)');
 archived.archivedAt=E('dayAdd(nowDay(),-4)')+'T00:00:00';
 c.stores.activities.set('read',archived);
 await E('sync()');
 await E('lv114ReopenQuest("read",[{start:dayAdd(nowDay(),-3),end:dayAdd(nowDay(),-2),minutes:37,count:null}])');
 assert.equal(c.stores.activities.get('read').archivedAt,null);
 assert.equal(c.stores.activities.get('read').reopenedGlutLockUntil,today);
 assert.equal(c.stores.entries.get(`read|r|${E('dayAdd(nowDay(),-3)')}`).minutes,37);
 assert.equal(c.stores.entries.get(`read|r|${E('dayAdd(nowDay(),-2)')}`).minutes,37);
 assert.equal(c.stores.entries.get(`read|r|${E('dayAdd(nowDay(),-4)')}`).source,'zero-auto');
 await E('lv114DeleteQuest("read","all")');
 assert.equal(c.stores.activities.has('read'),false);assert.equal(c.stores.entries.size,0);
 assert.equal(E('xpStats().sum'),0);assert.equal(E('S.wallet.byQuest.read===undefined'),true);
 // Tutorial stages persist and never create synthetic activities.
 const before=c.stores.activities.size;
 await E('lv114TutorialStage("quest")');
 assert.equal(E('S.tutorialStage'),'quest');
 assert.equal(c.stores.activities.size,before);
 await E('lv114TutorialFinish()');assert.equal(E('S.tutorialStage'),null);
 console.log('OK: per-quest Glut/Freezes, no cross-quest spending, pause without XP, archive visibility, Vergangenes stats, permanent delete & tutorial states');
})().catch(e=>{console.error(e);process.exitCode=1});
