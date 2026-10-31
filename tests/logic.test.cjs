/* Standalone checks: node tests/logic.test.cjs (no package installation). */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const fakeElement=()=>({addEventListener(){},style:{setProperty(){}},classList:{add(){},remove(){}},querySelector(){return fakeElement()},querySelectorAll(){return []},closest(){return null},dataset:{},innerHTML:'',setAttribute(){}});
const document={addEventListener(){},documentElement:fakeElement(),querySelector(){return fakeElement()},querySelectorAll(){return []}};
const context=vm.createContext({console,document,addEventListener(){},navigator:{},crypto:require('crypto').webcrypto,
  setInterval(){},setTimeout(){},clearTimeout(){},URL,File,Blob,TextEncoder,TextDecoder,structuredClone,performance:{now:()=>1200},
  matchMedia:()=>({matches:false}),confirm:()=>true,alert:console.log});
context.__LEVELN_UNIT_TEST__=true;
context.window=context;
vm.runInContext(fs.readFileSync('app.js','utf8'),context,{filename:'app.js'});
vm.runInContext(fs.readFileSync('theme/palette.js','utf8'),context,{filename:'palette.js'});
vm.runInContext(fs.readFileSync('v010.js','utf8'),context,{filename:'v010.js'});
const E=s=>vm.runInContext(s,context);
const current=E('nowDay()');
const mock={activities:[{id:'quest-1',kind:'build',name:'Lesen',createdAt:current+'T12:00:00',order:0,
  revisions:[{from:current,rules:[{id:'rule-1',period:'day',mode:'calendar',minutes:null,count:5,standardCount:2,color:'#456789',colorEnabled:true}],skillRates:{minutes:[],count:[{skillId:'skill-1',rate:3}]}}]},
  {id:'quest-2',kind:'reduce',name:'Youtube',createdAt:current+'T12:00:00',order:1,
   revisions:[{from:current,rules:[{id:'rule-2',period:'day',mode:'calendar',minutes:120,count:null,standardMinutes:20}],skillRates:{minutes:[{skillId:'skill-2',rate:10}],count:[]}}]}],
  skills:[{id:'skill-1',name:'Wissen',color:'#456789'},{id:'skill-2',name:'Disziplin',color:'#456789'}],
  entries:[{id:'quest-1|rule-1|'+current,activityId:'quest-1',ruleId:'rule-1',date:current,count:3,minutes:null,source:'user',mode:'up',status:'yes'}],
  overrides:[],meta:[{key:'schemaVersion',value:4},{key:'v04StartedOn',value:current}]};
context.fixture=mock;
const migrated=E('migrateV09toV010(fixture)');
assert.equal(migrated.meta.find(x=>x.key==='schemaVersion').value,5);
assert.deepEqual(JSON.parse(JSON.stringify(migrated.entries)),mock.entries,'never alter 0.9 booking quantities');
assert.equal(migrated.activities[0].cardShown,true);
assert.notEqual(migrated.activities[0].statisticColor,migrated.activities[1].statisticColor);
assert.notEqual(migrated.skills[0].statisticColor,migrated.skills[1].statisticColor);
assert.equal(migrated.activities[0].revisions[0].skillRates.count[0].rate,3,'preserve xp rates');
assert.equal(E('lv10Distance("#ffffff","#000000")>.15'),true);
context.testData=migrated;
E('S.activities=testData.activities;S.entries=testData.entries;S.meta=testData.meta;S.skills=testData.skills;S.started=nowDay();S.day=nowDay();S.cardDrafts=new Map();EM=new Map(S.entries.map(e=>[e.id,e]));');
const originalXP=E('xpEvents().reduce((s,e)=>s+e.xp,0)');
assert.equal(originalXP,9,'3 counts * 3 xp');
const g=E('goalByKey("quest-1|rule-1")');context.myGoal=g;
assert.equal(E('bookingFields(myGoal,true).count'),5,'existing 3 + default 2');
const next=E('bookingFields(myGoal,true)');context.next=next;
E('S.entries=[{...S.entries[0],...next}]; EM=new Map(S.entries.map(e=>[e.id,e]));');
assert.equal(E('xpEvents().reduce((s,e)=>s+e.xp,0)'),15,'XP derived from new total once');
// ZAUBERN XP cannot be collected on the open calendar day.
E(`S.entries.push({id:'quest-2|rule-2|${current}',activityId:'quest-2',ruleId:'rule-2',date:nowDay(),source:'user',mode:'up',status:'yes',minutes:20,count:null}); EM=new Map(S.entries.map(e=>[e.id,e]));`);
assert.equal(E('xpEvents().filter(e=>e.kind==="save").length'),0,'open mana period not settled');
assert.equal(E('lv10StatValue({xp:10,metric:"minutes",amount:60,allocations:[{skillId:"skill-1",amount:3},{skillId:"skill-2",amount:7}]},"minutes","skill-1")'),18,'pro-rata amount in minutes');

// Forms must show no implicit metric until user explicitly selects time/count.
E('globalThis.capturedForm=""; sheet=(title,html)=>{globalThis.capturedForm=html}; S.modal={type:"edit-goal"}; editGoalModal()');
assert(E('capturedForm.includes("Ziel – Zeit") && capturedForm.includes("Ziel – Anzahl")'));
assert(!E('capturedForm.includes("Lebensbereich")'));
assert(!E('capturedForm.includes("lv10-metric-head")'));
E('S.modal={type:"edit-goal",activityId:"quest-1"}; editGoalModal()');
assert(E('capturedForm.includes("lv10-metric-table") && capturedForm.includes("XP pro Anzahl")'));
assert(!E('capturedForm.includes("XP pro Stunde</b>")'),'count-only quest must not show a time XP table');
E('S.modal=null; S.deckKind="build";');
assert(E('todayView().includes("lv10-play-amounts")'),'direct card stepper present');
assert(E('goalsView().indexOf("goals-sticky")<goalsView().indexOf("quest-filter-bar")'),'filters below calendar');

assert.equal(E('lv10DeckGoals(nowDay(),"build").length'),1,'build deck contains only build quests');
assert.equal(E('lv10DeckGoals(nowDay(),"reduce").length'),1,'spell deck contains only spell quests');
E('S.activities[0].cardShown=false');
assert.equal(E('lv10DeckGoals(nowDay(),"build").length'),0,'hidden active quests removed from deck');
assert.equal(E('S.activities[0].revisions[0].skillRates.count[0].rate'),3,'deck changes do not alter xp');
for(const skin of ['dark','light','retro'])for(const color of ['#000000','#ffffff','#ffff00','#ff00ff','#0066ee','#808080']){
  const palette=vm.runInContext(`LevelnPalette10.derive('${color}','${skin}')`,context);
  assert.match(palette.accent,/^#[0-9a-f]{6}$/);
  assert(palette.contrastText>=4.5||skin==='retro');
}
console.log('OK: logic checks, migration 4->5, original XP, add bookings, Mana pending, color contrast, deck visibility, skill allocation');
