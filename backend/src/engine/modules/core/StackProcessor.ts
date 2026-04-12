import { GameState, StackObject, EffectDefinition, AbilityType } from '@shared/engine_types';
import { m21 } from '../../data/m21';

/**
 * Handles the management and resolution of objects on the stack (Rule 405)
 */
export class StackProcessor {

  /**
   * Retrieves the effects that should be executed when a stack object resolves.
   */
  public static getEffectsForResolution(state: GameState, objectToResolve: StackObject): EffectDefinition[] {
    // Priority 1: Effects already stored in stack object data during casting/activation
    let effects: EffectDefinition[] = (objectToResolve.data as any)?.effects || [];
    if (effects.length === 0) {
        if (objectToResolve.type === AbilityType.Spell && objectToResolve.card) {
          const logic = m21[objectToResolve.card.definition.name];
          effects = logic?.abilities?.find((a: any) => a.type === AbilityType.Spell)?.effects || [];
        } 
        else if (objectToResolve.type === AbilityType.Activated) {
            const sourceObj = state.battlefield.find(o => o.id === objectToResolve.sourceId);
            if (sourceObj) {
              const cardLogic = m21[sourceObj.definition.name];
              const ability = cardLogic?.abilities?.[objectToResolve.abilityIndex ?? -1];
              if (ability) {
                  effects = ability.effects || [];
              }
            }
        }
    }
    
    return effects;
  }

  /**
   * Cleans up the stack and removes objects that are no longer valid.
   */
  public static cleanStack(state: GameState) {
      // rule 608.2b re-check could happen here
  }
}
