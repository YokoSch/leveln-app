/** Leveln 0.11.3 – historische Buchungen, Glut-Sperre, Kalender, DnD und SVGs. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const fakeEl=()=>({addEventListener(){},style:{setProperty(){}},classList:{add(){},remove(){}},querySelector(){return fakeEl()},querySelectorAll(){return []},closest(){return null},dataset:{},innerHTML:'',setAttribute(){}});
const document={addEventListener(){},documentElement:fakeEl(),querySelector(){return fakeEl()},querySelectorAll(){return []}};
const c=vm.createContext({console,document,addEventListener(){},navigator:{},crypto:require('node:crypto').webcrypto,setInterval(){},setTimeout(){},clearTimeout(){},URL,File,Blob,structuredClone,performance:{now:()=>1200},matchMedia:()=>({matches:false}),confirm:()=>true,alert(){}});
c.__LEVELN_UNIT_TEST__=true;c.window=c;
for(const file of require('../scripts.json').scripts)vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
const E=x=>vm.runInContext(x,c);
const today=E('nowDay()');
const start=E('dayAdd(nowDay(),-15)'),end=E('dayAdd(nowDay(),-1)');
c.testDay=today;c.testStart=start;c.testEnd=end;
E(`S.started=nowDay();S.wallet={glut:0,inventory:1,awarded:[],frozen:[],history:[]};S.skills=[{id:'s1',name:'Sport'}];S.meta=[];S.entries=[];EM=new Map();S.activities=[];`);
// 15 successful historic days, 60 min/day, 10 XP/hour => 150 XP + 1 Glut.
c.testQuest={id:'test-quest',name:'Test',kind:'build',createdAt:today+'T12:00:00',originalCreatedOn:today,order:0,
 revisions:[{from:today,rules:[{id:'test-rule',period:'day',mode:'calendar',minutes:60,count:null,standardMinutes:20,color:'#33aa77',colorEnabled:true}],skillRates:{minutes:[{skillId:'s1',rate:10}],count:[]}}]};
c.testRanges=[{start,end,minutes:60,count:null}];
function fakeForm(ranges){return {querySelectorAll(selector){if(!selector.includes('.lv113-history-range'))return [];return ranges.map(r=>({querySelector(s){return {value:s.includes('start')?r.start:s.includes('end')?r.end:s.includes('count')?String(r.count??0):String(r.minutes??0)}}}))}};}
c.myForm=fakeForm(c.testRanges);
c.myPlan=E('lv113ReadHistory(myForm,testQuest,null)');
assert.equal(c.myPlan.writes.length,15);
E('lv113PrepareHistoricalRevision(testQuest,null,myPlan)');
assert.equal(c.testQuest.createdAt.slice(0,10),start);
assert.equal(c.testQuest.originalCreatedOn,today);
assert.equal(c.testQuest.revisions[0].from,start);
c.credit=E('lv113PreviewHistoricalWallet(testQuest,myPlan,null)');
assert.equal(c.credit.glut,1,'one-time historical ten-day milestone');
assert.equal(c.credit.awarded.length,1);
E('S.activities=[testQuest];S.entries=myPlan.writes;EM=new Map(S.entries.map(e=>[e.id,e]));');
assert.equal(E('xpStats().sum'),150,'XP derived from normal historic entries');
assert.equal(E('stData(allGoals()[0]).current'),15);
const second=E('lv113PreviewHistoricalWallet(testQuest,myPlan,testQuest)');
assert.equal(second,null,'no additional historical glut on later edits');
assert.equal(c.testQuest.historicalGlutLockDate,today);
// Historical range overlaps rejected before writing.
c.badForm=fakeForm([{start,end: start,minutes:60,count:0},{start,end:start,minutes:60,count:0}]);
assert.throws(()=>E('lv113ReadHistory(badForm,testQuest,testQuest)'),/überschneiden/);
// Date of original creation is never modifiable by history input.
c.badDate=fakeForm([{start:today,end:today,minutes:60,count:0}]);
assert.throws(()=>E('lv113ReadHistory(badDate,testQuest,testQuest)'),/vor der ursprünglichen Questerstellung/);
// A weekly period generates a connected frame and a single flame, not 7 flames.
c.weekly={...structuredClone(c.testQuest),id:'week-quest',revisions:[{from:start,rules:[{id:'week-rule',period:'week',mode:'calendar',minutes:60,count:null,color:'#55cc88'}],skillRates:{minutes:[{skillId:'s1',rate:10}],count:[]}}]};
c.weeklyEntries=[];
for(let d=start;d<today;d=E(`dayAdd('${d}',1)`))c.weeklyEntries.push({id:`week-quest|week-rule|${d}`,date:d,activityId:'week-quest',ruleId:'week-rule',minutes:60,count:null,source:'user',status:'yes',mode:'up'});
E('S.activities.push(weekly);S.entries.push(...weeklyEntries);EM=new Map(S.entries.map(e=>[e.id,e]));');
c.weekGoal=E('allGoals().find(g=>g.a.id==="week-quest")');
const calendar=E('lv113PeriodFrames(weekGoal,calendarStart("week",dayAdd(nowDay(),-7)),7)');
assert(calendar.includes('lv113-period-frame'));
assert(calendar.includes('lv113-period-layer'));
assert.equal((calendar.match(/lv113-period-flame/g)||[]).length,1,'a period flame is drawn once');
assert(E('lv113DailyBadge(null,dayAdd(nowDay(),-1))').includes('cal-icon fire'),'weekly calendar still shows daily icons without selected goal');
const manager=E('lv113ManagerRow(testQuest)');
assert(manager.includes('lv10-manager-list-row'));
assert(fs.readFileSync('pages/kartenverwaltung/page.js','utf8').includes('lv113SyncDeckViews'));
assert(fs.readFileSync('src/shared/v010/events.js','utf8').includes('lv113-drag-ghost'));
assert(!fs.readFileSync('pages/heute/page.js','utf8').includes('class="card-head-icon"'));
assert(fs.readFileSync('src/shared/v010/assets.js','utf8').includes('LevelnSvgArtwork.render'));
assert(fs.readFileSync('src/styles/v0113.css','utf8').includes('.avatar-hero'));
console.log('OK: historical 15-day XP, one-time Glut, overlap/date validation, weekly frames, daily flame, synced sort, original SVGs');
