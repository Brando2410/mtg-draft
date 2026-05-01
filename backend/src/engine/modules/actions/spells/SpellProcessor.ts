import {
    AbilityCost,
    AbilityDefinition,
    AbilityType,
    ActionType,
    EffectType,
    GameObject,
    GameState,
    TriggerEvent,
    Zone
} from '@shared/engine_types';
import { LogCategory } from '../../../utils/EngineLogger';
import {
    ActivateAbilityOptions,
    EngineContext,
    FinalizeAbilityOptions,
    FinalizeCastOptions,
    PlayCardOptions
} from '../../../interfaces/EngineContext';
import { oracle } from '../../../OracleLogicMap';
import { CombatProcessor } from "../../combat/CombatProcessor";
import { RuleUtils } from "../../../utils/RuleUtils";
import { CostProcessor } from '../../magic/CostProcessor';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { SpellCostCalculator } from './SpellCostCalculator';
import { SpellInteractiveManager } from './SpellInteractiveManager';
import { SpellValidator } from './SpellValidator';
import { getProcessors } from '../../ProcessorRegistry';

/**
 * SpellProcessor - Orchestrator Facade for Casting Spells and Activating Abilities.
 *
 * This module implements the MTG Comprehensive Rules Chapters 601 (Casting Spells)
 * and 602 (Activating Abilities). It acts as the entry point and coordinator,
 * delegating to specialized sub-modules:
 *
 *   - SpellValidator: Pure rules validation (timing, zone legality, activation limits).
 *   - SpellCostCalculator: Derives the effective mana cost including taxes/reductions.
 *   - SpellInteractiveManager: Injects pendingAction modals for UI-driven choices.
 *
 * The two finalization methods (finalizeSpellCast, finalizeAbilityActivation) remain
 * here because they commit the spell/ability to the stack and fire triggers, which
 * is the core orchestration responsibility.
 */
export class SpellProcessor {

    public static playCard(
        state: GameState,
        engine: EngineContext,
        options: PlayCardOptions
    ): boolean {
        const { playerId, cardId: cardInstanceId, bypassPriority = false, bypassTargeting = false, xValue, isFreeCast, parentContext, exileOnResolution } = options;
        let declaredTargets = options.targets || [];

        const { logger, targeting: TargetingProcessor } = getProcessors(state);
        logger.debug(state, LogCategory.ACTION, `[PLAY-ENTRY-FULL] ${cardInstanceId}: targets=${declaredTargets.length} (${declaredTargets.join(', ')}), x=${xValue}`);
        // 1. Priority Error (Rule 117.1)
        if (!bypassPriority && String(state.priorityPlayerId) !== String(playerId)) {
            return false;
        }

        if (state.pendingAction && !bypassPriority) {
            logger.info(state, LogCategory.ACTION, `Cannot cast: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        logger.debug(state, LogCategory.ACTION, `[PLAY-ENTRY] playCard for ${cardInstanceId}. bypassPriority=${bypassPriority}, bypassTargeting=${bypassTargeting}, isFreeCast=${isFreeCast}, hasParent=${!!parentContext}`);
        logger.debug(state, LogCategory.ACTION, `[PLAY-DEBUG] playCard for ${cardInstanceId} (isFreeCast=${isFreeCast}, hasParent=${!!parentContext})`);

        const player = state.players[playerId];
        if (player && player.pendingDiscardCount > 0) {
            logger.info(state, LogCategory.ACTION, `Player must finish discarding before playing cards.`);
            return false;
        }

        const cardToPlay = SpellValidator.resolveCardToPlay(state, playerId, cardInstanceId, bypassPriority);
        if (!cardToPlay) return false;

        // Apply incoming xValue if provided (for resuming after targeting)
        if (xValue !== undefined) {
            cardToPlay.xValue = xValue;
        }

        logger.debug(state, LogCategory.ACTION, `[PLAY-DEBUG] Resolved card to play: ${cardToPlay.definition.name} in zone ${cardToPlay.zone}.`);

        if (isFreeCast) {
            cardToPlay.isFreeCast = true;
        } else {
            delete (cardToPlay as any).isFreeCast;
        }

        if (exileOnResolution) {
            console.log(`[PLAY-DEBUG] Setting exileOnResolution=true for ${cardToPlay.definition.name}`);
            (cardToPlay as any).exileOnResolution = true;
        } else {
            delete (cardToPlay as any).exileOnResolution;
        }

        // --- ACTIVATED ABILITY REDIRECTION (Graveyard) ---
        // If the card is in the graveyard and we're trying to "play" it, check if it's actually an activated ability card
        if (cardToPlay.zone === Zone.Graveyard && (state.players[playerId].hand.find((c) => c.id === cardInstanceId) === undefined)) {
            const { layer: LayerProcessor } = getProcessors(state);
            const stats = LayerProcessor.getEffectiveStats(cardToPlay, state);
            const hasFlashback = stats.keywords?.includes('Flashback') || cardToPlay.definition.keywords?.includes('Flashback');

            if (!hasFlashback) {
                const graveAbilityIndex = cardToPlay.definition.abilities?.findIndex((a) => {
                    if (typeof a === 'string') return false;
                    return a.type === AbilityType.Activated &&
                        a.activeZone === Zone.Graveyard;
                });

                if (graveAbilityIndex !== undefined && graveAbilityIndex !== -1) {
                    logger.debug(state, LogCategory.ACTION, `[DEBUG] Converting playCard to activateAbility for ${cardToPlay.definition.name}`);
                    return SpellProcessor.activateAbility(state, engine, {
                        playerId,
                        cardId: cardInstanceId,
                        abilityIndex: graveAbilityIndex,
                        targets: declaredTargets,
                        bypassPriority: bypassPriority,
                        xValue: xValue,
                        parentContext
                    });
                }
            }
        }

        // --- MDFC FACE SELECTION (CR 711.1) ---
        if (cardToPlay.definition.faces && !bypassPriority && !cardToPlay.selectedFaceDefinition) {
            const { choiceGenerator: ChoiceGenerator, action: ActionProcessor } = getProcessors(state);
            state.pendingAction = ActionProcessor.prepareAction(state, ChoiceGenerator.createModalChoice(state, {
                label: `Cast ${cardToPlay.definition.name}: Choose Face`,
                playerId: playerId,
                sourceId: cardToPlay.id,
                actionType: ActionType.ModalSelection
            }, cardToPlay.definition.faces.map((face, idx) => ({
                label: `${face.name} (${face.type_line})`,
                value: `FACE_SELECTION_${idx}`
            }))));
            state.priorityPlayerId = null;
            return true;
        }

        const currentDefinition = cardToPlay.selectedFaceDefinition || cardToPlay.definition;

        // Persist face choice into the object definition for Zones (Stack/Battlefield)
        if (cardToPlay.selectedFaceDefinition) {
            cardToPlay.definition = cardToPlay.selectedFaceDefinition;
        }

        // --- X-VALUE RESET FAIL-SAFE ---
        if (!bypassPriority && cardToPlay.xValue !== undefined && xValue === undefined) {
            cardToPlay.xValue = undefined;
        }

        // --- TYPE IDENTIFICATION ---
        const isLand = RuleUtils.isType(cardToPlay, 'land');
        const isInstant = RuleUtils.isType(cardToPlay, 'instant');
        const isSorcery = RuleUtils.isType(cardToPlay, 'sorcery');
        const isFlash = RuleUtils.hasKeyword(cardToPlay, 'flash');

        const isInstantOrFlash = isInstant || isFlash;
        const isInstantOrSorcery = isInstant || isSorcery;
        const isFirstInstantOrSorcery = isInstantOrSorcery && !state.turnState.instantOrSorceryCastThisTurn[playerId];

        if (!SpellValidator.validateCardTiming(state, playerId, cardToPlay, isInstantOrFlash, bypassPriority)) {
            return false;
        }

        // 3. Land Handling (Rule 305)
        if (isLand) {
            return SpellValidator.handleLandPlay(state, playerId, cardToPlay, engine);
        }

        // 4. Extract logic and effects
        const logic = oracle.getCard(currentDefinition.name);
        if (!logic && !isLand) {
            logger.info(state, LogCategory.ACTION, `[WARNING] No logic definition found for ${currentDefinition.name}.`);
        }

        // Priority: Oracle -> Current Definition on Object (for virtual spells/MDFCs)
        const modalAbility = logic?.abilities?.find((a: any) => a.modes) || currentDefinition.abilities?.find((a: any) => typeof a !== 'string' && a.modes) as AbilityDefinition | undefined;
        const hasPreSelectedChoice = state.interaction?.lastChoiceIndex !== undefined;
        const lastChosenModeIndex = state.interaction?.lastChosenModeIndex;
        const hasPreSelectedMode = lastChosenModeIndex !== undefined;

        // --- EXTRACT EFFECTIVE TARGETS/EFFECTS (Modally Aware) ---
        let targetDefinition = logic?.targetDefinition ||
            logic?.abilities?.find((a: any) => a.type === AbilityType.Spell)?.targetDefinition ||
            currentDefinition.targetDefinition ||
            currentDefinition.auraRestriction ||
            (currentDefinition.abilities?.find((a: any) => typeof a !== 'string' && a.type === AbilityType.Spell) as AbilityDefinition | undefined)?.targetDefinition;

        let spellEffects = logic?.effects ||
            logic?.abilities?.find((a: any) => a.type === AbilityType.Spell)?.effects ||
            (currentDefinition as any).effects ||
            (currentDefinition.abilities?.find((a: any) => typeof a !== 'string' && a.type === AbilityType.Spell) as AbilityDefinition | undefined)?.effects || [];

        if (hasPreSelectedMode && modalAbility?.modes) {
            const indices = [...(Array.isArray(lastChosenModeIndex) ? lastChosenModeIndex : [lastChosenModeIndex])].sort((a, b) => (a as number) - (b as number));
            logger.debug(state, LogCategory.ACTION, `[MODAL] Applying chosen modes: ${indices.join(', ')}`);

            const combinedTargets: AbilityDefinition['targetDefinition'][] = [];
            const combinedEffects: AbilityDefinition['effects'] = [];

            let currentTargetOffset = 0;
            indices.forEach(idx => {
                const mode = modalAbility.modes![idx];
                if (!mode) return;

                if (mode.targetDefinition) {
                    if (Array.isArray(mode.targetDefinition)) combinedTargets.push(...mode.targetDefinition);
                    else combinedTargets.push(mode.targetDefinition);
                }

                if (mode.effects) {
                    // Deep clone and inject targetOffset
                    const modeEffects = JSON.parse(JSON.stringify(mode.effects)).map((e: any) => ({
                        ...e,
                        targetOffset: currentTargetOffset
                    }));
                    combinedEffects.push(...modeEffects);
                }

                if (mode.targetDefinition) {
                    const counts = TargetingProcessor.calculateTotalCounts(mode.targetDefinition, cardToPlay.xValue || 0);
                    currentTargetOffset += counts.maxCount;
                }
            });

            if (combinedTargets.length > 0) targetDefinition = combinedTargets as unknown as AbilityDefinition['targetDefinition'];
            if (combinedEffects.length > 0) spellEffects = combinedEffects as AbilityDefinition['effects'];
        }

        const choiceEffectIndex = spellEffects.findIndex((e: any, idx: number) =>
            e.type === EffectType.Choice &&
            e.choices &&
            !e.targetMapping &&
            idx === 0 &&
            (!e.choices.some((c: any) => c.costs && c.costs.length > 0))
        );

        // Step 0.5: Check for X in cost or inherent logic
        const costStr = (currentDefinition.manaCost || '').split('//')[0].trim();

        // Safely check for X in pre-selected modal modes
        let modeHasX = false;
        if (hasPreSelectedMode && modalAbility?.modes) {
            const index = (Array.isArray(lastChosenModeIndex) ? lastChosenModeIndex[0] : lastChosenModeIndex) as number;
            const chosenMode = modalAbility.modes[index];
            if (chosenMode) {
                modeHasX = JSON.stringify(chosenMode).includes('"X"');
            }
        }

        // X-Value Selection
        const needsX = costStr.includes('{X}') ||
            logic?.abilities?.some((a: any) => (a.costs || a.additionalCosts)?.some((c: any) => c.value === 'X')) ||
            currentDefinition.abilities?.some((a: any) => typeof a !== 'string' && (a.costs || a.additionalCosts)?.some((c: any) => c.value === 'X')) ||
            logic?.effects?.some((e: any) => JSON.stringify(e).includes('"X"')) ||
            modeHasX;

        if (needsX && cardToPlay.xValue === undefined) {
            if (isFreeCast) {
                cardToPlay.xValue = 0;
                logger.debug(state, LogCategory.ACTION, `[DEBUG] ${cardToPlay.definition.name} cast for free: X is 0 (Rule 107.3b).`);
            } else {
                return SpellInteractiveManager.handleXValueChoice(state, playerId, cardToPlay, declaredTargets, parentContext, isFreeCast, exileOnResolution);
            }
        }

        // CR 601.2f: Determine total cost
        const { totalMana, additionalCosts, usedAlternativeCostId, isFlashback } = SpellCostCalculator.getEffectiveCosts(state, cardToPlay, declaredTargets, currentDefinition);
        cardToPlay.usedAlternativeCostId = usedAlternativeCostId;
        if (isFlashback) (cardToPlay as any).isFlashbackCast = true;

        // --- SETUP SEQUENCE: TARGETING -> CHOICE -> FINALIZATION ---

        // Step 1: Check Targeting
        const totalTargetCounts = targetDefinition ? TargetingProcessor.calculateTotalCounts(targetDefinition, cardToPlay.xValue || 0) : { maxCount: 0 };
        
        if (targetDefinition && (!declaredTargets || declaredTargets.length < totalTargetCounts.maxCount) && !bypassTargeting) {
            const result = SpellInteractiveManager.handleTargetingChoice(state, playerId, cardToPlay, targetDefinition, totalMana, cardInstanceId, engine, parentContext, isFreeCast, exileOnResolution, declaredTargets);
            if (typeof result === 'boolean') return result;
            declaredTargets = result;
        }

        // Step 1.5: Check Additional Costs (e.g. Goremand's sacrifice)
        const interactiveResult = SpellInteractiveManager.handleInteractiveCosts(state, playerId, cardToPlay, additionalCosts, declaredTargets, cardInstanceId, parentContext, isFreeCast, exileOnResolution);
        if (interactiveResult === true) return true; // Flow paused for input
        if (interactiveResult === null) return false; // Illegal play, stop

        // Step 1.7: Check Mode Selection (Charms/Comands)
        if (modalAbility && !hasPreSelectedMode) {


            let minChoices = modalAbility.minChoices || 1;
            let maxChoices = modalAbility.maxChoices || 1;

            if ((modalAbility as any).chooseBothCondition) {
                const { condition: ConditionProcessor } = getProcessors(state);
                const met = ConditionProcessor.matchesCondition(state, (modalAbility as any).chooseBothCondition, {
                    sourceId: cardToPlay.id,
                    controllerId: playerId,
                    stackObject: { id: cardToPlay.id, card: cardToPlay, controllerId: playerId } as any
                });
                if (met) {
                    maxChoices = modalAbility.modes!.length;
                    logger.debug(state, LogCategory.ACTION, `[MODAL] Commander condition met: You may choose all ${maxChoices} modes.`);
                }
            }

            const choices = modalAbility.modes!.map((mode: any, idx: number) => {
                const isSelectable = !mode.targetDefinition ||
                    (mode.targetDefinition as any).optional ||
                    TargetingProcessor.hasLegalTargets(state, cardToPlay.id, mode.targetDefinition, playerId);

                return {
                    label: mode.label || `Mode ${idx + 1}`,
                    value: `MODE_SELECTION_${idx}`,
                    selectable: isSelectable
                };
            });

            const { action: ActionProcessor } = getProcessors(state);
            state.pendingAction = ActionProcessor.prepareAction(state, {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: modalAbility.label || 'Choose options',
                    choices: choices,
                    minChoices: minChoices,
                    maxChoices: maxChoices,
                    isSpellCasting: true,
                    isModeSelection: true,
                    allowDuplicates: modalAbility.allowDuplicates,
                    declaredTargets: declaredTargets || []
                }
            });
            logger.debug(state, LogCategory.ACTION, `[MODAL] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        // Step 2: Check Modal Choice
        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            // Trigger choice phase (targets are already in declaredTargets if we are here)
            const choiceEffect = spellEffects[choiceEffectIndex];
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: choiceEffect.label || 'Choose an option',
                    choices: choiceEffect.choices,
                    minChoices: choiceEffect.minChoices || 1,
                    maxChoices: choiceEffect.maxChoices || 1,
                    isSpellCasting: true,
                    declaredTargets: declaredTargets || []
                }
            };
            logger.debug(state, LogCategory.ACTION, `[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        // Step 3: Finalization
        return SpellProcessor.finalizeSpellCast(state, engine, {
            playerId,
            cardToPlay,
            totalMana,
            additionalCosts,
            declaredTargets,
            spellEffects,
            targetDefinition,
            isFirstInstantOrSorcery,
            isInstantOrSorcery,
            isFreeCast,
            parentContext
        });
    }

    public static activateAbility(
        state: GameState,
        engine: EngineContext,
        options: ActivateAbilityOptions
    ): boolean {
        const { playerId, cardId, abilityIndex, targets: declaredTargets = [], bypassPriority = false, choiceIndex, bypassTargeting = false, xValue, parentContext, exileOnResolution } = options;
        const { logger, targeting: TargetingProcessor, trigger: TriggerProcessor } = getProcessors(state);
        const obj = RuleUtils.findObject(state, cardId);
        if (!obj) return false;

        // Apply incoming xValue if provided
        if (xValue !== undefined) {
            obj.xValue = xValue;
        }

        const player = state.players[playerId];
        if (!player) return false;

        if (!bypassPriority && String(state.priorityPlayerId) !== String(playerId)) {
            logger.debug(state, LogCategory.ACTION, `Tried to activate ability without priority.`);
            return false;
        }

        // ARCHITECTURAL NOTE: Bypassing Pending Actions
        // When bypassTargeting is true (during auto-tap), we ignore the presence of other 
        // pending actions. This is necessary because land-tapping often triggers 
        // sub-effects (like choice modals) which we have already pre-resolved.
        if (state.pendingAction && !bypassPriority) {
            logger.debug(state, LogCategory.ACTION, `Cannot activate ability: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        const cardLogic = oracle.getCard(obj.definition.name);
        let abilities: AbilityDefinition[] = [...(cardLogic?.abilities || [])];
        if (obj.definition.abilities) {
            obj.definition.abilities.forEach((a: AbilityDefinition | string) => {
                if (typeof a === 'string') return;
                const isDuplicate = abilities.some(existing => {
                    if (existing.id !== undefined && a.id !== undefined) return existing.id === a.id;
                    // Fallback for abilities without IDs (check type and structural effects)
                    return existing.type === a.type &&
                        JSON.stringify(existing.effects) === JSON.stringify(a.effects) &&
                        JSON.stringify(existing.costs) === JSON.stringify(a.costs);
                });
                if (!isDuplicate) {
                    abilities.push(a);
                }
            });
        }

        if (!abilities[abilityIndex]) {
            logger.info(state, LogCategory.ACTION, `[ERROR] Ability index ${abilityIndex} not found for ${obj.definition.name}`);
            return false;
        }

        const ability = abilities[abilityIndex];
        if (ability.type !== AbilityType.Activated) {
            logger.info(state, LogCategory.ACTION, `[ERROR] Ability index ${abilityIndex} for ${obj.definition.name} is not an activated ability (found ${ability.type})`);
            return false;
        }

        // Step 1: Preliminary Validation (Zone, Costs, Requirements, Limits)
        if (!SpellValidator.validateAbilityActivation(state, playerId, obj, ability, abilityIndex)) {
            return false;
        }

        // Step 1.5: Choose X
        if (SpellInteractiveManager.handleAbilityXChoice(state, playerId, obj, abilityIndex, declaredTargets)) {
            return true;
        }

        // Step 1.6: Speed/Timing Check
        if (!SpellValidator.validateAbilitySpeed(state, playerId, obj, ability, cardLogic)) {
            return false;
        }

        // Step 2: Interactive Cost Selection
        const costResult = SpellInteractiveManager.handleAbilityInteractiveCosts(state, playerId, obj, ability, abilityIndex, declaredTargets);
        if (costResult === true) return true;
        if (costResult === false) return false;

        // Step 3: Targeting (Rule 602.2b)
        if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && !bypassTargeting) {
            const targetingResult = SpellInteractiveManager.handleAbilityTargeting(state, playerId, cardId, obj, ability, abilityIndex, engine, choiceIndex, parentContext, exileOnResolution);
            if (targetingResult) return true; // Handled pending action or single target recursion
        }

        // Step 4: Finalization (Rule 602.2h)
        return SpellProcessor.finalizeAbilityActivation(state, engine, {
            playerId,
            obj,
            ability,
            abilityIndex,
            declaredTargets: declaredTargets || [],
            preSelectedChoice: choiceIndex,
            parentContext,
            exileOnResolution
        });
    }

    public static finalizeSpellCast(
        state: GameState,
        engine: EngineContext,
        options: FinalizeCastOptions
    ): boolean {
        const { playerId, cardToPlay, totalMana, additionalCosts, declaredTargets, spellEffects, targetDefinition, isFirstInstantOrSorcery, isInstantOrSorcery, isFreeCast, parentContext } = options;
        const player = state.players[playerId];
        const { logger, action: ActionProcessor, trigger: TriggerProcessor } = getProcessors(state);

        // Modal Choice check (modes like "Choose one")
        const choiceEffectIndex = spellEffects.findIndex((e, idx) =>
            e.type === EffectType.Choice &&
            e.choices &&
            !e.targetMapping &&
            (!e.choices.some((c: any) => c.costs && c.costs.length > 0))
        );
        const hasPreSelectedChoice = state.interaction?.lastChoiceIndex !== undefined;

        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            const choiceEffect = spellEffects[choiceEffectIndex];
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: choiceEffect.label || 'Choose an option',
                    choices: choiceEffect.choices,
                    minChoices: choiceEffect.minChoices || 1,
                    maxChoices: choiceEffect.maxChoices || 1,
                    isSpellCasting: true,
                    declaredTargets: declaredTargets || []
                }
            };
            logger.debug(state, LogCategory.ACTION, `[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        const preSelectedChoice = state.interaction?.lastChoiceIndex;
        if (state.interaction) {
            delete state.interaction.lastChoiceIndex;
            delete state.interaction.consumedModeIndex;
        }

        // Pay Mana
        const hasConfirmedAutoTap = state.interaction?.confirmedAutoTap;
        if (state.interaction) delete state.interaction.confirmedAutoTap;

        if (isFreeCast) {
            logger.debug(state, LogCategory.ACTION, `[DEBUG] Finalizing free cast for ${cardToPlay.definition.name}. Bypassing mana check.`);
        } else if (!ManaProcessor.canPayManaCost(player, totalMana, state, cardToPlay)) {
            if (ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana, cardToPlay)) {
                if (hasConfirmedAutoTap) {
                    logger.debug(state, LogCategory.ACTION, `Using pre-confirmed auto-tap for ${totalMana}...`);
                    ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, engine, cardToPlay);
                } else {
                    logger.debug(state, LogCategory.ACTION, `Auto-tapping lands to pay ${totalMana}...`);
                    const manaSnapshot = JSON.parse(JSON.stringify(player.manaPool));
                    const restrictedSnapshot = JSON.parse(JSON.stringify(player.restrictedMana || []));
                    const { tappedIds, producedMana } = ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, engine, cardToPlay);

                    if (tappedIds.length > 0) {
                        state.pendingAction = {
                            type: ActionType.ModalSelection,
                            playerId: playerId,
                            sourceId: cardToPlay.id,
                            data: {
                                label: `Confirm auto-tap for ${cardToPlay.definition.name}?`,
                                choices: [
                                    { label: `Confirm Cast (${totalMana})`, value: 'confirm' }
                                ],
                                isSpellCasting: true,
                                confirmedAutoTap: true,
                                totalMana,
                                declaredTargets: declaredTargets || [],
                                tappedLandIds: tappedIds,
                                producedMana,
                                manaSnapshot,
                                restrictedSnapshot
                            }
                        };
                        return true;
                    }
                }
            } else {
                logger.info(state, LogCategory.ACTION, `Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Effective Cost: ${totalMana})`);
                return false;
            }
        }

        logger.debug(state, LogCategory.ACTION, `[FINAL-DEBUG] Proceeding with finalization for ${cardToPlay.definition.name}.`);

        logger.debug(state, LogCategory.ACTION, isFreeCast ? `Casting ${cardToPlay.definition.name} for free...` : `Paying ${totalMana} for ${cardToPlay.definition.name}...`);
        const colorsSpent = isFreeCast ? [] : ManaProcessor.deductManaCost(player, totalMana, state, cardToPlay);
        cardToPlay.colorsSpent = colorsSpent;
        cardToPlay.convergeAmount = colorsSpent.length;

        // Pay Additional Costs
        additionalCosts.forEach((cost) => {
            if (cost.type === 'Sacrifice') {
                const chosenId = state.interaction?.lastChosenSacrificeId;
                const obj = state.battlefield.find(o => o.id === (chosenId || cardToPlay.id));
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: TriggerEvent.Sacrifice, playerId, sourceId: obj.id, payload: { object: obj } });
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId);
                    logger.debug(state, LogCategory.ACTION, `Paid additional cost: Sacrificed ${obj.definition.name}.`);
                    if ((cost as any).isCasualty && state.interaction) state.interaction.paidCasualtyFor = cardToPlay.id;
                }
            } else if (cost.type === 'Discard') {
                const chosenId = state.interaction?.lastChosenDiscardId;
                const obj = player.hand.find(o => o.id === chosenId);
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: TriggerEvent.Discard, playerId, payload: { object: obj, sourceId: cardToPlay.id } });
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId);
                    logger.debug(state, LogCategory.ACTION, `Paid additional cost: Discarded ${obj.definition.name}.`);
                }
            } else if (cost.type === 'PayLife') {
                const lifeVal = cost.value === 'X' ? (cardToPlay.xValue || 0) : (parseInt(cost.value as string) || 0);
                player.life -= lifeVal;
                TriggerProcessor.onEvent(state, { type: TriggerEvent.LifeLoss, playerId, amount: lifeVal });
                logger.debug(state, LogCategory.ACTION, `Paid additional cost: ${lifeVal} life.`);
            } else if (cost.type === 'Exile') {
                const chosenIds = state.interaction?.lastChosenExileIds || [];
                chosenIds.forEach((cid: string) => {
                    const obj = RuleUtils.findObject(state, cid);
                    if (obj) {
                        ActionProcessor.moveCard(state, obj, Zone.Exile, playerId);
                        logger.debug(state, LogCategory.ACTION, `Paid additional cost: Exiled ${obj.definition?.name || cid}.`);
                    }
                });
            } else if (cost.type === 'TapSelection') {
                const chosenIds = state.interaction?.lastChosenTapSelectionIds || [];
                chosenIds.forEach((cid: string) => {
                    const obj = state.battlefield.find(o => o.id === cid);
                    if (obj) {
                        obj.isTapped = true;
                        TriggerProcessor.onEvent(state, { type: TriggerEvent.Tap, sourceId: obj.id, playerId: playerId, payload: { object: obj } });
                        logger.debug(state, LogCategory.ACTION, `Paid additional cost: Tapped ${obj.definition.name}.`);
                    }
                });
            }
        });

        // Cleanup temporary selection state
        if (state.interaction) {
            delete state.interaction.lastChosenSacrificeId;
            delete state.interaction.lastChosenDiscardId;
            delete state.interaction.lastChosenExileIds;
            delete state.interaction.lastChosenTapSelectionIds;
            delete state.interaction.lastChosenCostChoiceIndex;
            delete state.interaction.lastChosenModeIndex;
        }

        // Move to Stack
        const lastZone = cardToPlay.zone;
        if (!cardToPlay.isPreparedCopy) {
            ActionProcessor.moveCard(state, cardToPlay, Zone.Stack, playerId);
        } else {
            const { registry: RegistryProcessor, lki: LkiProcessor } = getProcessors(state);
            logger.debug(state, LogCategory.ACTION, `[PREPARED-DEBUG] Casting ${cardToPlay.definition.name} from virtual origin: ${lastZone}`);
            LkiProcessor.saveSnapshot(state, cardToPlay, lastZone);
            cardToPlay.zone = Zone.Stack;
            RegistryProcessor.registerAbilities(state, cardToPlay);
        }

        cardToPlay.paidCost = totalMana;
        cardToPlay.paidManaValue = ManaProcessor.getManaValue(totalMana);

        // Limit tracking
        if (cardToPlay.paidCost === "{0}" && cardToPlay.usedAlternativeCostId) {
            const effectId = cardToPlay.usedAlternativeCostId;
            state.turnState.triggeredAbilitiesUsedThisTurn[effectId] = (state.turnState.triggeredAbilitiesUsedThisTurn[effectId] || 0) + 1;
        }

        // Unprepare source if MDFC/SOS
        if (cardToPlay.isPreparedCopy && cardToPlay.sourceCreatureId) {
            const source = state.battlefield.find(o => o.id === cardToPlay.sourceCreatureId);
            if (source) source.isPrepared = false;
        }

        if (isInstantOrSorcery) state.turnState.instantOrSorceryCastThisTurn[playerId] = true;
        state.turnState.spellsCastThisTurn[playerId] = (state.turnState.spellsCastThisTurn[playerId] || 0) + 1;

        // Triggers: ON_SECOND_SPELL_CAST, etc.
        if (state.turnState.spellsCastThisTurn[playerId] === 2) TriggerProcessor.onEvent(state, { type: TriggerEvent.SecondSpellCast, playerId, payload: {} });
        if (state.turnState.spellsCastThisTurn[playerId] === 3) TriggerProcessor.onEvent(state, { type: TriggerEvent.ThirdSpellCast, playerId, payload: {} });

        // Track game-wide cast counts
        if (!state.gameStats) state.gameStats = { castCounts: {} };
        if (!state.gameStats.castCounts[playerId]) state.gameStats.castCounts[playerId] = {};
        const cardName = cardToPlay.definition.name;
        state.gameStats.castCounts[playerId][cardName] = (state.gameStats.castCounts[playerId][cardName] || 0) + 1;

        const exileOnResolution = (state.ruleRegistry.continuousEffects.some(e =>
            e.exileOnMoveToGraveyard && (e.targetIds?.includes(cardToPlay.id) || (e.targetMapping === 'CONTROLLER' && e.controllerId === playerId))
        )) || cardToPlay.isFlashbackCast || cardToPlay.definition?.exileOnResolution || cardToPlay.exileOnResolution;

        logger.debug(state, LogCategory.ACTION, `[FINALIZE-DEBUG] ${cardToPlay.definition.name}: cardToPlay.exileOnRes=${cardToPlay.exileOnResolution}, final=${exileOnResolution}`);

        const targetsControllers = (declaredTargets || []).map((tid) => {
            const obj = RuleUtils.findObject(state, tid);
            return obj ? obj.controllerId : null;
        });

        logger.debug(state, LogCategory.ACTION, `[FINAL-PLAY-LOG] Finalizing ${cardToPlay.definition.name} with ${declaredTargets.length} targets: [${declaredTargets.join(', ')}]`);

        const stackObj = {
            id: `spell_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            controllerId: playerId,
            sourceId: cardToPlay.id,
            type: 'Spell' as const,
            targets: declaredTargets || [],
            card: cardToPlay,
            definition: cardToPlay.definition,
            name: cardToPlay.definition.name + (cardToPlay.xValue !== undefined ? ` (X=${cardToPlay.xValue})` : ""),
            cannotBeCopied: cardToPlay.definition.cannotBeCopied,
            xValue: cardToPlay.xValue,
            image_url: cardToPlay.definition.image_url,
            exileOnResolution: exileOnResolution,
            isCopy: cardToPlay.isCopy,
            isPreparedCopy: cardToPlay.isPreparedCopy,
            isFlashbackCast: cardToPlay.isFlashbackCast,
            data: {
                effects: spellEffects,
                targetDefinition,
                preSelectedChoice,
                targetsControllers,
                declaredXValue: cardToPlay.xValue,
                summary: cardToPlay.xValue !== undefined ? `X = ${cardToPlay.xValue}` : undefined,
                choices: cardToPlay.xValue !== undefined ? [{ label: "X", value: cardToPlay.xValue }] : []
            }
        };

        state.stack.push(stackObj);
        logger.info(state, LogCategory.STACK, `--------------------------------------------------`);
        logger.info(state, LogCategory.STACK, `[STACK] + ${player.name} cast ${cardToPlay.definition.name}${cardToPlay.xValue !== undefined ? ` (X=${cardToPlay.xValue})` : ''} for ${totalMana}`);
        logger.info(state, LogCategory.STACK, `--------------------------------------------------`);

        // Casualty
        if (state.interaction?.paidCasualtyFor === cardToPlay.id) {
            delete state.interaction.paidCasualtyFor;
            state.stack.push({
                id: `casualty_trigger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                controllerId: playerId,
                sourceId: stackObj.id,
                type: AbilityType.Triggered,
                name: `Casualty Copy (${stackObj.definition.name})`,
                image_url: stackObj.definition.image_url,
                targets: [],
                data: { effects: [{ type: EffectType.CopySpellOnStack, targetMapping: 'SOURCE_OBJECT', chooseNewTargets: true }] }
            });
            logger.info(state, LogCategory.TRIGGER, `[CASUALTY] Copy trigger for ${stackObj.definition.name} placed on stack.`);
        }


        // Fire targeting triggers
        (declaredTargets || []).forEach((tid) => {
            TriggerProcessor.onEvent(state, { type: TriggerEvent.BecomeTarget, playerId, targetId: tid, sourceId: stackObj.id, data: { sourceId: stackObj.id, sourceCard: cardToPlay } });
        });

        state.consecutivePasses = 0;
        TriggerProcessor.onEvent(state, { type: TriggerEvent.CastSpell, playerId, amount: cardToPlay.paidManaValue || 0, payload: { card: cardToPlay, sourceId: cardToPlay.id } });

        if (isFirstInstantOrSorcery) TriggerProcessor.onEvent(state, { type: TriggerEvent.CastFirstInstantOrSorcery, playerId, amount: cardToPlay.paidManaValue || 0, payload: { card: cardToPlay, sourceId: cardToPlay.id } });
        if (isInstantOrSorcery) TriggerProcessor.onEvent(state, { type: TriggerEvent.CastInstantOrSorcery, playerId, amount: cardToPlay.paidManaValue || 0, payload: { card: cardToPlay, sourceId: cardToPlay.id } });

        if (!RuleUtils.isCreature(cardToPlay)) {
            TriggerProcessor.onEvent(state, { type: TriggerEvent.CastNonCreature, playerId, payload: { object: cardToPlay, sourceId: cardToPlay.id } });
        }

        logger.info(state, LogCategory.STACK, `[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}${cardToPlay.xValue !== undefined ? ` (X=${cardToPlay.xValue})` : ''} for ${totalMana}${declaredTargets?.length ? ' targeting ' + declaredTargets.join(', ') : ''}`);
        if (!state.pendingAction) {
            if (options.parentContext) {
                return engine.resumeResolution(cardToPlay.id, stackObj, options.parentContext);
            }
            engine.checkStateBasedActions();
            engine.resetPriorityToActivePlayer();
        }
        return true;
    }

    public static finalizeAbilityActivation(
        state: GameState,
        engine: EngineContext,
        options: FinalizeAbilityOptions
    ): boolean {
        const { playerId, obj, ability, abilityIndex, declaredTargets, preSelectedChoice, parentContext, exileOnResolution } = options;
        const { logger } = getProcessors(state);
        const playerObj = state.players[playerId];

        const stackId = `ability_${Date.now()}`;
        // ARCHITECTURAL NOTE: Choice Propagation (Egress)
        // If the auto-tap engine pre-calculated a choice (e.g. which color a dual land produced),
        // it is passed here so ChoiceEffectHandler can skip the UI modal.
        const stackObj = {
            id: stackId,
            controllerId: playerId,
            sourceId: obj.id,
            type: AbilityType.Activated,
            name: `${obj.definition.name} Ability${obj.xValue !== undefined ? ` (X=${obj.xValue})` : ""}`,
            image_url: obj.definition.image_url,
            targets: declaredTargets,
            abilityIndex: abilityIndex,
            exileOnResolution: exileOnResolution,
            isCopy: obj.isCopy,
            isPreparedCopy: obj.isPreparedCopy,
            xValue: obj.xValue,
            card: obj,
            definition: obj.definition,
            preSelectedChoice: preSelectedChoice,
            data: {
                effects: (ability as any).effects || [],
                targetDefinition: (ability as any).targetDefinition,
                preSelectedChoice,
                declaredXValue: obj.xValue,
                summary: obj.xValue !== undefined ? `X = ${obj.xValue}` : undefined,
                choices: obj.xValue !== undefined ? [{ label: "X", value: obj.xValue }] : []
            }
        };

        // Mana Payment
        const manaCost = (ability.costs || []).find((cost) => cost.type === 'Mana');
        if (manaCost) {
            const effectiveMana = CostProcessor.getEffectiveManaCost(state, manaCost, obj, stackObj);
            if (!ManaProcessor.canPayManaCost(playerObj, effectiveMana, state)) {
                if (ManaProcessor.canPayWithTotal(playerObj, state.battlefield, effectiveMana)) {
                    logger.info(state, LogCategory.MANA, `Auto-tapping lands to pay ability cost ${effectiveMana}...`);
                    ManaProcessor.autoTapLandsForCost(state, playerId, effectiveMana, engine);
                }
            }
        }

        CostProcessor.pay(state, ability.costs || [], obj.id, playerId);

        // Clean up choice flags
        if (state.interaction) {
            delete state.interaction.lastChosenSacrificeId;
            delete state.interaction.lastChosenDiscardId;
        }

        obj.abilitiesUsedThisTurn++;
        if ((ability as any).limitPerTurn) {
            const usageKey = `ability_${obj.id}_${abilityIndex}`;
            state.turnState.triggeredAbilitiesUsedThisTurn[usageKey] = (state.turnState.triggeredAbilitiesUsedThisTurn[usageKey] || 0) + 1;
        }

        if (ability.isManaAbility) {
            const { effect: EffectProcessor } = getProcessors(state);
            (ability.effects || []).forEach((eff) => {
                EffectProcessor.executeEffect({
                    state,
                    effect: eff,
                    sourceId: obj.id,
                    validTargetIds: [],
                    stackObject: stackObj as any
                });
            });
            logger.info(state, LogCategory.ACTION, `Activated mana ability of ${obj.definition.name}`);
            return true;
        }

        const manaCostRef = (ability.costs || []).find((cost) => cost.type === 'Mana');
        const effectiveMana = manaCostRef ? CostProcessor.getEffectiveManaCost(state, manaCostRef, obj, stackObj) : "";
        const costLabel = effectiveMana ? ` for ${effectiveMana}` : "";

        state.stack.push(stackObj);
        logger.info(state, LogCategory.ACTION, `Activated ability of ${obj.definition.name}${obj.xValue !== undefined ? ` (X=${obj.xValue})` : ''}${costLabel}`);
        declaredTargets.forEach((tid) => {
            const { trigger: TriggerProc } = getProcessors(state);
            TriggerProc.onEvent(state, { type: TriggerEvent.BecomeTarget, playerId, targetId: tid, sourceId: stackId, data: { sourceId: stackId, sourceCard: obj } });
        });

        state.consecutivePasses = 0;
        // --- RESUME RESOLUTION ---
        if (!state.pendingAction && options.parentContext) {
            return engine.resumeResolution(obj.id, stackObj, options.parentContext);
        }

        if (!state.pendingAction) {
            engine.checkStateBasedActions();
            engine.resetPriorityToActivePlayer();
        }
        return true;
    }

    /**
     * Facade proxy: Exposes cost calculation to external modules (e.g., AI, CostProcessor)
     * that historically imported SpellProcessor.getEffectiveCosts directly.
     */
    public static getEffectiveCosts(state: GameState, card: GameObject, targets: string[] = [], overrideDefinition?: any, forceFlashback?: boolean, overrideStats?: any): { totalMana: string, additionalCosts: AbilityCost[], usedAlternativeCostId?: string } {
        return SpellCostCalculator.getEffectiveCosts(state, card, targets, overrideDefinition, forceFlashback, overrideStats);
    }
}
