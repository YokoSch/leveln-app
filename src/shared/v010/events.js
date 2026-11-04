/*
 * LEVELN 0.10 · src/shared/v010/events.js
 * V0.10 Pointer- und Eingabehandler; nach allen Funktionsmodulen laden
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

document.addEventListener('pointerdown',e=>{
  const step=e.target.closest('.lv10-step');
  if(step){
    if(step.disabled)return;
    e.preventDefault();e.stopPropagation();
    const h={button:step,key:step.dataset.goal,metric:step.dataset.metric,direction:Number(step.dataset.direction),start:performance.now(),timer:0};
    if(lv10Hold)lv10HoldStop();
    lv10Hold=h;lv10StepAmount(h,1);
    h.timer=setTimeout(lv10HoldTick,440);
    step.setPointerCapture?.(e.pointerId);
    return;
  }
  const drag=e.target.closest('.lv10-mini-card,.lv10-manager-list-row');
  if(drag&&!e.target.closest('input,label,button')){
    e.preventDefault();e.stopPropagation();
    const rect=drag.getBoundingClientRect();
    const ghost=drag.cloneNode(true);
    ghost.classList.add('lv113-drag-ghost');
    ghost.style.cssText=`position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;pointer-events:none;z-index:9999;opacity:.96;transform:scale(1.04);`;
    document.body.append(ghost);
    const group=drag.classList.contains('lv10-mini-card')?'minis':'list';
    lv10Dragging={id:e.pointerId,row:drag,group,ghost,rect,x:e.clientX,y:e.clientY};
    drag.classList.add('lv10-dragging','lv113-placeholder');
    drag.setPointerCapture?.(e.pointerId);
  }
},{capture:true});

document.addEventListener('pointermove',e=>{
  if(lv10Dragging&&e.pointerId===lv10Dragging.id){
    e.preventDefault();
    const h=lv10Dragging;
    h.ghost.style.transform=`translate(${e.clientX-h.x}px,${e.clientY-h.y}px) scale(1.04)`;
    const cls=h.group==='minis'?'.lv10-mini-card':'.lv10-manager-list-row';
    const candidate=document.elementFromPoint(e.clientX,e.clientY)?.closest(cls);
    const target=candidate&&candidate!==h.row?candidate:null;
    if(target&&target.parentElement===h.row.parentElement){
      const peer=h.group==='minis'?'.lv10-manager-list':'.lv10-manager-minis';
      const oldPeers=[...$('#deckManagerRoot').querySelector(peer).children].map(el=>({el,r:el.getBoundingClientRect()}));
      const beforeRect=[...h.row.parentElement.children].map(el=>({el,r:el.getBoundingClientRect()}));
      const r=target.getBoundingClientRect();
      const before=h.group==='list'?e.clientY<r.top+r.height/2:
        e.clientY<r.top+r.height*.38 || (e.clientY<r.bottom&&e.clientX<r.left+r.width/2);
      target.parentElement.insertBefore(h.row,before?target:target.nextSibling);
      lv113SyncDeckViews(h.group==='list'?'list':'minis');
      for(const {el,r:old} of [...beforeRect,...oldPeers]){
        if(el===h.row)continue;
        const now=el.getBoundingClientRect(),dx=old.left-now.left,dy=old.top-now.top;
        if((dx||dy)&&el.animate)el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:170,easing:'ease-out'});
      }
    }
    e.stopPropagation();return;
  }
  if(gesture&&gesture.id===e.pointerId){
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    if(dy>83&&Math.abs(dx)<75&&!lv10GestureTimer){
      gesture.el.classList.add('lv114-holding');
      lv10GestureTimer=setTimeout(()=>{
        if(gesture){gesture.el.style.transform='';gesture.el.classList.remove('lv114-holding');gesture=null;lv10ManagerOpen();vibrate();}
        lv10GestureTimer=null;
      },2000);
    }else if((dy<68||Math.abs(dx)>88)&&lv10GestureTimer){clearTimeout(lv10GestureTimer);lv10GestureTimer=null;gesture?.el.classList.remove('lv114-holding');}
  }
},{capture:true,passive:false});

document.addEventListener('pointerup',e=>{
  if(lv10GestureTimer){clearTimeout(lv10GestureTimer);lv10GestureTimer=null;gesture?.el.classList.remove('lv114-holding');}
  if(lv10Hold){e.stopPropagation();lv10HoldStop();}
  if(lv10Dragging&&e.pointerId===lv10Dragging.id){
    e.preventDefault();e.stopPropagation();lv10DragSave();
  }
},{capture:true});

document.addEventListener('pointercancel',()=>{
  clearTimeout(lv10GestureTimer);lv10GestureTimer=null;
  if(lv10Hold)lv10HoldStop();
  if(lv10Dragging)lv10DragSave();
},{capture:true});

document.addEventListener('change',e=>{
  const el=e.target;
  if(el.id==='statSkill'){S.statSkill=el.value;render();}
  if(el.classList.contains('lv10-card-visible'))lv10ToggleCard(el.dataset.id,el.checked).catch(showError);
});

window.addEventListener('pageshow',()=>{if(S.meta?.length)applyTheme();});
