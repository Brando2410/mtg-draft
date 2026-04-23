import { AbilityCost, AbilityType, ActivatedAbilityDefinition, CostType, GameObject, GameState, Zone } from '@shared/engine_types';
import { oracle } from '../../../OracleLogicMap';
import { ManaProcessor } from '../../magic/ManaProcessor';

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
    public static getEffectiveCosts(state: GameState, card: GameObject, targets: string[] = [], overrideDefinition?: any, forceFlashback?: boolean, overrideStats?: any): { totalMana: string, additionalCosts: AbilityCost[], usedAlternativeCostId?: string, isFlashback?: boolean } {
        const currentDef = overrideDefinition || card.definition;
        let baseCost = currentDef.manaCost;

        // Flashback cost override (Rule 702.34)
        // If explicitly forced or if it's a Flashback card in the graveyard, use the alternative cost
        const { LayerProcessor } = require('../../state/LayerProcessor');
        const stats = overrideStats || LayerProcessor.getEffectiveStats(card, state);

        const hasFlashbackKeyword = stats.keywords?.some((k: string) => k.toLowerCase() === 'flashback') ||
            card.definition.keywords?.some((k: string) => k.toLowerCase() === 'flashback');

        const isFlashback = forceFlashback ||
            (card as any).isFlashbackCast ||
            (card.zone === Zone.Graveyard && hasFlashbackKeyword);

        if (isFlashback) {
            let override = stats.flashbackCostOverride;
            if (override === 'SOURCE_MANA_COST') override = currentDef.manaCost;
            baseCost = currentDef.flashbackCost || (currentDef as any).flashback_cost || override || baseCost;
        } else if (card.zone === Zone.Graveyard || (Object.values(state.players) as any[]).some(p => p.virtualHand.some((v: any) => v.id === card.id))) {
            const graveyardAbility = currentDef.abilities?.find((a: any) =>
                a.type === AbilityType.Activated &&
                (a.zone === Zone.Graveyard || a.activeZone === Zone.Graveyard)
            ) as ActivatedAbilityDefinition;
            if (graveyardAbility) {
                baseCost = graveyardAbility.manaCost || graveyardAbility.costs?.find((c: any) => c.type === CostType.Mana)?.value || baseCost;
            }

        }

        // Handle X cost substitution (Rule 107.3)
        if (baseCost.includes('{X}') && card.xValue !== undefined) {
            baseCost = baseCost.replace(/\{X\}/g, `{${card.xValue}}`);
        }

        const parsed = ManaProcessor.parseManaCost(baseCost);
        if ((card as any).isFreeCast) {
            console.log(`[COST-DEBUG] ${card.definition.name} is free because card.isFreeCast is true.`);
            return { totalMana: "{0}", additionalCosts: [], isFlashback };
        }

        let extraGeneric = 0;
        let additionalCosts: AbilityCost[] = [];
        let effectiveCost: string | null = null;

        // 0. Check for Free Cast permissions (Alternative Costs)
        const isFree = state.ruleRegistry.continuousEffects.find(e => {
            const matchesBasic = (e.isFreeCast || (e as any).value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING");
            if (!matchesBasic) return false;

            const isPlayerTarget = (e.targetMapping === 'CONTROLLER' && e.controllerId === card.controllerId);
            const isSpecificTarget = e.targetIds?.includes(card.id);
            if (!isPlayerTarget && !isSpecificTarget) return false;

            // Rule: Check limitPerTurn if defined
            if (e.limitPerTurn) {
                const used = state.turnState.triggeredAbilitiesUsedThisTurn[e.id] || 0;
                if (used >= e.limitPerTurn) return false;
            }

            // Use LayerProcessor to verify the card is actually a target (checking restrictions)
            const { LayerProcessor } = require('../../state/LayerProcessor');
            return LayerProcessor.isTarget(state, e, card.id);
        });

        if (isFree) {
            if ((isFree as any).value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING" && card.zone !== Zone.Hand) {
                // Keep looking
            } else {
                console.log(`[COST-DEBUG] ${card.definition.name} is free because of continuous effect ${isFree.id}.`);
                effectiveCost = "{0}";
            }
        }

        if (effectiveCost !== null) return { totalMana: effectiveCost, additionalCosts, usedAlternativeCostId: isFree?.id };

        // 1. Gather global modifiers
        const { TargetingProcessor } = require('../targeting/TargetingProcessor');
        const modifiers = state.ruleRegistry.continuousEffects.filter(e => {
            if (!['SpellTax', 'CostReduction', 'AdditionalCost', 'AllowCastFromGraveyard', 'AllowPlayFromTop', 'AllowPlayExiled'].includes((e as any).type)) return false;

            const source = TargetingProcessor.findObjectInAnyZone(state, e.sourceId);
            if (source && e.activeZones && !e.activeZones.includes(source.zone)) return false;
            
            // SKIP SELF: We scan the card's own abilities manually below to ensure 
            // consistency and avoid double-counting with the rule registry.
            if (e.sourceId === card.id) return false;

            return true;
        });

        // 2. Add the card's OWN static additional costs (e.g. Goremand) OR inherent spell costs (e.g. Village Rites)
        const abilitiesToScan = currentDef.abilities || [];

        abilitiesToScan.forEach((a: any) => {
            if (typeof a === 'string') return;

            // Case A: Static abilities that apply costs to the card itself
            if (a.type === AbilityType.Static) {
                // Rule 113.6c: Cost-modifying abilities function in any zone from which the card can be played.
                const isCostModifying = a.additionalCosts || a.effects?.some((e: any) => ['CostReduction', 'AdditionalCost', 'SpellTax'].includes(e.type));
                const activeZone = a.activeZone || (isCostModifying ? card.zone : Zone.Battlefield);

                if (activeZone !== 'Any' && activeZone !== card.zone) return;

                if (a.additionalCosts) {
                    additionalCosts = [...additionalCosts, ...a.additionalCosts];
                }
                a.effects?.forEach((e: any) => {
                    if (e.type === 'AdditionalCost' && e.targetMapping === 'SELF') {
                        const { ConditionProcessor } = require('../../core/logic/ConditionProcessor');
                        const conditionMatches = !e.condition || ConditionProcessor.matchesCondition(state, e.condition, {
                            sourceId: card.id,
                            controllerId: card.controllerId,
                            event: { data: { card: { ...card, isFlashbackCast: isFlashback }, targets } } as any
                        });
                        if (conditionMatches && e.additionalCosts) {
                            additionalCosts = [...additionalCosts, ...e.additionalCosts];
                        }
                    }
                    if (e.type === 'CostReduction' && e.targetMapping === 'SELF') {
                        modifiers.push({ ...e, sourceId: card.id, controllerId: card.controllerId } as any);
                    }
                });
            }
            // Case B: Inherent Costs/Reductions inside the Spell ability itself (Instants/Sorceries)
            if ((a.type === AbilityType.Spell || a.type === 'SpellAbility')) {
                if (a.costs) {
                    additionalCosts = [...additionalCosts, ...a.costs];
                }
                if (a.additionalCosts) {
                    additionalCosts = [...additionalCosts, ...a.additionalCosts];
                }
                if (a.costReduction) {
                    modifiers.push({ ...a.costReduction, sourceId: card.id, controllerId: card.controllerId } as any);
                }
            }
        });

        // 2.5 Scan keywords for Affinity
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
                    type: 'CostReduction',
                    amount: amount,
                    sourceId: card.id,
                    controllerId: card.controllerId || card.ownerId,
                    targetMapping: 'SELF'
                } as any);
            }
        });

        for (const mod of modifiers) {
            const type = (mod as any).type;
            const impacts = (mod.targetMapping === 'EACH_PLAYER') ||
                (mod.targetMapping === 'EACH_OPPONENT' || mod.targetMapping === 'OPPONENT') && mod.controllerId !== card.controllerId ||
                (mod.targetMapping === 'SELF' && mod.sourceId === card.id) ||
                (mod.targetMapping === 'CONTROLLER' && mod.controllerId === card.controllerId);

            if (!impacts) continue;

            const restrictions = (mod as any).restrictions || [];
            const { ConditionProcessor } = require('../../core/logic/ConditionProcessor');

            const matches = TargetingProcessor.matchesRestrictions(state, card, (restrictions as any[] || []), {
                sourceId: mod.sourceId,
                controllerId: card.controllerId || card.ownerId
            });
            const conditionMatches = !mod.condition || ConditionProcessor.matchesCondition(state, mod.condition, {
                sourceId: mod.sourceId,
                controllerId: card.controllerId,
                cardToPlay: { ...card, isFlashbackCast: isFlashback },
                event: { data: { card: { ...card, isFlashbackCast: isFlashback }, targets } } as any
            });

            if (!matches || !conditionMatches) continue;

            if (type === 'SpellTax') extraGeneric += (mod as any).amount || 0;
            if (type === 'AdditionalCost' && (mod as any).additionalCosts) {
                additionalCosts = [...additionalCosts, ...(mod as any).additionalCosts];
            }
            if (type === 'CostReduction') {
                const { EffectProcessor } = require('../../effects/EffectProcessor');
                const redAmt = EffectProcessor.resolveAmount(state, (mod as any).amount, {
                    sourceId: mod.sourceId,
                    controllerId: card.controllerId || card.ownerId,
                    targets: targets,
                    effects: [mod] as any
                } as any, targets);
                extraGeneric -= redAmt || 0;
                if ((mod as any).manaReduction) {
                    const red = ManaProcessor.parseManaCost((mod as any).manaReduction);
                    extraGeneric -= red.generic;
                    for (const [s, c] of Object.entries(red.colored)) {
                        parsed.colored[s] = Math.max(0, (parsed.colored[s] || 0) - (c as number));
                    }
                }
            }
            if (type === 'AdditionalCost' || type === 'AllowCastFromGraveyard' || type === 'AllowPlayExiled') {
                const extra = (mod as any).additionalCosts || (mod as any).costs || [];
                additionalCosts = [...additionalCosts, ...extra];
            }
        }

        let finalGeneric = Math.max(0, parsed.generic + extraGeneric);

        // --- CHOICE COST RESOLUTION ---
        const choiceCostIndex = additionalCosts.findIndex(c => (c.type as string) === 'Choice');
        if (choiceCostIndex !== -1) {
            const choice = additionalCosts[choiceCostIndex];
            const chosenIndex = (state as any).lastChosenCostChoiceIndex;
            if (chosenIndex !== undefined && choice.choices?.[chosenIndex]) {
                const chosenCosts = choice.choices[chosenIndex].costs;
                // Remove the choice and insert its components
                additionalCosts.splice(choiceCostIndex, 1, ...chosenCosts);

                // Add any mana costs from the choice to the total
                chosenCosts.forEach((cc: any) => {
                    if (cc.type === 'Mana') {
                        const ccParsed = ManaProcessor.parseManaCost(cc.value);
                        finalGeneric += ccParsed.generic;
                        Object.entries(ccParsed.colored).forEach(([s, c]) => {
                            parsed.colored[s] = (parsed.colored[s] || 0) + (c as number);
                        });
                    }
                });
            }
        }

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
            console.log(`[COST-CALC] ${card.definition.name}: Base=${parsed.generic}, Modifiers=${extraGeneric}, FinalGeneric=${finalGeneric}`);
        }

        return { totalMana: costStr, additionalCosts, isFlashback };
    }
}
