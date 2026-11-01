/*
 * LEVELN 0.10 · pages/charakter/page.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

async function saveSkill(form){
  const original=skillById(S.modal.id),skill=original?structuredClone(original):{id:uid(),createdAt:new Date().toISOString()};
  skill.name=form.elements.name.value.trim();if(!skill.name)throw Error('Bitte Skillnamen angeben.');
  skill.description=form.elements.description.value.slice(0,350);
  skill.color=hex(form.elements.color.value,profile().color);
  skill.icon=form.elements.icon.value;skill.updatedAt=new Date().toISOString();
  if(!original)skill.statisticColor=lv10NewStatColor(skill.color,null,true);
  await dbPut('skills',skill);S.modal=null;await sync();render();toast('Skill gespeichert');
}
