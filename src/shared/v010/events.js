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
  const drag=e.target.closest('.lv10-mini-card');
  if(drag&&!e.target.closest('input,label,button')){
    e.preventDefault();e.stopPropagation();
    lv10Dragging={id:e.pointerId,row:drag};
    drag.setPointerCapture?.(e.pointerId);
    drag.classList.add('lv10-dragging');
  }
},{capture:true});

document.addEventListener('pointermove',e=>{
  if(lv10Dragging&&e.pointerId===lv10Dragging.id){
    e.preventDefault();
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.lv10-mini-card');
    const row=lv10Dragging.row;
    if(target&&row&&target!==row){
      const list=target.parentElement;
      const before=e.clientY<target.getBoundingClientRect().top+target.offsetHeight/2||(Math.abs(e.clientY-target.getBoundingClientRect().top-target.offsetHeight/2)<target.offsetHeight*.35&&e.clientX<target.getBoundingClientRect().left+target.offsetWidth/2);
      list.insertBefore(row,before?target:target.nextSibling);
    }
    e.stopPropagation();return;
  }
  if(gesture&&gesture.id===e.pointerId){
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    if(dy>83&&Math.abs(dx)<75&&!lv10GestureTimer){
      lv10GestureTimer=setTimeout(()=>{
        if(gesture){gesture.el.style.transform='';gesture=null;lv10ManagerOpen();vibrate();}
        lv10GestureTimer=null;
      },540);
    }else if((dy<68||Math.abs(dx)>88)&&lv10GestureTimer){clearTimeout(lv10GestureTimer);lv10GestureTimer=null;}
  }
},{capture:true,passive:false});

document.addEventListener('pointerup',e=>{
  if(lv10GestureTimer){clearTimeout(lv10GestureTimer);lv10GestureTimer=null;}
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
