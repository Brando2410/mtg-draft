import { GameState, Step, Phase, PlayerId, GameObjectId, GameObject } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { DamageProcessor } from '../combat/DamageProcessor';
import { TriggerProcessor } from '../effects/TriggerProcessor';

export interface CombatCallbacks {
    log: (m: string) => void;
    getPlayerName: (id: PlayerId) => string;
    resetPriorityToActivePlayer: () => void;
}

/**
 * Combat Mechanism (Chapter 506-511)
 */
export class CombatProcessor {

  public static initializeCombat(state: GameState) {
    state.combat = {
      attackers: [],
      blockers: []
    };
  }

  public static handleStepEntry(state: GameState, log: (m: string) => void) {
    if (state.currentStep === Step.BeginningOfCombat) {
      this.initializeCombat(state);
    } 
    else if (state.currentStep === Step.DeclareAttackers) {
      // 508.1: Active player chooses attackers
      state.pendingAction = {
        type: 'DECLARE_ATTACKERS',
        playerId: state.activePlayerId
      };
      state.priorityPlayerId = null; // No priority while choosing
    }
    else if (state.currentStep === Step.DeclareBlockers) {
      if (!state.combat?.attackers || state.combat.attackers.length === 0) {
        log("No attackers declared. Skipping to End of Combat.");
        return;
      }

      const defenderId = Object.keys(state.players).find(id => id !== state.activePlayerId);
      if (defenderId) {
        state.pendingAction = {
          type: 'DECLARE_BLOCKERS',
          playerId: defenderId
        };
        state.priorityPlayerId = null;
      }
    }
    else if (state.currentStep === Step.CombatDamage || state.currentStep === Step.FirstStrikeDamage) {
      this.resolveDamage(state, log);
    }
    else if (state.currentStep === Step.EndOfCombat) {
      // Rule 511.3: Creatures stop being attacking/blocking when End of Combat starts
      state.combat = undefined;
    }
  }

  public static hasFirstStrikeStep(state: GameState): boolean {
    const attackers = (state.combat?.attackers || []).map(a => state.battlefield.find(o => o.id === a.attackerId)) || [];
    const blockers = (state.combat?.blockers || []).map(b => state.battlefield.find(o => o.id === b.blockerId)) || [];
    
    return [...attackers, ...blockers].some(obj => {
        if (!obj) return false;
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        return stats.keywords.includes('First Strike') || stats.keywords.includes('Double Strike');
    });
  }

  /**
   * CR 508.2: Confirming the Attacker Declaration Action
   */
  public static confirmAttackers(state: GameState, playerId: PlayerId, callbacks: CombatCallbacks) {
    if (state.pendingAction?.type !== 'DECLARE_ATTACKERS' || state.pendingAction.playerId !== playerId) return;
    
    callbacks.log(`${callbacks.getPlayerName(playerId)} confirmed attackers.`);
    
    const attackers = state.combat?.attackers || [];
    state.turnState.creaturesAttackedThisTurn += attackers.length;

    // Rule 508.1: "Whenever an opponent attacks..." (Mangara support)
    if (attackers.length > 0) {
        TriggerProcessor.onEvent(state, {
            type: 'ON_ATTACKERS_DECLARED',
            playerId: playerId,
            data: { attackers }
        }, (m: string) => callbacks.log(m));
    }

    state.pendingAction = undefined;
    callbacks.resetPriorityToActivePlayer();
  }

  /**
   * CR 509.2: Confirming the Blocker Declaration Action
   */
  public static confirmBlockers(state: GameState, playerId: PlayerId, callbacks: CombatCallbacks) {
    if (state.pendingAction?.type !== 'DECLARE_BLOCKERS' || state.pendingAction.playerId !== playerId) return;
    
    // CR 509.1: Validate global block requirements (e.g. Menace)
    const validation = this.validateAllBlockers(state);
    if (!validation.isValid) {
        callbacks.log(`[BLOCK] ERR: ${validation.error}`);
        // Keep in block declaration mode until fixed
        return;
    }

    callbacks.log(`${callbacks.getPlayerName(playerId)} confirmed blockers.`);
    state.pendingAction = undefined;
    
    // CR 509.2 / 509.3: If multiple blockers/attackers are involved, we need damage assignment order first.
    if (this.needsOrdering(state)) {
        this.setupNextOrderingAction(state, (m) => callbacks.log(m));
    } else {
        // CR 509.4: Give priority window in Declare Blockers step.
        callbacks.resetPriorityToActivePlayer();
    }
  }

  /**
   * CR 509.2 / 509.3: Check if any multi-creature combat requires ordering
   */
  public static needsOrdering(state: GameState): boolean {
    if (!state.combat) return false;

    // Check attackers blocked by > 1 creature
    for (const attacker of state.combat.attackers) {
        const blockerCount = state.combat.blockers.filter(b => b.attackerId === attacker.attackerId).length;
        if (blockerCount > 1 && (!attacker.order || attacker.order.length < blockerCount)) {
            return true;
        }
    }

    // Check blockers blocking > 1 attacker
    const blockerGroups: Record<GameObjectId, GameObjectId[]> = {};
    state.combat.blockers.forEach(b => {
        if (!blockerGroups[b.blockerId]) blockerGroups[b.blockerId] = [];
        blockerGroups[b.blockerId].push(b.attackerId);
    });

    for (const [blockerId, attackers] of Object.entries(blockerGroups)) {
        if (attackers.length > 1) {
            const bRef = state.combat.blockers.find(b => b.blockerId === blockerId);
            if (bRef && (!bRef.order || bRef.order.length < attackers.length)) {
                return true;
            }
        }
    }

    return false;
  }

  public static setupNextOrderingAction(state: GameState, log: (m: string) => void) {
    if (!state.combat) return;

    // 1. Active Player orders blockers (Rule 509.2)
    for (const attacker of state.combat.attackers) {
        const blockers = state.combat.blockers.filter(b => b.attackerId === attacker.attackerId);
        if (blockers.length > 1 && (!attacker.order || attacker.order.length < blockers.length)) {
            state.pendingAction = {
                type: 'ORDER_BLOCKERS',
                playerId: state.activePlayerId,
                sourceId: attacker.attackerId,
                data: { ids: blockers.map(b => b.blockerId) }
            };
            log(`[FLOW] ${state.players[state.activePlayerId].name} must order blockers for ${state.battlefield.find(o => o.id === attacker.attackerId)?.definition.name}.`);
            return;
        }
    }

    // 2. Defending Player orders attackers (Rule 509.3)
    const defenderId = Object.keys(state.players).find(id => id !== state.activePlayerId)!;
    const blockerGroups: Record<GameObjectId, GameObjectId[]> = {};
    state.combat.blockers.forEach(b => {
        if (!blockerGroups[b.blockerId]) blockerGroups[b.blockerId] = [];
        blockerGroups[b.blockerId].push(b.attackerId);
    });

    for (const [blockerId, attackers] of Object.entries(blockerGroups)) {
        if (attackers.length > 1) {
            const bRef = state.combat.blockers.find(b => b.blockerId === blockerId);
            if (bRef && (!bRef.order || bRef.order.length < attackers.length)) {
                state.pendingAction = {
                    type: 'ORDER_ATTACKERS',
                    playerId: defenderId,
                    sourceId: blockerId,
                    data: { ids: attackers }
                };
                log(`[FLOW] ${state.players[defenderId].name} must order attackers for ${state.battlefield.find(o => o.id === blockerId)?.definition.name}.`);
                return;
            }
        }
    }
  }

  public static resolveDamage(state: GameState, log: (m: string) => void) {
    if (!state.combat) return;
    
    // CR 511.1: First Strike / Double Strike Step Filtering
    const isFirstStrikeStep = state.currentStep === Step.FirstStrikeDamage;
    const assignments: { sourceId: string, targetId: string, amount: number }[] = [];

    // 1. Assign Attacker Damage (Rule 510.1c)
    this.assignAttackerDamage(state, isFirstStrikeStep, assignments, log);

    // 2. Assign Blocker Damage (Rule 510.1d)
    this.assignBlockerDamage(state, isFirstStrikeStep, assignments, log);

    // 3. APPLY ALL DAMAGE SIMULTANEOUSLY (Rule 510.2)
    // "Damage assigned by all creatures is dealt at the same time."
    for (const a of assignments) {
        DamageProcessor.dealDamage(state, a.sourceId, a.targetId, a.amount, true, log);
    }

    // 4. Trigger State-Based Actions (Rule 704)
    // Critical: If in FS, dead creatures must be removed BEFORE Regular Damage Step
    const { StateBasedActionsProcessor } = require('./../state/StateBasedActionsProcessor');
    StateBasedActionsProcessor.resolveSBAs(state, log);
  }

  private static assignAttackerDamage(state: GameState, isFS: boolean, assignments: { sourceId: string, targetId: string, amount: number }[], log: (m: string) => void) {
    if (!state.combat) return;

    for (const attack of state.combat.attackers) {
      const attacker = state.battlefield.find(c => c.id === attack.attackerId);
      if (!attacker) continue;

      const aStats = LayerProcessor.getEffectiveStats(attacker, state);
      
      // Filter for First Strike compatibility (Rule 511.1)
      const hasFS = aStats.keywords.includes('First Strike');
      const hasDS = aStats.keywords.includes('Double Strike');
      if (isFS && !hasFS && !hasDS) continue;
      if (!isFS && this.hasFirstStrikeStep(state) && hasFS && !hasDS) continue;

      const aPower = aStats.power;
      if (aPower <= 0) continue;

      const blockers = state.combat.blockers.filter(b => b.attackerId === attack.attackerId);
      
      if (blockers.length === 0) {
        // UNBLOCKED: Rule 510.1c
        assignments.push({ sourceId: attacker.id, targetId: attack.targetId, amount: aPower });
      } else {
        // BLOCKED: Rule 510.1c
        const order = attack.order || blockers.map(b => b.blockerId);
        let remainingPower = aPower;
        const hasDeathtouch = aStats.keywords.includes('Deathtouch');
        const hasTrample = aStats.keywords.includes('Trample');

        for (const bId of order) {
            const blockerObj = state.battlefield.find(c => c.id === bId);
            if (!blockerObj) continue;
            
            const bStats = LayerProcessor.getEffectiveStats(blockerObj, state);
            const lethalAmount = hasDeathtouch ? 1 : Math.max(0, bStats.toughness - blockerObj.damageMarked);
            const damageToAssign = Math.min(remainingPower, lethalAmount);
            
            assignments.push({ sourceId: attacker.id, targetId: blockerObj.id, amount: damageToAssign });
            remainingPower -= damageToAssign;
            if (remainingPower <= 0) break;
        }

        if (hasTrample && remainingPower > 0) {
            assignments.push({ sourceId: attacker.id, targetId: attack.targetId, amount: remainingPower });
        } else if (remainingPower > 0 && order.length > 0) {
            const lastAssignment = assignments.find(a => a.sourceId === attacker.id && a.targetId === order[order.length - 1]);
            if (lastAssignment) lastAssignment.amount += remainingPower;
        }
      }
    }
  }

  private static assignBlockerDamage(state: GameState, isFS: boolean, assignments: { sourceId: string, targetId: string, amount: number }[], log: (m: string) => void) {
    if (!state.combat) return;

    for (const b of state.combat.blockers) {
        const blockerObj = state.battlefield.find(c => c.id === b.blockerId);
        if (!blockerObj) continue;

        const bStats = LayerProcessor.getEffectiveStats(blockerObj, state);
        const hasFS = bStats.keywords.includes('First Strike');
        const hasDS = bStats.keywords.includes('Double Strike');
        if (isFS && !hasFS && !hasDS) continue;
        if (!isFS && this.hasFirstStrikeStep(state) && hasFS && !hasDS) continue;

        const bPower = bStats.power;
        if (bPower <= 0) continue;

        const blockedAttackers = state.combat.blockers.filter(ab => ab.blockerId === b.blockerId);
        if (blockedAttackers.length === 1) {
            assignments.push({ sourceId: blockerObj.id, targetId: blockedAttackers[0].attackerId, amount: bPower });
        } else {
            const order = b.order || blockedAttackers.map(a => a.attackerId);
            let remainingPower = bPower;
            const hasDeathtouch = bStats.keywords.includes('Deathtouch');

            for (const aId of order) {
                const attackerObj = state.battlefield.find(c => c.id === aId);
                if (!attackerObj) continue;
                const aStats = LayerProcessor.getEffectiveStats(attackerObj, state);
                const lethalAmount = hasDeathtouch ? 1 : Math.max(0, aStats.toughness - attackerObj.damageMarked);
                const damageToAssign = Math.min(remainingPower, lethalAmount);
                assignments.push({ sourceId: blockerObj.id, targetId: attackerObj.id, amount: damageToAssign });
                remainingPower -= damageToAssign;
                if (remainingPower <= 0) break;
            }

            if (remainingPower > 0 && order.length > 0) {
                const last = assignments.find(a => a.sourceId === blockerObj.id && a.targetId === order[order.length - 1]);
                if (last) last.amount += remainingPower;
            }
        }
    }
  }


  /**
   * CR 509.2 / 509.3: Finalize a damage assignment order.
   */
  public static resolveCombatOrdering(state: GameState, playerId: string, order: string[], callbacks: CombatCallbacks): boolean {
    const { PlayerActionProcessor } = require('../actions/PlayerActionProcessor');
    PlayerActionProcessor.resolveCombatOrdering(state, playerId, order, (m: string) => callbacks.log(m));
    
    // Once ordering is complete (and no more pending actions exist), give priority back to AP.
    callbacks.resetPriorityToActivePlayer();
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
    if (protectionKeywords.length > 0) {
        const { TargetingProcessor } = require('./../actions/TargetingProcessor');
        for (const prot of protectionKeywords) {
          const qualityStr = prot.toLowerCase().replace('protection from ', '');
          const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
          if (TargetingProcessor.sourceHasQualities(blocker, qualities)) {
            return false;
          }
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
}
