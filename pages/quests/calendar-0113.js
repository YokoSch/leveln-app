/* Leveln 0.11.3 – Kalenderdekorationen: Tagesflammen und Zeitraumrahmen.
 * Die Elemente sind reine Präsentation und ändern weder Streaks noch Glut.
 */
'use strict';

function lv113DailyBadge(g,d){
  if(g)return g.r.period==='day'?badgeFor(g,d):'';
  // In der ungefilterten Ansicht sollen die Wochen-Kalenderflammen nicht
  // verschwinden, nur weil keine Quest ausgewählt ist.
  const daily=goals(d).filter(x=>!isOnce(x.a)&&x.r.period==='day');
  const badges=daily.map(x=>badgeFor(x,d)).filter(Boolean);
  if(!badges.length)return '';
  const n=badges.length;
  return `<span class="lv113-daily-summary" title="${n} tägliche Belohnung${n>1?'en':''}">${badges[0]}${n>1?`<small>+${n-1}</small>`:''}</span>`;
}

/** SVG-less CSS frames over grid cells; clipping creates one connected line per week.
 * visibleStart: date of first grid cell; cells: number of visible grid cells.
 * A period is split only at week-grid row boundaries, never into individual
 * glowing boxes. For long periods the flame is positioned once per view. */
function lv113PeriodFrames(g,visibleStart,cells){
  if(!g||isOnce(g.a)||g.r.period==='day')return '';
  const visibleEnd=dayAdd(visibleStart,cells);
  const last=dayAdd(visibleEnd,-1);
  const result=[];
  for(const p of periods(g,last)){
    if(p.end<=visibleStart||p.start>=visibleEnd)continue;
    const from=p.start<visibleStart?visibleStart:p.start;
    const to=p.end>visibleEnd?visibleEnd:p.end;
    const a=dayDiff(visibleStart,from),b=dayDiff(visibleStart,to);
    const v=outcome(g,p),success=v.state==='success';
    const freeze=v.frozen;
    const firstRow=Math.floor(a/7),lastRow=Math.floor((b-1)/7);
    const midpoint=Math.floor((a+b-1)/2);
    for(let row=firstRow;row<=lastRow;row++){
      const first=Math.max(a,row*7),end=Math.min(b,(row+1)*7),col=first-row*7+1;
      const flame=success&&row===Math.floor(midpoint/7);
      const frost=freeze&&!success&&row===Math.floor(midpoint/7);
      result.push(`<div aria-hidden="true" class="lv113-period-frame ${success?'success':'pending'} ${first===a?'edge-start':''} ${end===b?'edge-end':''}" style="grid-column:${col}/span ${end-first};grid-row:${row+1};--lv113-period-color:${goalColor(g)}">
        ${flame?`<span class="lv113-period-flame">${ico('flame')}</span>`:frost?`<span class="lv113-period-flame frost">${ico('snow')}</span>`:''}</div>`);
    }
  }
  return result.length?`<div class="lv113-period-layer" style="--lv113-rows:${Math.ceil(cells/7)}">${result.join('')}</div>`:'';
}
