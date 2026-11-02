/** End-to-end-ish simulation of quest form save -> IndexedDB transaction -> normal XP + one-time Glut. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const el=()=>({addEventListener(){},querySelector(){return el()},querySelectorAll(){return []},classList:{add(){}},style:{setProperty(){}},setAttribute(){},dataset:{}});
const doc={addEventListener(){},documentElement:el(),querySelector(){return el()},querySelectorAll(){return []}};
const context=vm.createContext({console,document:doc,addEventListener(){},navigator:{},crypto:require('node:crypto').webcrypto,setInterval(){},setTimeout(){},clearTimeout(){},URL,File,Blob,structuredClone,performance:{now:()=>0},matchMedia:()=>({matches:false}),confirm:()=>true,alert(){}});
context.__LEVELN_UNIT_TEST__=true;context.window=context;
for(const f of require('../scripts.json').scripts)vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f});
const E=x=>vm.runInContext(x,context);
const today=E('nowDay()'),from=E('dayAdd(nowDay(),-11)'),to=E('dayAdd(nowDay(),-1)');
context.today=today;context.from=from;context.to=to;
E('S.activities=[];S.entries=[];S.meta=[];S.skills=[{id:"s1",name:"Disziplin"}];S.started=nowDay();S.day=nowDay();S.wallet={glut:0,inventory:0,awarded:[],frozen:[],history:[]};S.modal={type:"edit-goal"};EM=new Map();');
const stores={activities:new Map(),entries:new Map(),skills:new Map([['s1',{id:'s1',name:'Disziplin'}]]),meta:new Map()};
context.stores=stores;
E(`dbTx=async(names,run)=>{const tx={objectStore(n){const m=stores[n];return {put(v){m.set(n==='meta'?v.key:v.id,structuredClone(v))},delete(id){m.delete(id)}}}};run(tx)};
sync=async()=>{S.activities=[...stores.activities.values()];S.entries=[...stores.entries.values()];S.meta=[...stores.meta.values()];S.skills=[...stores.skills.values()];EM=new Map(S.entries.map(e=>[e.id,e]));S.wallet=stores.meta.get('emberWallet')?.value||S.wallet;};
render=()=>{};toast=()=>{};`);
function formData(ranges){
  const elements=Object.fromEntries(Object.entries({questType:'repeat',kind:'build',name:'Sport',shortName:'SPR',iconKey:'',newSkillName:'',goalColor:'#66cc88',startDate:today,period:'day',mode:'calendar',minutes:'60',stdMinutes:'15'}).map(([k,v])=>[k,{value:v}]));
  const rateRow={closest(){return {dataset:{metric:'minutes'}}},querySelector(sel){return {value:sel.includes('skill')?'s1':'10'}}};
  return {elements,querySelector(sel){return sel.includes('data-metric="minutes"')?{}:null},querySelectorAll(sel){
    if(sel.includes('.binding-row'))return [rateRow];
    if(sel.includes('lv113-history-range'))return ranges.map(x=>({querySelector(sel){return {value:sel.includes('start')?x.start:sel.includes('end')?x.end:sel.includes('minutes')?String(x.minutes):String(x.count)}}}));
    return [];
  }};
}
context.goalForm=formData([{start:from,end:to,minutes:60,count:0}]);
(async()=>{
  await vm.runInContext('saveGoal(goalForm)',context);
  assert.equal(stores.activities.size,1);
  assert.equal(stores.entries.size,11);
  assert.equal(stores.meta.get('emberWallet').value.glut,1);
  assert.equal(E('xpStats().sum'),110);
  const activity=[...stores.activities.values()][0];
  assert.equal(activity.originalCreatedOn,today);
  assert.equal(activity.historicalGlutLockDate,today);
  assert.equal(activity.historicalGlutCredited,true);
  // Editing later updates the normal XP but cannot mint more historical Glut.
  E(`S.modal={type:'edit-goal',activityId:S.activities[0].id}`);
  const altered=formData([{start:from,end:to,minutes:30,count:0}]);
  altered.elements.statColor={value:'#66cc88'};
  context.goalForm=altered;
  await vm.runInContext('saveGoal(goalForm)',context);
  assert.equal(stores.entries.size,11);
  assert.equal(E('xpStats().sum'),55);
  assert.equal(stores.meta.get('emberWallet').value.glut,1);
  // Reset history to empty: no precreation XP, no extra Glut.
  E(`S.modal={type:'edit-goal',activityId:S.activities[0].id}`);
  context.goalForm=formData([]);context.goalForm.elements.statColor={value:'#66cc88'};
  await vm.runInContext('saveGoal(goalForm)',context);
  assert.equal(stores.entries.size,0);
  assert.equal(E('xpStats().sum'),0);
  assert.equal(stores.meta.get('emberWallet').value.glut,1);
  assert.equal(stores.activities.values().next().value.createdAt.slice(0,10),today);
  console.log('OK: create/edit/clear history through saveGoal, one atomic transaction, derived XP, exactly-once historical Glut');
})().catch(e=>{console.error(e);process.exitCode=1});
