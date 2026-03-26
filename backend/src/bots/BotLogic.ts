import { Room, Card, Player } from '@shared/types';
import { DraftService } from '../services/DraftService';
import { LoggerService } from '../services/LoggerService';

export class BotLogic {
   /**
    * Triggers draft picks for all bots in the room. This function
    * re-calls itself if any picks were made, ensuring all automated
    * picks are performed sequentially until no more bots can pick.
    */
   static triggerBotPicks(rooms: Map<string, Room>, roomId: string): boolean {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'drafting' || room.isPaused || !room.draftState) return false;

      let anyPickMade = false;
      for (let i = 0; i < room.players.length; i++) {
         const player = room.players[i];
         if (player.isBot) {
            const queue = room.draftState.queues[i];
            if (queue && queue.length > 0) {
               const pack = queue[0];
               if (pack && pack.length > 0) {
                  const bestCard = this.evaluatePack(pack, player);
                  if (DraftService.performPick(rooms, roomId, player.playerId, bestCard.id)) {
                     anyPickMade = true;
                  }
               }
            }
         }
      }

      if (anyPickMade) {
         return this.triggerBotPicks(rooms, roomId);
      }
      return false;
   }

   /**
    * The core logic for bot decision-making. 
    * Evaluates card rarity, color commitment, mana curve, and removal needs.
    * 
    * --- Punteggi e Pesi dell'Algoritmo ---
    * 1. BASE (Rarità):
    *    - Mythic: +45 | Rare: +30 | Uncommon: +15 | Common/Altro: +5
    * 
    * 2. COLOR COMMITMENT (Sinergia Colori & Lock-In):
    *    - Colore Principale: +18
    *    - Colore Secondario: +12
    *    - Incolore (Artefatti/Terre): +5
    *    - FASE DI LOCK-IN (Dopo 6-8 carte IN-COLORE scoperte):
    *      Rarità per le off-color divisa per 8, unita a un -15 netto.
    *      Costringe letteralmente i bot a restare nella loro lane.
    * 
    * 3. REMOVAL PREMIUM (Dinamico e in-colore):
    *    - Inizia a 0 nei primi pick.
    *    - Scala assieme al conteggio delle tue carte *In-Color*. Target: ~20% dei pick giocabili.
    *    - Se sei in deficit e il draft avanza, il peso del pick di un Removal utile sale vertiginosamente.
    *    - Vengono valutati come pesi utili solo Removal On-Color. 
    * 
    * 4. MANA CURVE (Dinamica e In-Color) [Attivo dopo ~5 pick in-color]:
    *    - Misura il deficit o surplus rispetto a proporzioni ideali (1: 10%, 2: 30%, 3: 25%, etc.)
    *    - Calcolata SOLO sulla porzione In-Color del mazzo per non essere falsata dal pattume off-color early draft.
    *    - I deficit (+punteggio) e surplus (-punteggio) sono moltiplicati esponenzialmente in late-draft.
    *    - Limite rigido alla zavorra (Se hai già troppi drop 5/6+ vieni severamente penalizzato per prenderne altri).
    * --------------------------------------
    */
   static evaluatePack(pack: Card[], player: Player): Card {
      if (!pack || pack.length === 0) return null as any;

      const isRemoval = (card: Card) => {
         if (!card.oracle_text) return false;
         const text = card.oracle_text.toLowerCase();
         return text.includes("destroy target") || 
                text.includes("exile target") || 
                text.includes("deals damage to target creature") ||
                /deals \d+ damage to any target/.test(text) ||
                text.includes("target creature gets -") ||
                text.includes("return target creature");
      };

      // 1. Calculate color commitment based on ALL picked cards
      const colorCounts: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
      player.pool.forEach(card => {
         if (card.card_colors && card.card_colors.length > 0) {
            card.card_colors.forEach(c => { if (colorCounts[c] !== undefined) colorCounts[c]++; });
         } else if (card.color && colorCounts[card.color] !== undefined) {
             colorCounts[card.color]++;
         }
      });

      const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      const topColor = sortedColors[0][1] > 2 ? sortedColors[0][0] : null;
      const secondColor = sortedColors[1][1] > 2 ? sortedColors[1][0] : null;

      // Helper for in-color check
      const isCardOnColor = (c: Card) => {
         const colors = c.card_colors || (c.color ? [c.color] : []);
         if (colors.length === 0) return true; // C
         return colors.some(col => col === topColor || col === secondColor);
      };

      // 2. Calculate Curve & Removals EXCLUSIVELY tracking cards in our locked colors
      const curve: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      let inColorPlayables = 0;
      let inColorRemovalCount = 0;

      player.pool.forEach(card => {
         if (isCardOnColor(card)) {
            const cmc = card.cmc || 0;
            if (cmc > 0) {
               const slot = cmc >= 6 ? 6 : Math.floor(cmc);
               curve[slot]++;
               inColorPlayables++;
               if (isRemoval(card)) inColorRemovalCount++;
            }
         }
      });

      const evaluateCardWeight = (card: Card) => {
         let score = 0;

         // 1. RAW RARITY
         const rarityOrder: Record<string, number> = { 'mythic': 45, 'rare': 30, 'uncommon': 15, 'common': 5, 'basic': 0 };
         let rarityScore = rarityOrder[card.rarity?.toLowerCase() || 'common'] || 5;

         // 2. COLOR CHECK & AFFINITY
         const cardColors = card.card_colors || (card.color ? [card.color] : []);
         let isOnColor = false;
         let isStrictlyOffColor = false;
         
         if (cardColors.length === 0) {
            isOnColor = true;
         } else {
            isOnColor = cardColors.some(c => c === topColor || c === secondColor);
            isStrictlyOffColor = !isOnColor;
         }

         const isLockedInPhase = inColorPlayables > 6 && topColor !== null;

         if (isLockedInPhase && isStrictlyOffColor) {
            rarityScore = Math.floor(rarityScore / 8); 
            score -= 15;
         }

         score += rarityScore;

         if (cardColors.length > 0) {
            if (cardColors.includes(topColor!)) score += 18;
            if (cardColors.includes(secondColor!)) score += 12;

            if (cardColors.length > 1 && isLockedInPhase) {
               const perfectFit = cardColors.every(c => c === topColor || c === secondColor);
               if (!perfectFit) score -= 30; 
            }
         } else {
            score += 5;
         }

         // PROGRESSIVE MULTIPLIER (Scale from 0.0 very early to 1.5+ very late)
         const draftProgressMultiplier = Math.min(inColorPlayables / 18, 1.5);

         // 3. REMOVAL PREMIUM (Progressive & Color-bound)
         if (isRemoval(card) && isOnColor) {
            // Un tipico mazzo limited 40 carte richiede tra le 4 e 5 removals su 23 playables (~20%)
            const expectedRemoval = Math.max(1, Math.floor(inColorPlayables * 0.2)); 
            const deficit = expectedRemoval - inColorRemovalCount;
            
            if (deficit > 0) {
               // Più avanza il draft, e maggiore è il deficit, in maniera esponenziale lo brama
               score += (deficit * 12) * draftProgressMultiplier; 
            }
         }

         // 4. MANA CURVE (Progressive & Soft Balancing)
         if (inColorPlayables > 5 && isOnColor) {
            const cmc = card.cmc || 0;
            if (cmc > 0) {
               const slot = cmc >= 6 ? 6 : Math.floor(cmc);
               
               const idealCurveProps = { 1: 0.1, 2: 0.3, 3: 0.25, 4: 0.15, 5: 0.1, 6: 0.1 };
               const currentProp = curve[slot] / Math.max(1, inColorPlayables);
               const idealProp = idealCurveProps[slot as keyof typeof idealCurveProps] || 0;
               
               const diff = idealProp - currentProp; 
               
               if (diff > 0.05) {
                  // Siamo in deficit, diamo un peso positivo proporzionale (Promozione)
                  score += (diff * 40) * draftProgressMultiplier; 
               } else if (diff < -0.10) {
                  // Ne abbiamo abbondanza, applichiamo un soft malus (Penalità)
                  score -= (Math.abs(diff) * 50) * draftProgressMultiplier; 
               }
               
               // Heavy penalty for extreme bloat at 5+ mana
               const maxExpectedHighDrops = Math.max(2, Math.floor(inColorPlayables * 0.2));
               if (slot >= 5 && (curve[5] + curve[6] >= maxExpectedHighDrops)) {
                  score -= 20 * draftProgressMultiplier; 
               }
            }
         }

         return score;
      };

      return [...pack].sort((a, b) => evaluateCardWeight(b) - evaluateCardWeight(a))[0];
   }
}
