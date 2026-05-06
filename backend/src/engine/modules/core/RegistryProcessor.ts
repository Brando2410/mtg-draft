import { AbilityRestriction, ActivatedAbility, ContinuousEffect, DurationType, GameObject, GameState, TriggeredAbility, Zone } from '@shared/engine_types';
import { oracle } from '../../OracleLogicMap';
import { RuleUtils } from '../../utils/RuleUtils';

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
        state._triggerCache = undefined; // Invalidate trigger cache
        state._statsCache = undefined;   // Invalidate stats cache
        this.unregisterAbilities(state, card.id);
        const logic = oracle.getCard(card.definition.name);
        const abilities = (logic?.abilities || (card.definition as any).abilities || []);
        if (!abilities || abilities.length === 0) return;

        abilities.forEach((ability: any, index: number) => {
            const id = `${card.id}_ability_${index}`;
            const isSpellCard = RuleUtils.isType(card, 'Instant') || RuleUtils.isType(card, 'Sorcery');
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
                    this.registerTriggeredAbility(state, card, ability, id, activeZone, index);
                    break;
                case 'ActivatedAbility':
                    this.registerActivatedAbility(state, card, ability, id, activeZone, index);
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
        state._triggerCache = undefined; // Invalidate trigger cache
        state._statsCache = undefined;   // Invalidate stats cache
        state.ruleRegistry.triggeredAbilities = state.ruleRegistry.triggeredAbilities.filter(t => t.sourceId !== cardId || t.isDelayed);
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

    private static registerTriggeredAbility(state: GameState, card: GameObject, ability: any, id: string, activeZone: Zone, index: number) {
        state.ruleRegistry.triggeredAbilities.push({
            id,
            sourceId: card.id,
            controllerId: card.controllerId,
            eventMatch: ability.eventMatch,
            condition: ability.condition,
            activeZone,
            image_url: card.image_url || card.definition.image_url,
            oracleText: ability.oracleText || card.definition.oracleText || 'Triggered ability',
            effects: ability.effects,
            targetDefinitions: ability.targetDefinitions,
            abilityIndex: ability.abilityIndex !== undefined ? ability.abilityIndex : index,
            isGlobal: ability.isGlobal,
            isDelayed: ability.isDelayed,
            oneShot: ability.oneShot,
            payload: {
                ...(ability.payload || {})
            }
        });
    }

    private static registerActivatedAbility(state: GameState, card: GameObject, ability: any, id: string, activeZone: Zone, index: number) {
        state.ruleRegistry.activatedAbilities.push({
            id,
            sourceId: card.id,
            controllerId: card.controllerId,
            activeZone,
            image_url: card.image_url || card.definition.image_url,
            costs: ability.costs || [],
            effects: ability.effects || [],
            targetDefinitions: ability.targetDefinitions,
            abilityIndex: ability.abilityIndex !== undefined ? ability.abilityIndex : index,
            isManaAbility: ability.isManaAbility || false,
            oracleText: ability.oracleText || card.definition.oracleText
        });
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
                const restrictions = (eff.restrictionsToAdd || []).map((r: any) => ({
                    id: `${effId}_rest`,
                    sourceId: card.id,
                    type: typeof r === 'string' ? r : r.type,
                    duration: { type: DurationType.Static }
                }));

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
                    restrictions: restrictions.length > 0 ? restrictions : (eff.restrictions || []),
                    type: eff.type,
                    value: eff.value,
                    subType: eff.subType,
                    color: eff.color,
                    isAttribute: eff.isAttribute,
                    attribute: eff.attribute,
                    isSpellTax: eff.isSpellTax,
                    taxAmount: eff.taxAmount,
                    reductionAmount: eff.reductionAmount,
                    exileOnMoveToGraveyard: eff.exileOnMoveToGraveyard,
                    abilitiesToAdd: eff.abilitiesToAdd,
                    abilitiesToRemove: eff.abilitiesToRemove,
                    removeAllAbilities: eff.removeAllAbilities,
                    powerModifier: eff.powerModifier,
                    toughnessModifier: eff.toughnessModifier,
                    powerSet: eff.powerSet,
                    toughnessSet: eff.toughnessSet,
                    typesToAdd: eff.typesToAdd,
                    typesSet: eff.typesSet,
                    subtypesToAdd: eff.subtypesToAdd,
                    subtypesSet: eff.subtypesSet,
                    colorsToAdd: eff.colorsToAdd,
                    colorSet: eff.colorSet,
                    flashbackCostOverride: eff.flashbackCostOverride,
                    playerModifier: eff.playerModifier,
                    multiplier: eff.multiplier,
                    isNotLegendary: eff.isNotLegendary,
                    canPlayExiled: eff.canPlayExiled,
                    spendAnyMana: eff.spendAnyMana,
                    isFreeCast: eff.isFreeCast
                });
            }
        });
    }

    private static registerReplacementAbility(state: GameState, card: GameObject, ability: any, id: string, activeZone: Zone) {
        if (!state.ruleRegistry.replacementEffects) state.ruleRegistry.replacementEffects = [];
        state.ruleRegistry.replacementEffects.push({
            id,
            sourceId: card.id,
            controllerId: card.controllerId,
            activeZone,
            eventMatch: ability.eventMatch,
            condition: ability.condition,
            data: ability.data
        });
    }
}

