/*
 * LEVELN 0.10 · src/shared/domain/erfahrung.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function streakBefore(g, at, w) { let run = 0; for (let previous of periods(g, dayAdd(at.start, -1))) {
    if (previous.end > at.start)
        continue;
    let v = assessment(g, previous);
    if (lv114PeriodProtected(g,previous))continue;
    if (v.state === 'success')
        run++;
    else if (w.frozen.includes(frozenKey(g, previous))) { }
    else if (v.state === 'fail')
        run = 0;
} return run; }

async function reconcileWallet(){
  const w=lv114NormalizeWallet(S.wallet),items=[];let changed=!S.wallet?.byQuest;
  for(const g of goals().filter(g=>!isOnce(g.a))){
    if(g.a.removedAt)continue;
    for(const p of periods(g)){
      if(!finalLocked(p)||p.end<=S.started||g.a.historicalGlutLockDate&&p.end<=g.a.historicalGlutLockDate||g.a.reopenedGlutLockUntil&&p.end<=g.a.reopenedGlutLockUntil||lv114PeriodProtected(g,p))continue;
      items.push({g,p});
    }
  }
  items.sort((a,b)=>a.p.end.localeCompare(b.p.end)||a.g.key.localeCompare(b.g.key));
  const settled=new Set(w.history.filter(x=>x.type==='settled').map(x=>x.key));
  for(const {g,p} of items){
    const key=frozenKey(g,p),q=lv114Account(w,g.a.id);
    if(settled.has(key))continue;
    const v=assessment(g,p);
    if(v.state==='pending')continue;
    if(v.state==='fail'&&!v.hasUnknown&&q.inventory>0&&streakBefore(g,p,w)>0){
      q.inventory--;w.frozen.push(key);w.history.push({type:'freeze-used',key,questId:g.a.id,at:new Date().toISOString()});
    }
    w.history.push({type:'settled',key,questId:g.a.id,status:v.state,at:new Date().toISOString()});changed=true;
  }
  for(const g of goals().filter(g=>!isOnce(g.a)&&!g.a.removedAt)){
    let chain=0;
    for(const p of periods(g)){
      if(!finalLocked(p))continue;
      if(lv114PeriodProtected(g,p))continue;
      const v=assessment(g,p),key=frozenKey(g,p);
      if(v.state==='success'){
        chain++;
        if(chain%10===0&&p.end>S.started&&(!g.a.historicalGlutLockDate||p.end>g.a.historicalGlutLockDate)&&(!g.a.reopenedGlutLockUntil||p.end>g.a.reopenedGlutLockUntil)){
          const milestone=`${key}|milestone-${chain}`;
          if(!w.awarded.includes(milestone)){
            w.awarded.push(milestone);lv114Account(w,g.a.id).glut++;
            w.history.push({type:'glut-earned',questId:g.a.id,key:milestone,at:new Date().toISOString()});changed=true;
          }
        }
      }else if(w.frozen.includes(key)){}else if(v.state==='fail')chain=0;
    }
  }
  const totals=lv114WalletTotals(w);w.glut=totals.glut;w.inventory=totals.inventory;
  if(changed){await saveMeta('emberWallet',w);S.wallet=w;}
}

async function buyFreeze(useKey,questId){
  const id=questId||lv114ActivityFromKey(useKey)||S.shopQuestId;
  const a=S.activities.find(a=>a.id===id);
  if(!a||a.removedAt||a.archivedAt||isOnce(a))throw Error('Bitte eine aktive Quest im Shop auswählen.');
  const w=lv114NormalizeWallet(S.wallet),q=lv114Account(w,id);
  if(q.glut<5)throw Error('Diese Quest braucht 5 Glut für einen Freeze.');
  if(!useKey&&q.inventory>=2)throw Error('Diese Quest hat bereits zwei Freezes.');
  if(useKey&&w.frozen.includes(useKey))throw Error('Dieser Zeitraum ist bereits geschützt.');
  q.glut-=5;
  if(useKey){w.frozen.push(useKey);w.history.push({type:'instant-freeze',key:useKey,questId:id,at:new Date().toISOString()});}
  else{q.inventory++;w.history.push({type:'freeze-bought',questId:id,at:new Date().toISOString()});}
  Object.assign(w,lv114WalletTotals(w));await saveMeta('emberWallet',w);S.wallet=w;
  render();toast(useKey?'Streak gerettet!':'Freeze für diese Quest gekauft');
}

function rateBundles(a, d) { return revision(a, d).skillRates || { minutes: [], count: [] }; }

function eventFor(g, day, kind, metric, amount, bundles) { const units = metric === 'minutes' ? amount / 60 : amount; const allocations = (bundles?.[metric] || []).filter(x => finite(x.rate)).map(x => ({ skillId: x.skillId, amount: units * x.rate })).filter(x => x.amount > 0); const xp = allocations.reduce((s, x) => s + x.amount, 0); return xp > 0 ? { goal: g.key, day, kind, metric, amount, xp, allocations } : null; }

function xpEvents() {
    const ev = [];
    for (const a of S.activities) {
        if (isOnce(a)) {
            if (a.completedAt) {
                const day = a.completedAt.slice(0, 10), g = { key: onceKey(a) }, bindings = a.rewardSnapshot || a.rewardBindings || [];
                const allocations = bindings.filter(x => finite(x.xp) && x.xp > 0).map(x => ({ skillId: x.skillId, amount: x.xp }));
                if (allocations.length)
                    ev.push({ goal: g.key, day, kind: a.kind === 'reduce' ? 'save' : 'level', metric: 'once', amount: 1, xp: allocations.reduce((s, x) => s + x.amount, 0), allocations });
            }
            continue;
        }
        for (const g of allGoals().filter(g => g.a.id === a.id)) {
            if (a.kind === 'build') {
                for (const e of S.entries) {
                    if (e.date > nowDay() || lv114HasPause(a,e.date) || (a.removedAt && e.date>=a.removedAt.slice(0,10)) || a.archivedAt?.slice(0, 10) <= e.date || e.ruleId && e.ruleId !== g.r.id || e.activityId !== a.id)
                        continue;
                    if (!e.ruleId && (g.index !== 0 || EM.has(entryKey(g, e.date))))
                        continue;
                    const historical = rules(a, e.date).find(x => x.id === g.r.id);
                    if (!historical)
                        continue;
                    for (const k of metricKeys(historical))
                        if (metricOwner(g, k, e.date) && finite(e[k]) && e.source !== 'auto' && e.source !== 'refused') {
                            const event = eventFor(g, e.date, 'level', k, e[k], rateBundles(a, e.date));
                            if (event)
                                ev.push(event);
                        }
                }
            }
            else {
                for (const p of periods(g)) {
                    if (p.end > nowDay() || lv114PeriodProtected(g,p) || (a.removedAt && p.end > a.removedAt.slice(0,10)) || a.archivedAt && p.end > a.archivedAt.slice(0, 10))
                        continue;
                    const assess = assessment(g, p), historical = p.rule || g.r;
                    if (!assess.complete || assess.hasEstimated)
                        continue;
                    for (const k of metricKeys(historical))
                        if (metricOwner(g, k, p.start)) {
                            const amount = Math.max(0, ruleValue(historical, k) - assess.totals[k]);
                            const event = eventFor(g, dayAdd(p.end, -1), 'save', k, amount, rateBundles(a, p.start));
                            if (event)
                                ev.push(event);
                        }
                }
            }
        }
    }
    return ev.sort((x, y) => x.day.localeCompare(y.day) || x.goal.localeCompare(y.goal));
}

function skillXp(id) { let total = 0; for (const e of xpEvents())
    for (const a of e.allocations || [])
        if (effectiveFate(a.skillId) === id)
            total += a.amount; return total; }

function xpStats() { const events = xpEvents(); let sum = 0, save = 0, level = 0, barSave = 0, barLevel = 0; for (const e of events) {
    sum += e.xp;
    if (e.kind === 'save')
        save += e.xp;
    else
        level += e.xp;
} const levelN = 1 + Math.floor((sum + 1e-7) / 1000), from = (levelN - 1) * 1000; let cursor = 0; for (const e of events) {
    const amount = Math.max(0, Math.min(sum, cursor + e.xp) - Math.max(from, cursor));
    if (e.kind === 'save')
        barSave += amount;
    else
        barLevel += amount;
    cursor += e.xp;
} return { sum, save, level, barSave, barLevel, progress: Math.max(0, sum - from), levelN, events }; }

function unknownFields(g) { const v = { mode: 'refused', status: 'no', source: 'unknown', estimated: false }; for (const k of metricKeys(g.r))
    v[k] = null; return v; }

function recordedConsumption(g, d) { const e = entry(g, d); return !!e && e.source !== 'unknown' && e.source !== 'auto' && e.source !== 'refused' && metricKeys(g.r).some(k => finite(e[k]) && e[k] > 0); }

function checkinItems() { const d = dayAdd(nowDay(), -1); return goals(d).filter(g => !isOnce(g.a) && !lv114HasPause(g.a,d) && g.a.kind === 'reduce' && !recordedConsumption(g, d) && !['zero-confirmed', 'unknown'].includes(entry(g, d)?.source)).map(g => ({ g, d })); }

function assessment(g, p) {
    const a = g.a, r = p.rule || rules(a, p.start).find(x => x.id === g.r.id) || g.r, keys = metricKeys(r);
    const totals = { minutes: 0, count: 0 };
    let complete = true, hasEstimated = false, hasUnknown = false;
    const effectiveStart = (a.createdAt || S.started || p.start).slice(0, 10);
    for (const d of allDays(effectiveStart > p.start ? effectiveStart : p.start, p.end < dayAdd(nowDay(), 1) ? p.end : dayAdd(nowDay(), 1))) {
        const e = entry(g, d);
        if (!e) {
            if (a.kind === 'reduce')
                complete = false;
            continue;
        } // No Leveln booking is always 0; no invented entry is needed.
        if (['auto', 'refused', 'unknown'].includes(e.source)) {
            hasUnknown = true;
            hasEstimated = true;
            complete = false;
            continue;
        }
        for (const k of keys) {
            if (!finite(e[k])) {
                complete = false;
                hasUnknown = true;
            }
            else
                totals[k] += e[k];
        }
    }
    const finished = p.end <= nowDay();
    let state = 'pending';
    if (a.kind === 'reduce') {
        if (hasUnknown || keys.some(k => totals[k] > ruleValue(r, k) + 1e-9))
            state = 'fail';
        else if (finished && complete)
            state = 'success';
    }
    else if (keys.every(k => totals[k] + 1e-9 >= ruleValue(r, k)))
        state = 'success';
    else if (finished && complete)
        state = 'fail';
    if (r.period === 'day') {
        const e = entry(g, p.start);
        if (!e)
            state = a.kind === 'build' && finished ? 'fail' : 'pending';
        else if (e.source === 'legacy' && !finite(e.minutes) && !finite(e.count))
            state = e.status === 'yes' ? 'success' : e.status === 'no' ? 'fail' : 'pending';
        else if (a.kind === 'reduce' && hasUnknown)
            state = 'fail';
        else if (!complete && e.mode === 'up' && !keys.length)
            state = 'success';
    }
    return { state, totals, complete, hasEstimated, hasUnknown, finished };
}

async function reconcile() {
    // Yesterday's missing training is zero. Missing Mana stays open for a next-day check-in;
    // older unknown usage is recorded as unknown, never as an estimated number.
    const cutoff = dayAdd(nowDay(), -1), fresh = [];
    if (S.started) {
        for (let d = S.started, i = 0; d <= cutoff && i < 3650; d = dayAdd(d, 1), i++) {
            for (const g of goals(d).filter(x => !isOnce(x.a) && !lv114HasPause(x.a,d))) {
                if (entry(g, d) || g.a.kind === 'reduce' && d === cutoff)
                    continue;
                const fields = g.a.kind === 'reduce' ? unknownFields(g) : { mode: 'down', status: 'no', source: 'zero-auto', estimated: false, ...Object.fromEntries(metricKeys(g.r).map(k => [k, 0])) };
                fresh.push(makeEntry(g, d, fields));
            }
        }
    }
    if (fresh.length) {
        await dbTx(['entries'], t => fresh.forEach(e => t.objectStore('entries').put(e)));
        await sync();
    }
    await reconcileWallet();
}

function manaInPeriod(g) {
    if (g.a.kind !== 'reduce')
        return null;
    const p = currentPeriod(g, S.day);
    if (!p)
        return null;
    const used = { minutes: 0, count: 0 };
    let unknown = false;
    for (const d of allDays(p.start, dayAdd(S.day, 1))) {
        const e = entry(g, d);
        if (e && ['auto', 'refused', 'unknown'].includes(e.source))
            unknown = true;
        else if (e)
            for (const k of metricKeys(g.r)) {
                if (finite(e[k]))
                    used[k] += e[k];
                else
                    unknown = true;
            }
    }
    return { p, used, unknown };
}
