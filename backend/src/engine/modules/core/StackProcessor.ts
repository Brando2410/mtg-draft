import { GameState, StackObject, EffectDefinition } from '@shared/engine_types';
import { M21_LOGIC } from '../../data/m21_logic';

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
    
    // Priority 2: Fallback logic for legacy objects or specific spell/ability types
    if (effects.length === 0) {
        if (objectToResolve.type === 'Spell' && objectToResolve.card) {
          const logic = M21_LOGIC[objectToResolve.card.definition.name];
          effects = logic?.abilities?.find((a: any) => a.type === 'Spell')?.effects || [];
        } 
        else if (objectToResolve.type === 'ActivatedAbility') {
            const sourceObj = state.battlefield.find(o => o.id === objectToResolve.sourceId);
            if (sourceObj) {
              const cardLogic = M21_LOGIC[sourceObj.definition.name];
              const ability = cardLogic?.abilities?.[objectToResolve.abilityIndex ?? -1];
              if (ability) {
                  effects = ability.effects;
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
