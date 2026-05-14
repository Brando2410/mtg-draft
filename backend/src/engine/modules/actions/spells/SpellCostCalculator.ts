import { AbilityCost, AbilityType, ActivatedAbilityDefinition, ChoiceCost, ContinuousEffect, CostModifierEffect, CostType, EffectDefinition, EffectType, EnginePrefix, GameObject, GameState, ManaCost, Restriction, TriggerEvent, Zone } from '@shared/engine_types';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { RuleUtils } from '../../../utils/RuleUtils';
import { getProcessors } from '../../ProcessorRegistry';
import { RegistryUtils } from '../../../utils/RegistryUtils';
import { LogCategory } from '../../../utils/EngineLogger';


/**
 * SpellCostCalculator - Derives the effective mana cost for spells and abilities.
 *
 * Responsibilities:
 *   - Parsing base mana costs from card definitions.
 *   - Applying global cost modifiers (spell taxes, cost reductions, additional costs).
 *   - Handling alternative cost selection (Flashback, free-cast permissions).
 *   - Substituting X values into mana cost strings (Rule 107.3).
 *   - Resolving choice-based costs (e.g., "Pay {2} or sacrifice a creature").
 *
 * Design: A single, large, stateless function that takes the full GameState context
 * and returns a cost summary without mutating any state.
 */
export class SpellCostCalculator {
    /**
     * Derives the effective total mana cost for casting a spell, after applying all
     * global modifiers, alternative costs, and additional costs.
     *
     * Resolution pipeline (follows CR 601.2f):
     *   1. Determine base cost (card definition, or Flashback cost if applicable).
     *   2. Substitute {X} with the chosen X value (Rule 107.3).
     *   3. Check for free-cast permissions (alternative costs from continuous effects).
     *   4. Gather global cost modifiers (SpellTax, CostReduction, AdditionalCost).
     *   5. Apply the card's own static additional costs (e.g., Goremand's sacrifice).
     *   6. Evaluate each modifier against the card using matchesRestrictions + conditions.
     *   7. Resolve choice-based costs (e.g., "Pay {2} or sacrifice a creature").
     *   8. Build the final mana cost string (generic + colored symbols).
     *
     * @param state - Current game state for reading continuous effects and restrictions.
     * @param card - The card being cast.
     * @param targets - Pre-selected targets (used for condition evaluation).
     * @param overrideDefinition - Optional face/definition override for MDFCs.
     * @param forceFlashback - Force flashback cost even if the card isn't in graveyard.
     * @param overrideStats - Pre-computed LayerProcessor stats to avoid re-calculation.
     * @returns Object containing totalMana string, list of additionalCosts, and optional usedAlternativeCostId.
     */
    public static getEffectiveCosts(state: GameState, card: GameObject, targets: string[] = [], overrideDefinition?: import('@shared/engine_types').CardDefinition, forceFlashback?: boolean, overrideStats?: any): { totalMana: string, additionalCosts: AbilityCost[], usedAlternativeCostId?: string, isFlashback?: boolean } {

        const currentDef = overrideDefinition || card.definition;
        let baseCost = currentDef.manaCost;

        // Miracle cost override (Rule 702.93)
        if (card.isMiracleCast) {
            const { layer: LayerProcessor } = getProcessors(state);
            const stats = overrideStats || LayerProcessor.getEffectiveStats(card, state);
            const miracleCost = stats.miracleCostOverride || currentDef.miracleCost;
            const { logger } = getProcessors(state);
            logger.debug(state, LogCategory.ACTION, `[MIRACLE-COST-DEBUG] Miracle detected on ${card.definition.name}. MiracleOverride: ${stats.miracleCostOverride}, DefMiracle: ${currentDef.miracleCost}, Result: ${miracleCost}`);
            baseCost = miracleCost || baseCost;
        }

        // Flashback cost override (Rule 702.34)
        // If explicitly forced or if it's a Flashback card in the graveyard, use the alternative cost
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = overrideStats || LayerProcessor.getEffectiveStats(card, state);

        const hasFlashbackKeyword = stats.keywords?.some((k: string) => k.toLowerCase() === 'flashback') ||
            card.definition.keywords?.some((k) => k.toLowerCase() === 'flashback');

        const isFlashback = forceFlashback === true ||
            (forceFlashback !== false && (
                card.isFlashbackCast ||
                (card.zone === Zone.Graveyard && hasFlashbackKeyword && !card.id.startsWith(EnginePrefix.Permission) && !card.id.startsWith(EnginePrefix.FreeCast) && !card.id.startsWith(EnginePrefix.VirtualHand))
            ));

        if (isFlashback) {
            let override = stats.flashbackCostOverride;
            if (override === 'SOURCE_MANA_COST') override = currentDef.manaCost;
            baseCost = override || currentDef.flashbackCost || baseCost;
        } else if (forceFlashback !== false && (card.zone === Zone.Graveyard || Object.values(state.players).some(p => p.virtualHand?.some((v) => v.id === card.id)))) {
            const graveyardAbility = currentDef.abilities?.find((a) =>
                typeof a !== 'string' &&
                a.type === AbilityType.Activated &&
                (a.activeZone === Zone.Graveyard || (Array.isArray(a.activeZone) && a.activeZone.includes(Zone.Graveyard)))
            ) as ActivatedAbilityDefinition;
            if (graveyardAbility) {
                baseCost = graveyardAbility.manaCost || (graveyardAbility.costs?.find((c) => c.type === CostType.Mana) as ManaCost | undefined)?.value || baseCost;
            }

        }

        // Handle X cost substitution (Rule 107.3)
        if (baseCost.includes('{X}') && card.xValue !== undefined) {
            baseCost = baseCost.replace(/\{X\}/g, `{${card.xValue}}`);
        }

        const parsed = ManaProcessor.parseManaCost(baseCost);
        // We defer the card.isFreeCast early return so we can identify the source effect for limit tracking


        let extraGeneric = 0;
        let additionalCosts: AbilityCost[] = [];
        let effectiveCost: string | null = null;

        // --- MODAL MODE COSTS ---
        const lastChosenModeIndex = state.interaction?.lastChosenModeIndex;
        if (lastChosenModeIndex !== undefined) {
            const logic = RegistryUtils.getEffectiveLogic(state, card);
            const modalAbility = RegistryUtils.getModalAbility(logic, currentDef);
            if (modalAbility?.modes) {
                const indices = Array.isArray(lastChosenModeIndex) ? lastChosenModeIndex : [lastChosenModeIndex];

                // Check if ANY selected mode is an alternative cost (Rule 118.9)
                const hasAlternativeMode = indices.some(idx => modalAbility.modes![idx as number]?.isAlternativeCost);
                if (hasAlternativeMode) {
                    parsed.generic = 0;
                    parsed.colored = {};
                    parsed.xCount = 0;
                }

                indices.forEach(idx => {
                    const mode = modalAbility.modes![idx as number];
                    if (mode?.costs) {
                        additionalCosts.push(...mode.costs);
                    }
                    if (mode?.additionalCosts) {
                        additionalCosts.push(...mode.additionalCosts);
                    }
                });
            }
        }

        // 0. Check for Free Cast permissions (Alternative Costs)
        // Rule: Only apply free cast if explicitly chosen (isFreeCast: true) OR as a fallback for non-hand zones.
        const isFree = (card.isFreeCast || (card.isFreeCast === undefined && card.zone !== Zone.Hand)) ? state.ruleRegistry.continuousEffects.find(e => {
            const matchesBasic = (e.isFreeCast || e.value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING");
            if (!matchesBasic) return false;

            const isPlayerTarget = (e.targetMapping === 'CONTROLLER' && e.controllerId === card.controllerId);
            const isSpecificTarget = e.targetIds?.includes(card.id);
            if (!isPlayerTarget && !isSpecificTarget) return false;

            // Rule: Check limitPerTurn if defined
            if (e.limitPerTurn) {
                const used = state.turnState.triggeredAbilitiesUsedThisTurn[e.id] || 0;
                // If it's already been selected (card.isFreeCast is true), we allow it even if the count is currently at limit,
                // because we're about to increment it. But for the initial selection, we block it.
                if (used >= e.limitPerTurn && !card.isFreeCast) return false;
            }

            // Use LayerProcessor to verify the card is actually a target (checking restrictions)
            const { layer: LayerProcessor } = getProcessors(state);
            return LayerProcessor.isTarget(state, e, card.id);
        }) : undefined;

        if (isFree || card.isFreeCast) {
            if (isFree?.value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING" && card.zone !== Zone.Hand) {
                // Keep looking
            } else {
                console.log(`[COST-DEBUG] ${card.definition.name} is free because of ${isFree ? `continuous effect ${isFree.id}` : 'isFreeCast flag'}.`);
                effectiveCost = "{0}";
            }
        }

        if (effectiveCost !== null) return { totalMana: effectiveCost, additionalCosts, usedAlternativeCostId: isFree?.id };

        // 1. Gather global modifiers
        const { targeting: TargetingProcessor } = getProcessors(state);
        const modifiers = state.ruleRegistry.continuousEffects.filter(e => {
            if (!['SpellTax', 'CostReduction', 'AdditionalCost', 'AllowCastFromGraveyard', 'AllowPlayFromTop', 'AllowPlayExiled'].includes(e.type as string)) return false;

            const source = RuleUtils.findObject(state, e.sourceId);
            if (RuleUtils.isEntity(source) && e.activeZones && source.zone && !e.activeZones.includes(source.zone)) return false;

            // SKIP SELF: We scan the card's own abilities manually below to ensure 
            // consistency and avoid double-counting with the rule registry.
            if (e.sourceId === card.id) return false;

            return true;
        });

        // 2. Add the card's OWN static additional costs (e.g. Goremand) OR inherent spell costs (e.g. Village Rites)
        const abilitiesToScan = currentDef.abilities || [];

        abilitiesToScan.forEach((a) => {
            if (typeof a === 'string') return;

            // Case A: Static abilities that apply costs to the card itself
            if (a.type === AbilityType.Static) {
                // Rule 113.6c: Cost-modifying abilities function in any zone from which the card can be played.
                const isCostModifying = a.additionalCosts || a.effects?.some((e: EffectDefinition) => e.type === EffectType.CostReduction || e.type === EffectType.AdditionalCost || e.type === EffectType.SpellTax);
                const activeZone = a.activeZone || (isCostModifying ? card.zone : Zone.Battlefield);

                if (activeZone !== 'Any' && activeZone !== card.zone) return;

                if (a.additionalCosts) {
                    additionalCosts = [...additionalCosts, ...a.additionalCosts];
                }
                a.effects?.forEach((e: EffectDefinition) => {
                    if (e.type === EffectType.AdditionalCost && e.targetMapping === 'SELF') {
                        const costEffect = e as CostModifierEffect;
                        const { condition: ConditionProcessor } = getProcessors(state);
                        const conditionMatches = !costEffect.condition || ConditionProcessor.matchesCondition(state, costEffect.condition, {
                            sourceId: card.id,
                            controllerId: card.controllerId,
                            event: { type: TriggerEvent.ResolveSpell, playerId: card.controllerId, payload: { object: { ...card, isFlashbackCast: isFlashback }, targetIds: targets } },
                            effects: [],
                            targets: []
                        });
                        if (conditionMatches && costEffect.additionalCosts) {
                            additionalCosts = [...additionalCosts, ...costEffect.additionalCosts];
                        }
                    }
                    if (e.type === EffectType.CostReduction && e.targetMapping === 'SELF') {
                        modifiers.push({
                            ...e,
                            id: `temp_${card.id}`,
                            timestamp: Date.now(),
                            sourceId: card.id,
                            controllerId: card.controllerId
                        } as ContinuousEffect);
                    }
                });
            }
            // Case B: Inherent Costs/Reductions inside the Spell ability itself (Instants/Sorceries)
            if (a.type === AbilityType.Spell) {
                if (a.costs) {
                    additionalCosts = [...additionalCosts, ...a.costs];
                }
                if (a.additionalCosts) {
                    additionalCosts = [...additionalCosts, ...a.additionalCosts];
                }
                if (a.costReduction) {
                    modifiers.push({
                        ...a.costReduction,
                        id: `inherent_reduction_${card.id}`,
                        timestamp: Date.now(),
                        sourceId: card.id,
                        controllerId: card.controllerId,
                        targetMapping: 'SELF'
                    } as ContinuousEffect);
                }
            }
        });

        // 2.5 Scan keywords for Affinity and Casualty
        const keywords = [...new Set([...(stats?.keywords || []), ...(currentDef.keywords || [])])];

        keywords.forEach((k: string) => {
            if (k.toLowerCase().startsWith('affinity for ')) {
                const condition = k.substring(13).toLowerCase();
                // Map condition to DynamicAmount
                let amount: string = "";
                if (condition === 'creatures') amount = "CREATURES_YOU_CONTROL";
                else if (condition === 'artifacts') amount = "COUNT_Artifact";
                else amount = `COUNT_${condition.charAt(0).toUpperCase() + condition.slice(1)}`;

                modifiers.push({
                    id: `affinity_${card.id}`,
                    timestamp: Date.now(),
                    type: 'CostReduction',
                    reductionAmount: amount,
                    sourceId: card.id,
                    controllerId: card.controllerId || card.ownerId,
                    targetMapping: 'SELF'
                } as ContinuousEffect);
            }

            // --- CASUALTY (Rule 702.152) ---
            if (k.toLowerCase().startsWith('casualty ')) {
                const parts = k.split(' ');
                const amountStr = parts[parts.length - 1];
                const amount = parseInt(amountStr);
                if (!isNaN(amount)) {
                    additionalCosts.push({
                        type: CostType.Choice,
                        label: `Casualty ${amount}`,
                        choices: [
                            {
                                label: "Don't pay Casualty",
                                costs: []
                            },
                            {
                                label: `Pay Casualty ${amount} (Sacrifice a creature with power ${amount} or greater)`,
                                costs: [{
                                    type: CostType.Sacrifice,
                                    amount: 1,
                                    restrictions: [Restriction.Creature, `POWER${amount}ORGREATER`],
                                    isCasualty: true
                                }]
                            }
                        ]
                    } as ChoiceCost);

                }
            }
        });



        for (const mod of modifiers) {
            const type = mod.type;
            const impacts = (mod.targetMapping === 'EACH_PLAYER') ||
                (mod.targetMapping === 'EACH_OPPONENT' || mod.targetMapping === 'OPPONENT') && mod.controllerId !== card.controllerId ||
                (mod.targetMapping === 'SELF' && mod.sourceId === card.id) ||
                (mod.targetMapping === 'CONTROLLER' && mod.controllerId === card.controllerId);

            if (!impacts) continue;

            const restrictions = mod.restrictions || [];
            const { condition: ConditionProcessor } = getProcessors(state);

            const matches = TargetingProcessor.matchesRestrictions(state, card, restrictions, {
                sourceId: mod.sourceId,
                controllerId: card.controllerId || card.ownerId,
                effects: [],
                targets: []
            });
            const conditionMatches = !mod.condition || ConditionProcessor.matchesCondition(state, mod.condition, {
                sourceId: mod.sourceId,
                controllerId: card.controllerId,
                cardToPlay: { ...card, isFlashbackCast: isFlashback },
                event: { type: TriggerEvent.CastSpell, playerId: card.controllerId, payload: { object: { ...card, isFlashbackCast: isFlashback }, targetIds: targets } },
                effects: [],
                targets: []
            });

            if (!matches || !conditionMatches) continue;

            if (type === EffectType.SpellTax) {
                const tax = mod.taxAmount;
                if (typeof tax === 'number') extraGeneric += tax;
                else if (typeof tax === 'string' && !isNaN(Number(tax))) extraGeneric += Number(tax);
            }
            if (type === EffectType.AdditionalCost && mod.data?.additionalCosts) {
                additionalCosts = [...additionalCosts, ...mod.data.additionalCosts];
            }
            if (type === EffectType.CostReduction) {
                const red = mod.reductionAmount;
                if (red !== undefined) {
                    if (typeof red === 'number') {
                        extraGeneric -= red;
                    } else if (typeof red === 'string' && red.includes('{')) {
                        const parsedRed = ManaProcessor.parseManaCost(red);
                        extraGeneric -= parsedRed.generic;
                        for (const [s, c] of Object.entries(parsedRed.colored)) {
                            parsed.colored[s] = Math.max(0, (parsed.colored[s] || 0) - c);
                        }
                    } else if (typeof red === 'string' || (typeof red === 'object' && red !== null && 'type' in red)) {
                        const { effect: EP } = getProcessors(state);
                        const resolved = EP.resolveAmount(state, red, {
                            sourceId: mod.sourceId,
                            controllerId: card.controllerId || card.ownerId,
                            targets,
                            effects: []
                        }, targets);
                        extraGeneric -= resolved;
                    }
                }
            }
            if (type === EffectType.AdditionalCost || type === EffectType.AllowCastFromGraveyard || type === EffectType.AllowPlayExiled) {
                const extra = mod.data?.additionalCosts || mod.data?.costs || [];
                additionalCosts = [...additionalCosts, ...extra];
            }
        }

        // --- ADDITIONAL COST RESOLUTION (Rule 601.2f) ---
        // 1. Filter ALL additional costs by condition
        additionalCosts = additionalCosts.filter(c => {
            if (!(c as any).condition) return true;
            const { condition: ConditionProcessor } = getProcessors(state);
            return ConditionProcessor.matchesCondition(state, (c as any).condition, {
                sourceId: card.id,
                controllerId: card.controllerId || card.ownerId,
                cardToPlay: { ...card, isFlashbackCast: isFlashback },
                event: { type: TriggerEvent.CastSpell, playerId: card.controllerId, payload: { object: card, targetIds: targets } },
                effects: [],
                targets: []
            });
        });

        // 2. Resolve Choice Costs (recursive if they contain mana)
        const choiceCostIndex = additionalCosts.findIndex(c => c.type === CostType.Choice);
        if (choiceCostIndex !== -1) {
            const choice = additionalCosts[choiceCostIndex] as ChoiceCost;
            const chosenIndex = state.interaction.lastChoiceIndex;
            if (chosenIndex !== undefined && (choice as ChoiceCost).choices?.[chosenIndex]) {
                const chosenCosts = (choice as ChoiceCost).choices[chosenIndex].costs;
                additionalCosts.splice(choiceCostIndex, 1, ...chosenCosts);
            }
        }

        // 3. Separate Mana costs from non-mana costs
        const manaCosts = additionalCosts.filter(c => c.type === 'Mana');
        const nonManaCosts = additionalCosts.filter(c => c.type !== 'Mana');

        // 4. Merge all additional mana into the 'parsed' pool before applying reductions
        manaCosts.forEach(cc => {
            const ccParsed = ManaProcessor.parseManaCost(cc.value);
            parsed.generic += ccParsed.generic;
            Object.entries(ccParsed.colored).forEach(([s, c]) => {
                parsed.colored[s] = (parsed.colored[s] || 0) + c;
            });
        });

        // 5. Apply generic reductions to the total pool (Base + Additional)
        let finalGeneric = Math.max(0, parsed.generic + extraGeneric);

        // 6. Update the array to only contain the non-mana costs (which will be handled interactively)
        additionalCosts = nonManaCosts;

        let costStr = '';
        const { xCount } = parsed;
        for (let i = 0; i < xCount; i++) costStr += '{X}';

        Object.entries(parsed.colored).forEach(([symbol, count]: [string, any]) => {
            for (let i = 0; i < count; i++) costStr += `{${symbol}}`;
        });

        if (finalGeneric > 0 || (costStr === '' && finalGeneric === 0)) {
            costStr = `{${finalGeneric}}` + costStr;
        }


        if (extraGeneric !== 0) {
            console.log(`[COST-CALC] ${card.definition.name} (${card.zone}): Base=${parsed.generic}, Modifiers=${extraGeneric}, FinalGeneric=${finalGeneric}`);
        }

        return { totalMana: costStr, additionalCosts, isFlashback };
    }
}
