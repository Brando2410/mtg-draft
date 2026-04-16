import { AbilityType, EffectDefinition, GameState, StackObject } from '@shared/engine_types';
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
        const { oracle } = require('../../OracleLogicMap');
        const logic = oracle.getCard(objectToResolve.definition?.name || objectToResolve.card?.definition?.name || "");

        if (objectToResolve.type === AbilityType.Spell) {
          // Priority: Oracle Logic -> Definition Abilities -> Definition Effects
          const spellAbility = logic?.abilities?.find((a: any) => a.type === AbilityType.Spell) || 
                             objectToResolve.definition?.abilities?.find((a: any) => a.type === AbilityType.Spell);
          effects = logic?.effects || (spellAbility as any)?.effects || [];
        } 
        else if (objectToResolve.type === AbilityType.Activated) {
            const sourceObj = state.battlefield.find(o => o.id === objectToResolve.sourceId) || 
                             (Object.values(state.players) as any[]).flatMap(p => p.graveyard).find((o: any) => o.id === objectToResolve.sourceId);
            
            if (sourceObj) {
              const cardLogic = oracle.getCard(sourceObj.definition.name);
              const ability = cardLogic?.abilities?.[objectToResolve.abilityIndex ?? -1] || 
                             sourceObj.definition.abilities?.[objectToResolve.abilityIndex ?? -1];
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

