import { AbilityRestriction, ActivatedAbility, ContinuousEffect, DurationType, GameObject, GameState, TriggeredAbility, Zone } from '@shared/engine_types';
import { oracle } from '../../OracleLogicMap';

/**
 * Rules Engine Module: Registry Management (Rule 113)
 * Handles the "Whiteboard" state: static abilities, triggered abilities, and continuous effects.
 */
export class RegistryProcessor {

  /**
   * CR 113.6: Abilities only function in certain zones. 
   * This method analyzes a card's logic and registers its active abilities to the ruleRegistry.
   */
  public static registerAbilities(state: GameState, card: GameObject) {
    this.unregisterAbilities(state, card.id);
    const logic = oracle.getCard(card.definition.name);
    const abilities = (logic?.abilities || (card.definition as any).abilities || []);
    if (!abilities || abilities.length === 0) return;

    abilities.forEach((ability: any, index: number) => {
        const id = `${card.id}_ability_${index}`;
        const isSpellCard = card.definition.types.some(t => ['Instant', 'Sorcery'].includes(t));
        const defaultZone = (ability.type === 'Spell' || isSpellCard) ? Zone.Stack : Zone.Battlefield;
        const activeZone = ability.activeZone || defaultZone;

        if (card.definition.name === "Social Snub") {
            console.log(`[REGISTRY-DEBUG] ${card.definition.name} (${card.id}) ability ${index}: type=${ability.type}, isSpell=${isSpellCard}, currentZone=${card.zone}, controller=${card.controllerId}`);
        }

        // Rule 113.6: Abilities only function if the card is in the correct zone.
        if (activeZone !== 'Any' && activeZone !== card.zone) {
            return;
        }

        if (card.definition.name === "Social Snub") {
            console.log(`[REGISTRY-DEBUG] Successfully REGISTERED ${ability.type} for Social Snub`);
        }

        console.log(`[REGISTRY] Registering ${ability.type} ability for ${card.definition.name} in ${card.zone}`);

        switch (ability.type) {
            case 'TriggeredAbility':
                this.registerTriggeredAbility(state, card, ability, id, activeZone);
                break;
            case 'ActivatedAbility':
                this.registerActivatedAbility(state, card, ability, id, activeZone);
                break;
            case 'Static':
                this.registerStaticAbility(state, card, ability, id, activeZone);
                break;
            case 'Replacement':
                this.registerReplacementAbility(state, card, ability, id, activeZone);
                break;
        }
    });
  }

  /**
   * Removes all registered items sourced from a specific card.
   * Rule 400.7: Objects leaving zones usually lose their identity.
   */
  public static unregisterAbilities(state: GameState, cardId: string) {
    state.ruleRegistry.triggeredAbilities = state.ruleRegistry.triggeredAbilities.filter(t => t.sourceId !== cardId);
    state.ruleRegistry.activatedAbilities = state.ruleRegistry.activatedAbilities.filter(a => a.sourceId !== cardId);
    state.ruleRegistry.continuousEffects = state.ruleRegistry.continuousEffects.filter(c => {
        if (c.sourceId !== cardId) return true;
        
        // Normalize duration type for robust matching
        const dType = (c.duration?.type || "").toString().toUpperCase();

        const isPersistent = 
            c.id?.startsWith("floating_") ||
            dType === 'UNTILYOURNEXTTURN' || 
            dType === 'UNTILENDOFYOURNEXTTURN' ||
            dType === 'UNTIL_YOUR_NEXT_TURN' ||
            dType === 'UNTIL_END_OF_YOUR_NEXT_TURN' ||
            dType === 'PERMANENT';
            
        return isPersistent;
    });
    state.ruleRegistry.restrictions = state.ruleRegistry.restrictions.filter(r => r.sourceId !== cardId);
    if (state.ruleRegistry.replacementEffects) {
        state.ruleRegistry.replacementEffects = state.ruleRegistry.replacementEffects.filter((r: any) => r.sourceId !== cardId);
    }
  }

  private static registerTriggeredAbility(state: GameState, card: GameObject, ability: any, id: string, activeZone: Zone) {
    state.ruleRegistry.triggeredAbilities.push({
        id,
        sourceId: card.id,
        controllerId: card.controllerId,
        eventMatch: ability.eventMatch,
        condition: ability.condition,
        activeZone,
        oracleText: ability.oracleText || card.definition.oracleText || 'Triggered ability',
        ...ability
    } as TriggeredAbility);
  }

  private static registerActivatedAbility(state: GameState, card: GameObject, ability: any, id: string, activeZone: Zone) {
    state.ruleRegistry.activatedAbilities.push({
        id,
        sourceId: card.id,
        controllerId: card.controllerId,
        activeZone,
        costs: ability.costs,
        effects: ability.effects,
        isManaAbility: ability.isManaAbility || false,
        ...ability
    } as ActivatedAbility);
  }

  private static registerStaticAbility(state: GameState, card: GameObject, ability: any, id: string, activeZone: Zone) {
    if (ability.restrictions) {
        ability.restrictions.forEach((rest: any, rId: number) => {
           let targetId = rest.targetId;
           if (rest.targetMapping === 'SELF') {
               targetId = card.id;
           }

           const cleanRest = { ...rest };
           delete cleanRest.targetMapping;

           state.ruleRegistry.restrictions.push({
               id: `${id}_rest_${rId}`,
               sourceId: card.id,
               targetId: targetId,
               ...cleanRest
           } as AbilityRestriction);
        });
    }

    if (!ability.effects) return;
    ability.effects.forEach((eff: any, eId: number) => {
        const effId = `${id}_eff_${eId}`;
        const continuousTypes = ['ApplyContinuousEffect', 'AdditionalCost', 'SpellTax', 'CostReduction', 'AllowCastFromGraveyard', 'AllowPlayFromTop', 'AllowPlayExiled', 'AllowOutOfTurnActivation', 'AdditionalLandPlays'];
        if (continuousTypes.includes(eff.type)) {
            state.ruleRegistry.continuousEffects.push({
                id: effId,
                sourceId: card.id,
                controllerId: card.controllerId,
                layer: eff.layer || 7,
                timestamp: Date.now(),
                activeZones: [activeZone],
                duration: { type: DurationType.Static },
                targetMapping: eff.targetMapping,
                targetIds: eff.targetMapping === 'SELF' ? [card.id] : undefined,
                ...eff
            } as ContinuousEffect);
        }
    });
  }

  private static registerReplacementAbility(state: GameState, card: GameObject, ability: any, id: string, activeZone: Zone) {
    if (!state.ruleRegistry.replacementEffects) state.ruleRegistry.replacementEffects = [];
    state.ruleRegistry.replacementEffects.push({ id, sourceId: card.id, activeZone, ...ability } as any);
  }
}

