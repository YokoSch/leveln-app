const ts=require('typescript'),fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const manifest=require('../scripts.json');
const scripts=manifest.scripts;
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const symbols=new Map();
const originalHashes=require('./function-origin-sha256.json');
// Explicit feature work since v0.10: these changed/new functions are verified by
// functional tests instead of the strict modularisation-only body-hash contract.
const changedIn011=new Set(['oneTimeGoals','lv10DeckGoals','lv11Progress','cardHtml','todayView',
 'lv10ManagerMini','lv10ManagerRender','lv10DragSave','characterView','settingsView',
 'lv11ChestDay','badgeFor','handleAction','editGoalModal','saveGoal','lv11IntroOpen','lv11IntroFinish',
 'lv11IntroModal','lv11FreezeShop','renderModal','setup','exportBackup','ico','art']);
let verified=0;
for(const file of scripts){
 assert(fs.existsSync(file),`fehlendes Script: ${file}`);
 assert(html.includes(`src="./${file}"`),`Script fehlt im Index: ${file}`);
 assert(sw.includes(`"./${file}"`),`Script fehlt offline: ${file}`);
 const code=fs.readFileSync(file,'utf8');
 const sf=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 assert.equal(sf.parseDiagnostics.length,0,`${file} Syntaxfehler`);
 for(const statement of sf.statements){
  if(!ts.isFunctionDeclaration(statement))continue;
  const name=statement.name.text;
  assert(!symbols.has(name),`Mehrfachdefinition von ${name} in ${file}, schon in ${symbols.get(name)}`);
  symbols.set(name,file);
  const body=code.slice(statement.getStart(sf),statement.end);
  const origin=Object.values(originalHashes).find(x=>x.file===file&&x.sha256===crypto.createHash('sha256').update(body).digest('hex'));
  if(name==='render')assert(code.includes('LevelnPageFrames.wrap'), 'Render-Integration fehlt');
  else if(!changedIn011.has(name))assert(origin,`Veränderter Funktionskörper: ${name} (${file})`);
  verified++;
 }
}
for(const name of ['today','goals','character','stats','settings']){
 const page={today:'heute',goals:'quests',character:'charakter',stats:'statistik',settings:'einstellungen'}[name];
 const file=`pages/${page}/page.html`;
 assert(fs.readFileSync(file,'utf8').includes('{{LEVELN_CONTENT}}'));
 assert(sw.includes('"./'+file+'"'),`Template nicht offline: ${file}`);
}
const stylePaths=html.match(/href="\.\/[^"']+\.css"/g)||[];
for(const css of stylePaths){const file=css.slice(8,-1);assert(fs.existsSync(file),`Fehlendes CSS ${file}`);assert(sw.includes(`"./${file}"`),`Nicht offline: ${file}`)}
assert(sw.includes('leveln-pwa-v0.11.2-'));
assert(!html.includes('src="./app.js"')&&!html.includes('src="./v010.js"'));
console.log(`OK: ${scripts.length} Scriptdateien, ${verified} verifizierte Funktionen (geplante Änderungen ausgenommen), Seitentemplates & Offline-Dateien`);
