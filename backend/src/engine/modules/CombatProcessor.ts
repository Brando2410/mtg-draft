import { GameState, Step, Phase, PlayerId, GameObjectId, GameObject } from '@shared/engine_types';
import { LayerProcessor } from './LayerProcessor';

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
        // Should jump to End of Combat if possible, but for simplicity let's stay in sequence
        return;
      }
      // 509.1: Defending player chooses blockers
      const defenderId = Object.keys(state.players).find(id => id !== state.activePlayerId);
      if (defenderId) {
        state.pendingAction = {
          type: 'DECLARE_BLOCKERS',
          playerId: defenderId
        };
        state.priorityPlayerId = null;
      }
    }
    else if (state.currentStep === Step.CombatDamage) {
      this.resolveDamage(state, log);
    }
  }

  public static resolveDamage(state: GameState, log: (m: string) => void) {
    if (!state.combat) return;
    
    for (const attack of state.combat.attackers) {
      const attacker = state.battlefield.find(c => c.id === attack.attackerId);
      if (!attacker) continue;

      const aPower = CombatProcessor.getEffectivePower(attacker);
      CombatProcessor.logDamageFlow(log, attacker, aPower, attack);

      const blockers = state.combat.blockers.filter(b => b.attackerId === attack.attackerId);
      
      if (blockers.length === 0) {
        // UNBLOCKED: Damage to Player (510.1c)
        const targetId = attack.targetId as string;
        const targetPlayer = state.players[targetId];
        
        if (targetPlayer) {
          const oldLife = targetPlayer.life;
          targetPlayer.life -= aPower;
          log(`[HIT] ${attacker.definition.name} deals ${aPower} damage to ${targetPlayer.name} (${oldLife} -> ${targetPlayer.life})`);
        } else {
          log(`[ERR] Player damage target not found: ${targetId}`);
        }
      }
 else {
        // BLOCKED: Damage to Creature (510.1)
        const blockerObj = state.battlefield.find(c => c.id === blockers[0].blockerId);
        if (blockerObj) {
          const bPower = this.getEffectivePower(blockerObj);
          
          blockerObj.damageMarked += aPower;
          attacker.damageMarked += bPower;
          
          log(`${attacker.definition.name} is BLOCKED by ${blockerObj.definition.name}.`);
          log(`Result: ${attacker.definition.name} deals ${aPower} to ${blockerObj.definition.name}, receives ${bPower} back.`);
        }
      }
    }

    // Reset combat state after damage
    state.combat = undefined;
  }

  private static getEffectivePower(card: GameObject): number {
    return LayerProcessor.getEffectivePower(card);
  }

  private static logDamageFlow(log: (m: string) => void, attacker: any, power: number, attack: any) {
     if (power <= 0) {
        log(`[DAM] ${attacker.definition.name} attacks but has 0 or less power. No damage dealt.`);
     }
  }
}
