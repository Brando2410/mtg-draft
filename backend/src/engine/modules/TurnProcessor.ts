import { GameState, Phase, Step, PlayerId } from '@shared/engine_types';

/**
 * Handle Turn Architecture (Chapter 5)
 */
export class TurnProcessor {

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
    return state.battlefield.some(obj => 
      obj.controllerId === playerId && 
      (obj.definition.types || []).some(t => t.toLowerCase() === 'creature') &&
      !obj.isTapped &&
      !obj.summoningSickness // Rule 302.6
    );
  }

  public static hasPotentialBlockers(state: GameState, playerId: PlayerId): boolean {
    return state.battlefield.some(obj => 
      obj.controllerId === playerId && 
      (obj.definition.type_line || '').toLowerCase().includes('creature') &&
      !obj.isTapped
    );
  }
}
