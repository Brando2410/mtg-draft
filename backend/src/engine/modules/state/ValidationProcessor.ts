import { GameState, GameObject, Zone, PlayerId } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';

/**
 * Rules Engine Module: Legal Target Validation (Chapter 6)
 * Handles Rule 601.2c and 608.2b regarding legal targets and protection.
 */
export class ValidationProcessor {

  /**
   * CR 608.2b: Checks if a target is still legal as a spell or ability attempts to resolve.
   * Also used during the casting process (CR 601.2c).
   */
  public static isLegalTarget(state: GameState, sourceOrId: string | any, targetId: string, abilityTargetDef?: any): boolean {
    const sourceId = typeof sourceOrId === 'string' ? sourceOrId : (sourceOrId as any).sourceId || (sourceOrId as any).id;
    const sourceObjProvided = typeof sourceOrId === 'string' ? null : sourceOrId;

    // 1. If target is a player (e.g., Lightning Bolt to face)
    if (state.players[targetId]) {
        const type = (abilityTargetDef?.type || '').toLowerCase();
        const restrictions = (abilityTargetDef?.restrictions || []).map((r: string) => r.toLowerCase());
        
        if (type === 'player' || type === 'anytarget' || restrictions.includes('player') || restrictions.includes('anytarget')) {
            // Check specific player restrictions (e.g., 'opponent', 'you')
            const sourceControllerId = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId)?.controllerId || 
                                       state.battlefield.find(o => o.id === sourceId)?.controllerId;
            
            if (restrictions.includes('opponent')) {
                if (sourceControllerId && targetId === sourceControllerId) return false;
            }
            if (restrictions.includes('you')) {
                if (sourceControllerId && targetId !== sourceControllerId) return false;
            }
            return true;
        }
        return false; 
    }

    // 2. Locate target object across all possible zones
    let targetObj: any = state.battlefield.find(o => o.id === targetId);
    let targetZone: Zone = Zone.Battlefield;

    if (!targetObj) {
       for (const p of Object.values(state.players) as any[]) {
           targetObj = p.graveyard.find((c: any) => c.id === targetId);
           if (targetObj) { targetZone = Zone.Graveyard; break; }
           targetObj = p.hand.find((c: any) => c.id === targetId);
           if (targetObj) { targetZone = Zone.Hand; break; }
       }
    }

    // 3. Target is on the stack (e.g., Counterspell)
    if (!targetObj) {
        targetObj = state.stack.find(s => s.id === targetId);
        if (targetObj) {
            targetZone = Zone.Stack;
        } else {
            // Target doesn't exist anywhere -> it became illegal/was removed.
            return false;
        }
    }

    // Chapter 702.26b: Phased out check
    if (targetObj.isPhasedOut) return false;

    // Type validation: Permanent vs Player (Rule 608.2b)
    const typeLineCheck = (abilityTargetDef?.type || '').toLowerCase();
    const isPlayerTargetOnly = typeLineCheck === 'player';
    if (isPlayerTargetOnly) return false; // This is a permanent, but we requested a player.

    // Rule 400.7 / 608.2 b: Ensure target is in the correct zone. 
    // If the card changed zones (e.g. died and went to graveyard), it becomes an illegal target
    // for an ability that was targeting it on the battlefield.
    let expectedZone = abilityTargetDef?.zone;
    
    // Auto-infer default zones if the engine logic mapping doesn't explicitly declare it:
    if (!expectedZone) {
        if (targetZone === Zone.Stack) expectedZone = Zone.Stack;
        else expectedZone = Zone.Battlefield; // Default assumption for most MTG targets (creatures, artifacts, etc.)
    }

    // Evaluate zone mismatch
    if (expectedZone !== 'Any' && targetZone !== expectedZone) {
        return false;
    }


    // 1. Get the source characteristics
    // Source can be on the stack, battlefield, or still in hand (during casting validation)
    const sourceStack = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
    const sourceBattlefield = state.battlefield.find(o => o.id === sourceId);
    let source = sourceObjProvided || sourceStack || (sourceBattlefield as any);

    let sourceControllerId = source?.controllerId || (sourceStack as any)?.controllerId;

    // If still not found, check hands (for Rule 601.2c validation)
    if (!sourceControllerId) {
        for (const pId in state.players) {
            const cardInHand = state.players[pId as PlayerId].hand.find(c => c.id === sourceId);
            if (cardInHand) {
                sourceControllerId = pId;
                source = cardInHand;
                break;
            }
        }
    }



    // 2. Check Protection (Rule 702.16)
    // "T" in DEBT: Targeted by spells or abilities with the protected quality.
    const keywords = LayerProcessor.getEffectiveStats(targetObj, state).keywords;
    const protectionKeywords = keywords.filter(k => k.toLowerCase().startsWith('protection from'));


    for (const prot of protectionKeywords) {
      const qualityStr = prot.toLowerCase().replace('protection from ', '');
      const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
      

      if (source && ValidationProcessor.sourceHasQualities(source, qualities)) {

        return false;
      }
    }

    // 3. Check Hexproof (Rule 702.11)
    const hexproofKeywords = keywords.filter(k => k.toLowerCase().startsWith('hexproof'));
    for (const hp of hexproofKeywords) {
      if (hp.toLowerCase() === 'hexproof') {
        if (sourceControllerId && sourceControllerId !== targetObj.controllerId) {
          return false;
        }
      } else if (hp.toLowerCase().startsWith('hexproof from ')) {
        const qualityStr = hp.toLowerCase().replace('hexproof from ', '');
        const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
        if (sourceControllerId && sourceControllerId !== targetObj.controllerId) {
          if (source && ValidationProcessor.sourceHasQualities(source, qualities)) {
            return false;
          }
        }
      }
    }

    // 4. Check Shroud (Rule 702.18)
    if (keywords.includes('Shroud')) {
        return false;
    }


    // 4. Check Type Restrictions (Rule 601.2c)
    // We check both the passed targeting data and potentially the stack ability definition
    const targetDef = abilityTargetDef || sourceStack?.data?.targetDefinition || (sourceStack as any)?.targetDefinition;
    if (targetDef?.restrictions) {
        const restrictions = targetDef.restrictions.map((r: string) => r.toLowerCase());
        const objTypes = (targetObj.definition.types || []).map((t: string) => t.toLowerCase());
        
        const baseTypes = ['creature', 'planeswalker', 'land', 'artifact', 'enchantment'];
        const typeRestrictions = restrictions.filter((r: string) => baseTypes.includes(r));
        
        // Logical OR for basic card types (Rule 608.2b: "Target creature OR planeswalker")
        if (typeRestrictions.length > 0) {
            const matchesType = typeRestrictions.some((r: string) => objTypes.includes(r));
            if (!matchesType) {
                return false;
            }
        }

        // Logical AND for everything else
        if (restrictions.includes('nonland') && objTypes.includes('land')) return false;
        if (restrictions.includes('other') && targetObj.id === sourceId) return false;
        if (restrictions.includes('notcontrolled') || restrictions.includes('opponentcontrol')) {
             if (sourceControllerId && targetObj.controllerId === sourceControllerId) return false;
        }
        if (restrictions.includes('youcontrol') && sourceControllerId && targetObj.controllerId !== sourceControllerId) return false;

        if (restrictions.includes('tapped') && !targetObj.isTapped) return false;
        if (restrictions.includes('untapped') && targetObj.isTapped) return false;

        // CMC / Mana Value restrictions (e.g. "CMC<=3", "CMC>=6")
        const cmcLimit = restrictions.find((r: string) => r.startsWith('cmc'));
        if (cmcLimit) {
            const mv = ManaProcessor.getManaValue(targetObj.definition.manaCost || '');
            const opMatch = cmcLimit.match(/(<=|>=|<|>|==|=)(\d+)/);
            if (opMatch) {
                const op = opMatch[1];
                const val = parseInt(opMatch[2]);
                let isCmcValid = true;
                if (op === '<=' && !(mv <= val)) isCmcValid = false;
                if (op === '>=' && !(mv >= val)) isCmcValid = false;
                if (op === '<' && !(mv < val)) isCmcValid = false;
                if (op === '>' && !(mv > val)) isCmcValid = false;
                if ((op === '==' || op === '=') && !(mv === val)) isCmcValid = false;
                
                if (!isCmcValid) {
                    return false;
                }
            }
        }

        if (restrictions.includes('power_')) {
            const pLimit = restrictions.find((r: string) => r.startsWith('power_'));
            if (pLimit) {
                const limit = parseInt(pLimit.split('_')[1]);
                const stats = LayerProcessor.getEffectiveStats(targetObj, state);
                if (stats.power > limit) return false;
            }
        }

        if (restrictions.includes('toughness_')) {
            const tLimit = restrictions.find((r: string) => r.startsWith('toughness_'));
            if (tLimit) {
                const limit = parseInt(tLimit.split('_')[1]);
                const stats = LayerProcessor.getEffectiveStats(targetObj, state);
                if (stats.toughness > limit) return false;
            }
        }

        if (restrictions.includes('attackingorblocking')) {
            const isAttacking = (state.combat?.attackers || []).some(a => a.attackerId === targetId);
            const isBlocking = (state.combat?.blockers || []).some(b => b.blockerId === targetId);
            if (!isAttacking && !isBlocking) return false;
        }
    }

    return true;
  }

  /**
   * CR 702.16n: A creature with protection from [quality] can’t be blocked by creatures with [quality].
   */
  public static isLegalBlocker(state: GameState, blockerId: string, attackerId: string): boolean {
    const blocker = state.battlefield.find(o => o.id === blockerId);
    const attacker = state.battlefield.find(o => o.id === attackerId);
    if (!blocker || !attacker) return true;

    const bStats = LayerProcessor.getEffectiveStats(blocker, state);
    const aStats = LayerProcessor.getEffectiveStats(attacker, state);

    // 1. CR 702.9: Flying check
    // "A creature with flying can't be blocked except by creatures with flying and/or reach."
    if (aStats.keywords.includes('Flying')) {
        if (!bStats.keywords.includes('Flying') && !bStats.keywords.includes('Reach')) {
            return false;
        }
    }

    // 2. Protection check (Blocking) (Rule 702.16)
    const protectionKeywords = aStats.keywords.filter(k => k.toLowerCase().startsWith('protection from'));

    for (const prot of protectionKeywords) {
      const qualityStr = prot.toLowerCase().replace('protection from ', '');
      const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
      if (this.sourceHasQualities(blocker, qualities)) {
        return false;
      }
    }

    return true;
  }

  /**
   * CR 702.110: Menace check and other multi-creature requirements.
   */
  public static validateAllBlockers(state: GameState): { isValid: boolean, error?: string } {
    if (!state.combat) return { isValid: true };
    
    for (const attackerDef of state.combat.attackers) {
      const attacker = state.battlefield.find(o => o.id === attackerDef.attackerId);
      if (!attacker) continue;
      
      const aStats = LayerProcessor.getEffectiveStats(attacker, state);
      const blockers = state.combat.blockers.filter(b => b.attackerId === attackerDef.attackerId);
      
      // Menace: cannot be blocked by exactly one creature
      if (aStats.keywords.includes('Menace') && blockers.length === 1) {
          return { isValid: false, error: `${attacker.definition.name} ha Menace e deve essere bloccata da almeno due creature.` };
      }
    }
    
    return { isValid: true };
  }

  /**
   * CR 702.16e: Damage that would be dealt by sources with that quality is prevented.
   */
  public static shouldPreventDamage(state: GameState, sourceId: string, targetId: string): boolean {
    const targetObj = state.battlefield.find(o => o.id === targetId);
    if (!targetObj) return false;

    const sourceStack = state.stack.find(s => s.id === sourceId);
    const sourceBattlefield = state.battlefield.find(o => o.id === sourceId);
    const source = sourceStack || (sourceBattlefield as any);
    if (!source) return false;

    const keywords = LayerProcessor.getEffectiveStats(targetObj, state).keywords;
    const protectionKeywords = keywords.filter(k => k.toLowerCase().startsWith('protection from'));

    for (const prot of protectionKeywords) {
      const qualityStr = prot.toLowerCase().replace('protection from ', '');
      const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
      if (this.sourceHasQualities(source, qualities)) {
        return true;
      }
    }
    return false;
  }

  private static sourceHasQualities(source: any, qualities: string[]): boolean {
    const s = source.card || source; 
    let definition = s.definition || s;

    const sourceTypes = (definition.types || []).map((t: string) => t.toLowerCase());
    const sourceSubtypes = (definition.subtypes || []).map((t: string) => t.toLowerCase());
    
    // Core color logic: property check + mana cost deduction fallback
    let sourceColors = (Array.isArray(definition.colors) ? definition.colors : [])
        .map((c: string) => ValidationProcessor.colorMap(c));

    // Fallback: Deduce colors from mana cost string (e.g. {1}{B} -> black)
    const manaCost = (definition.manaCost || definition.mana_cost || '').toUpperCase();
    if (manaCost.includes('W') && !sourceColors.includes('white')) sourceColors.push('white');
    if (manaCost.includes('U') && !sourceColors.includes('blue')) sourceColors.push('blue');
    if (manaCost.includes('B') && !sourceColors.includes('black')) sourceColors.push('black');
    if (manaCost.includes('R') && !sourceColors.includes('red')) sourceColors.push('red');
    if (manaCost.includes('G') && !sourceColors.includes('green')) sourceColors.push('green');

    return qualities.some(q => {
        const lowerQ = q.toLowerCase();
        if (lowerQ === 'and' || lowerQ === 'from') return false; 
        
        if (lowerQ === 'multicolored') return sourceColors.length > 1;

        const singularQ = lowerQ.endsWith('s') ? lowerQ.slice(0, -1) : lowerQ;

        const matchesType = sourceTypes.includes(lowerQ) || sourceTypes.includes(singularQ);
        const matchesSubtype = sourceSubtypes.includes(lowerQ) || sourceSubtypes.includes(singularQ);
        const matchesColor = sourceColors.includes(lowerQ) || sourceColors.includes(singularQ);

        return matchesType || matchesSubtype || matchesColor;
    });
  }

  private static colorMap(c: string): string {
    const map: Record<string, string> = { 'w': 'white', 'u': 'blue', 'b': 'black', 'r': 'red', 'g': 'green' };
    return map[c.toLowerCase()] || c.toLowerCase();
  }
}
