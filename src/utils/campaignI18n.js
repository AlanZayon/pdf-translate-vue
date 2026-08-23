/** Localized section detection for campaign markdown (en, pt, es, fr, de, it, ja, ko, zh, ru). */

export const SESSION_HEADING =
  /^(?:session|sessão|sessao|sesión|sesion|séance|seance|sitzung|abenteuer|sessione|セッション|세션|сессия|回合|会话)\s*#?\s*(\d+)|^(?:第)\s*(\d+)|^(?:제)\s*(\d+)/i;

export const SESSION_COUNT =
  /(?:session|sessão|sessao|sesión|sesion|séance|seance|sitzung|abenteuer|sessione|セッション|세션|сессия|回合|会话)\s*#?\s*(\d+)|第\s*(\d+)|제\s*(\d+)/gi;

export const OVERVIEW_HEADING =
  /overview|visão geral|visao geral|sinopse|resumo|visión general|vision general|sinopsis|aperçu|apercu|synopsis|überblick|uberblick|zusammenfassung|panoramica|introduzione|概要|あらすじ|概述|概览|简介|개요|개관|обзор|введение/i;

export const HOOK_HEADING =
  /starting hook|opening hook|gancho inicial|hook inicial|accroche|einstieg|aufhänger|gancio iniziale|導入|도입|开场|钩子|завязка/i;

export const NPC_HEADING =
  /important npcs?|\bnpcs?\b|pnjs? importantes|\bpnjs?\b|personagens|personajes|personnages|wichtige nscs|\bnscs?\b|png importanti|personaggi|重要npc|주요 npc|등장인물|非玩家|角色|キャラクター|персонаж|важные npc|\bнпс\b|\bнип\b/i;

export const ENEMIES_HEADING =
  /enemies|creatures|inimigos|criaturas|enemigos|ennemis|créatures|gegner|kreaturen|nemici|敵|クリーチャー|적과|敌人|生物|враги|существа/i;

export const PUZZLES_HEADING =
  /challenges? and puzzles?|puzzles?|desafios|enigmas|desafíos|défis|énigmes|herausforderungen|rätsel|sfide|enigmi|謎|挑戦|수수께끼|谜题|挑战|загадки|испытания/i;

export const ENDINGS_HEADING =
  /possible endings|endings|finais|finales|fins possibles|enden|finali|結末|결말|结局|концовки|финалы/i;

export const MAPS_HEADING =
  /maps and locations|mapas e locais|cartes et lieux|karten und orte|mappe e luoghi|地図|지도와|地图|карты и|mapas\b|cartes\b|karten\b|mappe\b/i;

export const REWARDS_HEADING =
  /rewards?|recompensas?|treasure|tesouro|récompenses|belohnungen|ricompense|報酬|보상|奖励|награды/i;

export const INSPIRED_HEADING =
  /inspired by|inspirado|inspiré|inspiriert|ispirato|インスパイア|영감|灵感|вдохновлено/i;

export const CHECKLIST_HEADING = /checklist|preparação|preparacao|lista de|checkliste|チェック|점검|清单|чеклист/i;

export const KNOWN_SECTION_TITLE =
  /^(overview|visão geral|visao geral|visión general|aperçu|überblick|panoramica|概要|개요|概览|обзор|session|sessão|sessao|sesión|sitzung|sessione|セッション|세션|сессия)\b/i;

export const OBJECTIVES =
  /\*\*(?:session\s+)?(?:objectives?|objetivos?(?:\s+da\s+sessão)?|objectifs?|ziele|obiettivi|目的|목표|目标|цели)[:\s]*\*\*[:\s]*([\s\S]+?)(?=\n#{1,3}\s|\n\*\*(?:session length|duração|durée|dauer)|\n---|\n##|$)/i;

export const ROLE_LINE =
  /\*\*(?:role|papel|rôle|rolle|ruolo|rol|役割|역할|角色|роль):?\*\*:?\s*([^\n]+)/i;

export function sessionNumber(heading) {
  const match = String(heading || '').match(SESSION_HEADING);
  if (!match) return null;
  return parseInt(match[1] || match[2] || match[3], 10);
}
