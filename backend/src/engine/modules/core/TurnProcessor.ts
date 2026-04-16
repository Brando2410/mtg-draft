import { GameState, Phase, PlayerId, Step } from '@shared/engine_types';

/**
 * Handle Turn Architecture (Chapter 5)
 */
export class TurnProcessor {

  public static getNextStep(state: GameState): { phase: Phase, step: Step, turnEnded: boolean } {
    let next = this.calculateNextStep(state.currentPhase, state.currentStep);
    
    // Skip Combat logic moved to PriorityProcessor auto-pass for better UX
    // (We now always enter combat steps so triggers can fire)

    // 2. Skip Declare Blockers if no potential blockers (Rule 509)
    if (next.step === Step.DeclareBlockers) {
      const defenderId = Object.keys(state.players).find(id => id !== state.activePlayerId);
      const attackerCount = (state.combat?.attackers || []).length;
      
      if (attackerCount === 0) {
        // Arena-style skip: jumping directly to Main 2 if no combat intent
        next = { phase: Phase.PostCombatMain, step: Step.Main, turnEnded: false };
      }
      else if (defenderId && !this.hasPotentialBlockers(state, defenderId)) {
        next = { phase: Phase.Combat, step: Step.CombatDamage, turnEnded: false };
      }
    }

    return next;
  }

  public static calculateNextStep(phase: Phase, step: Step): { phase: Phase, step: Step, turnEnded: boolean } {
    // Rule 500: Full sequence order
    const sequence = [
      { phase: Phase.Beginning, step: Step.Untap },
      { phase: Phase.Beginning, step: Step.Upkeep },
      { phase: Phase.Beginning, step: Step.Draw },
      { phase: Phase.PreCombatMain, step: Step.Main },
      { phase: Phase.Combat, step: Step.BeginningOfCombat },
      { phase: Phase.Combat, step: Step.DeclareAttackers },
      { phase: Phase.Combat, step: Step.DeclareBlockers },
      { phase: Phase.Combat, step: Step.FirstStrikeDamage },
      { phase: Phase.Combat, step: Step.CombatDamage },
      { phase: Phase.Combat, step: Step.EndOfCombat },
      { phase: Phase.PostCombatMain, step: Step.Main },
      { phase: Phase.Ending, step: Step.End },
      { phase: Phase.Ending, step: Step.Cleanup }
    ];
    
    const currentIndex = sequence.findIndex(s => s.phase === phase && s.step === step);
    
    // Rule 500.2: If the turn ends, wrap around
    if (currentIndex === sequence.length - 1) {
      return { ...sequence[0], turnEnded: true };
    }
    return { ...sequence[currentIndex + 1], turnEnded: false };
  }

  public static hasPotentialAttackers(state: GameState, playerId: PlayerId): boolean {
    return state.battlefield.some(obj => {
      if (obj.controllerId !== playerId || obj.isTapped) return false;
      
      const types = (obj.definition.types || []).map(t => t.toLowerCase());
      const typeLine = (obj.definition.type_line || '').toLowerCase();
      const isCreature = types.includes('creature') || typeLine.includes('creature') || (obj.definition.types || []).includes('Creature');
      if (!isCreature) return false;

      // Rule 302.6: Haste bypasses summoning sickness for attacking
      const keywords = [...(obj.definition.keywords || []), ...(obj.effectiveStats?.keywords || [])];
      const hasHaste = keywords.some(k => k.toLowerCase() === 'haste');
      if (obj.summoningSickness && !hasHaste) return false;

      // Rule 702.3: Defender
      if (keywords.some(k => k.toLowerCase() === 'defender')) return false;

      // Registry Restrictions
      const cannotAttack = state.ruleRegistry.restrictions.some(r => r.targetId === obj.id && r.type === 'CannotAttack');
      if (cannotAttack) return false;

      return true;
    });
  }

  public static hasPotentialBlockers(state: GameState, playerId: PlayerId): boolean {
    return state.battlefield.some(obj => {
      if (obj.controllerId !== playerId || obj.isTapped) return false;

      const types = (obj.definition.types || []).map(t => t.toLowerCase());
      const typeLine = (obj.definition.type_line || '').toLowerCase();
      const isCreature = types.includes('creature') || typeLine.includes('creature') || (obj.definition.types || []).includes('Creature');
      if (!isCreature) return false;

      // Registry Restrictions
      const cannotBlock = state.ruleRegistry.restrictions.some(r => r.targetId === obj.id && (r.type === 'CannotBlock' || r.type === 'CannotBlockThisTurn'));
      if (cannotBlock) return false;
      
      return true;
    });
  }
}

