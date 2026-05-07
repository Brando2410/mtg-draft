import {
    AbilityCost,
    AbilityDefinition,
    AbilityType,
    ActionType,
    BaseEntity,
    ContinuousEffect,
    EffectDefinition,
    EffectType,
    GameObject,
    GameState,
    StackObject,
    TargetMapping,
    TriggerEvent,
    Zone,
    PlayerId
} from '@shared/engine_types';
import { ModalEffect, ResolutionContext } from '@shared/types/effects';
import { LogCategory } from '../../../utils/EngineLogger';
import {
    ActivateAbilityOptions,
    EngineContext,
    FinalizeAbilityOptions,
    FinalizeCastOptions,
    PlayCardOptions
} from '../../../interfaces/EngineContext';
import { RegistryUtils } from '../../../utils/RegistryUtils';
import { oracle } from '../../../OracleLogicMap';
import { RuleUtils } from "../../../utils/RuleUtils";
import { SpellCostCalculator } from './SpellCostCalculator';
import { SpellInteractiveManager } from './SpellInteractiveManager';
import { SpellValidator } from './SpellValidator';
import { getProcessors } from '../../ProcessorRegistry';
import { ManaProcessor } from '../../magic/ManaProcessor';

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
            delete cardToPlay.isFreeCast;
        }

        if (exileOnResolution) {
            console.log(`[PLAY-DEBUG] Setting exileOnResolution=true for ${cardToPlay.definition.name}`);
            cardToPlay.exileOnResolution = true;
        } else {
            delete cardToPlay.exileOnResolution;
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

        // --- HAND ACTION SELECTION (e.g. Visionary's Dance, Channel, Cycling) ---
        // If the card is in hand and has multiple playable actions (1 spell + 1+ activated abilities in hand),
        // we must prompt the user to choose.
        if (cardToPlay.zone === Zone.Hand && !bypassPriority && !options.isAbilitySelectionBypassed) {
            const { priority: PriorityProcessor } = getProcessors(state);
            
            // 1. Find all activated abilities that can be played from hand
            const activatableAbilities = (cardToPlay.definition.abilities || []).map((a, idx) => ({ a, idx })).filter(({ a }) => 
                typeof a !== 'string' && a.type === AbilityType.Activated && (a.activeZone === Zone.Hand || (Array.isArray(a.activeZone) && a.activeZone.includes(Zone.Hand)))
            );

            // Filter for actually activatable ones (mana check, etc)
            const validAbilities = activatableAbilities.filter(({ idx }) => 
                PriorityProcessor.canAbilityBeActivated(state, playerId, cardToPlay.id, idx, bypassPriority)
            );

            const isSpellPlayable = PriorityProcessor.canObjectBePlayed(state, playerId, cardToPlay.id, bypassPriority);

            // CASE A: Multiple valid abilities OR (1+ abilities AND spell is playable) -> Show Modal
            if (validAbilities.length > 1 || (validAbilities.length > 0 && isSpellPlayable)) {
                const { choiceGenerator: ChoiceGenerator, action: ActionProcessor } = getProcessors(state);
                const choices: any[] = [];
                
                if (isSpellPlayable) {
                    choices.push({ label: `Cast ${cardToPlay.definition.name} (${currentDefinition.manaCost || '0'})`, value: 'PLAY_ACTION_SPELL' });
                }

                choices.push(...validAbilities.map(({ a, idx }) => {
                    const ability = a as import('@shared/engine_types').AbilityDefinition;
                    return {
                        label: `Activate Ability: ${ability.label || (ability as any).manaCost || 'Alternative Mode'}`,
                        value: `PLAY_ACTION_ABILITY_${idx}`
                    };
                }));

                state.pendingAction = ActionProcessor.prepareAction(state, ChoiceGenerator.createModalChoice(state, {
                    label: `Choose mode for ${cardToPlay.definition.name}`,
                    playerId: playerId,
                    sourceId: cardToPlay.id,
                    actionType: ActionType.ModalSelection
                }, choices));
                state.priorityPlayerId = null;
                return true;
            }

            // CASE B: Exactly one valid ability and spell is NOT playable -> Auto-redirect
            if (validAbilities.length === 1 && !isSpellPlayable) {
                const { idx } = validAbilities[0];
                logger.info(state, LogCategory.ACTION, `[HAND-AUTO] Auto-redirecting to activated ability for ${cardToPlay.definition.name} (Spell not playable).`);
                return getProcessors(state).spell.activateAbility(state, engine, {
                    playerId,
                    cardId: cardToPlay.id,
                    abilityIndex: idx,
                    targets: declaredTargets,
                    bypassPriority: true
                });
            }
        }

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
        const logic = RegistryUtils.getEffectiveLogic(state, cardToPlay);
        const { effects: spellEffects, targetDefinitions } = RegistryUtils.getEffectivePayload(state, cardToPlay);
        const modalAbility = RegistryUtils.getModalAbility(logic, currentDefinition);

        const hasPreSelectedChoice = state.interaction?.lastChoiceIndex !== undefined;
        const lastChosenModeIndex = state.interaction?.lastChosenModeIndex;
        const hasPreSelectedMode = lastChosenModeIndex !== undefined;

        const choiceEffectIndex = spellEffects.findIndex((e: EffectDefinition, idx: number) =>
            e.type === EffectType.Choice &&
            (e as ModalEffect).choices &&
            !e.targetMapping &&
            idx === 0 &&
            (!(e as ModalEffect).choices?.some((c) => c.costs && c.costs.length > 0))
        );

        // Step 0.5: Check for X in cost or inherent logic
        const costStr = (currentDefinition.manaCost || '').split('//')[0].trim();

        // Safely check for X in pre-selected modal modes
        let modeHasX = false;
        if (hasPreSelectedMode && modalAbility?.modes) {
            const index = (Array.isArray(lastChosenModeIndex) ? lastChosenModeIndex[0] : lastChosenModeIndex);
            const chosenMode = modalAbility.modes[index];
            if (chosenMode) {
                modeHasX = JSON.stringify(chosenMode).includes('"X"');
            }
        }

        // X-Value Selection
        const needsX = costStr.includes('{X}') ||
            logic?.abilities?.some((a) => typeof a !== 'string' && (a.costs || a.additionalCosts)?.some((c) => c.value === 'X')) ||
            currentDefinition.abilities?.some((a) => typeof a !== 'string' && (a.costs || a.additionalCosts)?.some((c) => c.value === 'X')) ||
            logic?.effects?.some((e) => JSON.stringify(e).includes('"X"')) ||
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
        let { totalMana, additionalCosts, usedAlternativeCostId, isFlashback } = SpellCostCalculator.getEffectiveCosts(state, cardToPlay, declaredTargets, currentDefinition);
        cardToPlay.usedAlternativeCostId = usedAlternativeCostId;
        if (isFlashback) cardToPlay.isFlashbackCast = true;

        // Step 0.8: Hybrid Mana Choice
        if (SpellProcessor.handleHybridManaChoices(state, playerId, cardToPlay, totalMana, declaredTargets, parentContext, isFreeCast, exileOnResolution)) {
            return true;
        }

        // Apply hybrid mana choices to totalMana
        if (state.interaction?.manaChoices && Object.keys(state.interaction.manaChoices).length > 0) {
            const symbols = totalMana.match(/\{([^}]+)\}/g) || [];
            let newManaStr = "";
            let hasHybrids = false;
            symbols.forEach((s, idx) => {
                if (s.includes('/')) {
                    hasHybrids = true;
                    const chosen = state.interaction!.manaChoices![idx];
                    newManaStr += chosen ? `{${chosen}}` : s;
                } else {
                    newManaStr += s;
                }
            });
            if (hasHybrids) totalMana = newManaStr;
        }

        // --- SETUP SEQUENCE: TARGETING -> CHOICE -> FINALIZATION ---

        // Step 1: Check Targeting
        const totalTargetCounts = targetDefinitions ? TargetingProcessor.calculateTotalCounts(targetDefinitions, cardToPlay.xValue || 0) : { maxCount: 0 };

        if (targetDefinitions && (!declaredTargets || declaredTargets.length < totalTargetCounts.maxCount) && !bypassTargeting) {
            const result = SpellInteractiveManager.handleTargetingChoice(state, playerId, cardToPlay, targetDefinitions, totalMana, cardInstanceId, engine, parentContext, isFreeCast, exileOnResolution, declaredTargets);
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

            if (modalAbility.chooseBothCondition) {
                const { condition: ConditionProcessor } = getProcessors(state);
                const met = ConditionProcessor.matchesCondition(state, (modalAbility as AbilityDefinition).chooseBothCondition, {
                    sourceId: cardToPlay.id,
                    controllerId: playerId,
                    stackObject: { id: cardToPlay.id, card: cardToPlay, controllerId: playerId } as any as StackObject,
                    targets: []
                });
                if (met) {
                    maxChoices = modalAbility.modes!.length;
                    logger.debug(state, LogCategory.ACTION, `[MODAL] Commander condition met: You may choose all ${maxChoices} modes.`);
                }
            }

            const choices = modalAbility.modes!.map((mode: any, idx: number) => {
                const isSelectable = !mode.targetDefinitions ||
                    mode.targetDefinitions.optional ||
                    TargetingProcessor.hasLegalTargets(state, cardToPlay.id, mode.targetDefinitions, playerId);

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
            const choiceEffect = spellEffects[choiceEffectIndex] as ModalEffect;
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
            targetDefinitions,
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
        if (xValue !== undefined && RuleUtils.isEntity(obj)) {
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

        if (!RuleUtils.isEntity(obj)) return false;
        const definition = obj.definition;

        const cardLogic = oracle.getCard(definition.name);
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(obj as GameObject, state);

        let abilities: AbilityDefinition[] = [];
        if (cardLogic?.abilities) {
            cardLogic.abilities.forEach(a => {
                if (typeof a !== 'string') abilities.push(a);
            });
        }
        if (definition.abilities) {
            definition.abilities.forEach((a: AbilityDefinition | string) => {
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

        // Include abilities from effectiveStats (Continuous Effects)
        if (stats.abilities) {
            stats.abilities.forEach((a: any) => {
                if (typeof a === 'string') return;
                const isDuplicate = abilities.some(existing => {
                    if (existing.id !== undefined && a.id !== undefined) return existing.id === a.id;
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
            logger.info(state, LogCategory.ACTION, `[ERROR] Ability index ${abilityIndex} not found for ${definition.name}`);
            return false;
        }

        const ability = abilities[abilityIndex];
        if (ability.type !== AbilityType.Activated) {
            logger.info(state, LogCategory.ACTION, `[ERROR] Ability index ${abilityIndex} for ${definition.name} is not an activated ability (found ${ability.type})`);
            return false;
        }

        // Step 1: Preliminary Validation (Zone, Costs, Requirements, Limits)
        if (!SpellValidator.validateAbilityActivation(state, playerId, obj as GameObject, ability, abilityIndex)) {
            return false;
        }

        // Step 1.5: Choose X
        if (SpellInteractiveManager.handleAbilityXChoice(state, playerId, obj as GameObject, abilityIndex, declaredTargets)) {
            return true;
        }

        // Step 1.6: Speed/Timing Check
        if (!SpellValidator.validateAbilitySpeed(state, playerId, obj as GameObject, ability, cardLogic)) {
            return false;
        }

        // Step 2: Interactive Cost Selection
        const costResult = SpellInteractiveManager.handleAbilityInteractiveCosts(state, playerId, obj as GameObject, ability, abilityIndex, declaredTargets);
        if (costResult === true) return true;
        if (costResult === false) return false;

        // Step 3: Targeting (Rule 602.2b)
        if (ability.targetDefinitions && (declaredTargets === undefined || declaredTargets.length === 0) && !bypassTargeting) {
            const targetingResult = SpellInteractiveManager.handleAbilityTargeting(state, playerId, cardId, obj as GameObject, ability, abilityIndex, engine, choiceIndex, parentContext, exileOnResolution);
            if (targetingResult) return true; // Handled pending action or single target recursion
        }

        // Step 4: Finalization (Rule 602.2h)
        return SpellProcessor.finalizeAbilityActivation(state, engine, {
            playerId,
            obj: obj as GameObject,
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
        const { playerId, cardToPlay, totalMana, additionalCosts, declaredTargets, spellEffects, targetDefinitions, isFirstInstantOrSorcery, isInstantOrSorcery, isFreeCast, parentContext } = options;
        const player = state.players[playerId];
        const { logger, action: ActionProcessor, trigger: TriggerProcessor } = getProcessors(state);

        // Modal Choice check (modes like "Choose one")
        const choiceEffectIndex = spellEffects.findIndex((e, idx) =>
            e.type === EffectType.Choice &&
            (e as ModalEffect).choices &&
            !e.targetMapping &&
            (!(e as ModalEffect).choices?.some((c) => c.costs && c.costs.length > 0))
        );
        const hasPreSelectedChoice = state.interaction?.lastChoiceIndex !== undefined;

        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            const choiceEffect = spellEffects[choiceEffectIndex] as ModalEffect;
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
        }

        // Pay Mana
        const hasConfirmedAutoTap = state.interaction?.flags.confirmedAutoTap;
        if (state.interaction) delete state.interaction.flags.confirmedAutoTap;

        const { mana: ManaProcessor } = getProcessors(state);
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
        const colorsSpent = isFreeCast ? [] : getProcessors(state).mana.deductManaCost(player, totalMana, state, cardToPlay);
        cardToPlay.colorsSpent = colorsSpent;
        cardToPlay.convergeAmount = colorsSpent.length;

        // Pay Additional Costs
        additionalCosts.forEach((cost) => {
            if (cost.type === 'Sacrifice') {
                const chosenId = state.interaction?.lastSelections['Sacrifice']?.[0];
                const obj = state.battlefield.find(o => o.id === (chosenId || cardToPlay.id));
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: TriggerEvent.Sacrifice, playerId, payload: { sourceId: obj.id, targetIds: [obj.id], object: obj } });
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId);
                    logger.debug(state, LogCategory.ACTION, `Paid additional cost: Sacrificed ${obj.definition.name}.`);
                    if (cost.isCasualty && state.interaction) state.interaction.flags.paidCasualtyFor = cardToPlay.id;
                }
            } else if (cost.type === 'Discard') {
                const chosenId = state.interaction?.lastSelections['Discard']?.[0];
                const obj = player.hand.find(o => o.id === chosenId);
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: TriggerEvent.Discard, playerId, payload: { object: obj, sourceId: cardToPlay.id, targetIds: [obj.id] } });
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId);
                    logger.debug(state, LogCategory.ACTION, `Paid additional cost: Discarded ${obj.definition.name}.`);
                }
            } else if (cost.type === 'PayLife') {
                const lifeVal = cost.value === 'X' ? (cardToPlay.xValue || 0) : (parseInt(cost.value || '0'));
                player.life -= lifeVal;
                TriggerProcessor.onEvent(state, { type: TriggerEvent.LifeLoss, playerId, payload: { amount: lifeVal, targetIds: [playerId] } });
                logger.debug(state, LogCategory.ACTION, `Paid additional cost: ${lifeVal} life.`);
            } else if (cost.type === 'Exile') {
                const chosenIds = state.interaction?.lastSelections['Exile'] || [];
                chosenIds.forEach((cid: string) => {
                    const obj = RuleUtils.findObject(state, cid);
                    if (obj) {
                        ActionProcessor.moveCard(state, obj as GameObject, Zone.Exile, playerId);
                        const cardName = RuleUtils.isEntity(obj) ? obj.definition.name : cid;
                        logger.debug(state, LogCategory.ACTION, `Paid additional cost: Exiled ${cardName}.`);
                    }
                });
            } else if (cost.type === 'TapSelection') {
                const chosenIds = state.interaction?.lastSelections['TapSelection'] || [];
                chosenIds.forEach((cid: string) => {
                    const obj = state.battlefield.find(o => o.id === cid);
                    if (obj) {
                        obj.isTapped = true;
                        TriggerProcessor.onEvent(state, { type: TriggerEvent.Tap, playerId, payload: { sourceId: obj.id, targetIds: [obj.id], object: obj } });
                        logger.debug(state, LogCategory.ACTION, `Paid additional cost: Tapped ${obj.definition.name}.`);
                    }
                });
            }
        });

        // Cleanup temporary selection state
        if (state.interaction) {
            state.interaction.lastSelections = {};
            state.interaction.lastChoiceIndex = undefined;
            state.interaction.lastChosenModeIndex = undefined;
            state.interaction.manaChoices = undefined;
            state.interaction.flags = {};
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

        const exileOnResolution = (state.ruleRegistry.continuousEffects.some((e: ContinuousEffect) =>
            e.exileOnMoveToGraveyard && (e.targetIds?.includes(cardToPlay.id) || (e.targetMapping === 'CONTROLLER' && e.controllerId === playerId))
        )) ||
            cardToPlay.isFlashbackCast ||
            cardToPlay.definition?.exileOnResolution ||
            cardToPlay.exileOnResolution ||
            (spellEffects && spellEffects.some((e: EffectDefinition) =>
                (e.type === EffectType.Exile || e.type === EffectType.ExileAllCards || e.type === EffectType.MoveToZone) &&
                (e.targetMapping === TargetMapping.Self || e.targetIds?.includes(cardToPlay.id)) &&
                (!e.zone || e.zone === Zone.Exile)
            ));

        logger.debug(state, LogCategory.ACTION, `[FINALIZE-DEBUG] ${cardToPlay.definition.name}: cardToPlay.exileOnRes=${cardToPlay.exileOnResolution}, final=${exileOnResolution}`);

        const targetsControllers = (declaredTargets || []).map((tid) => {
            const obj = RuleUtils.findObject(state, tid);
            return RuleUtils.getController(obj);
        });

        logger.debug(state, LogCategory.ACTION, `[FINAL-PLAY-LOG] Finalizing ${cardToPlay.definition.name} with ${declaredTargets.length} targets: [${declaredTargets.join(', ')}]`);

        const stackObj: StackObject = {
            id: `spell_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            controllerId: playerId,
            ownerId: cardToPlay.ownerId,
            sourceId: cardToPlay.id,
            type: AbilityType.Spell,
            counters: {},
            targets: declaredTargets || [],
            sourceObject: cardToPlay,
            definition: cardToPlay.definition,
            targetDefinitions,
            effects: spellEffects,
            name: cardToPlay.definition.name + (cardToPlay.xValue !== undefined && ((cardToPlay.definition.manaCost || "").includes("{X}") || cardToPlay.xValue > 0) ? ` (X=${cardToPlay.xValue})` : ""),
            cannotBeCopied: cardToPlay.definition.cannotBeCopied,
            xValue: cardToPlay.xValue,
            image_url: cardToPlay.definition.image_url,
            exileOnResolution: exileOnResolution,
            isCopy: cardToPlay.isCopy,
            isPreparedCopy: cardToPlay.isPreparedCopy,
            isFlashbackCast: cardToPlay.isFlashbackCast,
            castFromZone: lastZone,
            targetsControllers,
            preSelectedChoice,
            data: {
                preSelectedChoice,
                targetsControllers,
                declaredXValue: cardToPlay.xValue,
                castFromZone: lastZone,
                summary: cardToPlay.xValue !== undefined && ((cardToPlay.definition.manaCost || "").includes("{X}") || cardToPlay.xValue > 0) ? `X = ${cardToPlay.xValue}` : undefined,
                choices: cardToPlay.xValue !== undefined && ((cardToPlay.definition.manaCost || "").includes("{X}") || cardToPlay.xValue > 0) ? [{ label: "X", value: cardToPlay.xValue }] : []
            },
            zone: Zone.Stack
        };

        state.stack.push(stackObj);
        getProcessors(state).action.updateEntityCache(state, stackObj);
        logger.info(state, LogCategory.STACK, `--------------------------------------------------`);
        logger.info(state, LogCategory.STACK, `[STACK] + ${player.name} cast ${cardToPlay.definition.name}${cardToPlay.xValue !== undefined ? ` (X=${cardToPlay.xValue})` : ''} for ${totalMana}`);

        // Casualty
        if (state.interaction?.flags.paidCasualtyFor === cardToPlay.id) {
            delete state.interaction.flags.paidCasualtyFor;
            const casualtyObj = {
                id: `casualty_trigger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                controllerId: playerId,
                ownerId: stackObj.ownerId,
                sourceId: stackObj.id,
                type: AbilityType.Triggered,
                counters: {},
                definition: stackObj.definition,
                name: `Casualty Copy (${stackObj.definition.name})`,
                image_url: stackObj.definition.image_url,
                targets: [],
                data: { effects: [{ type: EffectType.CopySpellOnStack, targetMapping: 'SOURCE_OBJECT', chooseNewTargets: true }] }
            };
            state.stack.push(casualtyObj);
            getProcessors(state).action.updateEntityCache(state, casualtyObj);
            logger.info(state, LogCategory.TRIGGER, `[CASUALTY] Copy trigger for ${stackObj.definition.name} placed on stack.`);
        }


        // Fire targeting triggers
        (declaredTargets || []).forEach((tid) => {
            TriggerProcessor.onEvent(state, { type: TriggerEvent.BecomeTarget, playerId, payload: { targetIds: [tid], sourceId: stackObj.id, sourceObject: cardToPlay } });
        });

        state.consecutivePasses = 0;
        TriggerProcessor.onEvent(state, { type: TriggerEvent.CastSpell, playerId, payload: { object: cardToPlay, sourceId: stackObj.id, targetIds: declaredTargets || [], amount: cardToPlay.paidManaValue || 0 } });

        if (isFirstInstantOrSorcery) TriggerProcessor.onEvent(state, { type: TriggerEvent.CastFirstInstantOrSorcery, playerId, payload: { object: cardToPlay, sourceId: stackObj.id, targetIds: declaredTargets || [], amount: cardToPlay.paidManaValue || 0 } });
        if (isInstantOrSorcery) TriggerProcessor.onEvent(state, { type: TriggerEvent.CastInstantOrSorcery, playerId, payload: { object: cardToPlay, sourceId: stackObj.id, targetIds: declaredTargets || [], amount: cardToPlay.paidManaValue || 0 } });

        if (!RuleUtils.isCreature(cardToPlay)) {
            TriggerProcessor.onEvent(state, { type: TriggerEvent.CastNonCreature, playerId, payload: { object: cardToPlay, sourceId: cardToPlay.id, targetIds: [cardToPlay.id] } });
        }

        logger.info(state, LogCategory.STACK, `[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}${cardToPlay.xValue !== undefined ? ` (X=${cardToPlay.xValue})` : ''} for ${totalMana}${declaredTargets?.length ? ' targeting ' + declaredTargets.join(', ') : ''}`);
        if (!state.pendingAction) {
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
        const { playerId, obj, ability, abilityIndex, declaredTargets, xValue, preSelectedChoice, parentContext, exileOnResolution } = options;
        const { logger } = getProcessors(state);
        const playerObj = state.players[playerId];

        const stackId = `ability_${Date.now()}`;
        // ARCHITECTURAL NOTE: Choice Propagation (Egress)
        // If the auto-tap engine pre-calculated a choice (e.g. which color a dual land produced),
        // it is passed here so ChoiceEffectHandler can skip the UI modal.
        const effectiveExileOnResolution = exileOnResolution || (ability.effects && ability.effects.some((e: EffectDefinition) =>
            (e.type === EffectType.Exile || e.type === EffectType.ExileAllCards || e.type === EffectType.MoveToZone) &&
            (e.targetMapping === TargetMapping.Self || e.targetIds?.includes(obj.id)) &&
            (!e.zone || e.zone === Zone.Exile)
        ));

        const stackObj: StackObject = {
            id: stackId,
            controllerId: playerId,
            ownerId: obj.ownerId,
            sourceId: obj.id,
            targets: declaredTargets,
            type: ability.type,
            isCopy: obj.isCopy,
            isPreparedCopy: obj.isPreparedCopy,
            xValue: xValue !== undefined ? xValue : obj.xValue,
            sourceObject: obj,
            definition: obj.definition,
            exileOnResolution: effectiveExileOnResolution,
            name: `${obj.definition.name} Ability${obj.xValue !== undefined && (JSON.stringify(ability).includes('"X"') || obj.xValue > 0) ? ` (X=${obj.xValue})` : ""}`,
            image_url: obj.definition.image_url,
            abilityIndex: abilityIndex,
            effects: (ability.type === AbilityType.Activated || ability.type === AbilityType.Triggered) ? ability.effects : [],
            targetDefinitions: (ability.type === AbilityType.Activated || ability.type === AbilityType.Triggered) ? ability.targetDefinitions : undefined,
            preSelectedChoice,
            targetsControllers: (declaredTargets || []).map(tid => RuleUtils.getController(RuleUtils.findObject(state, tid))),
            counters: {},
            data: {
                preSelectedChoice,
                declaredXValue: xValue !== undefined ? xValue : obj.xValue,
                summary: (xValue !== undefined ? xValue : obj.xValue) !== undefined && (JSON.stringify(ability).includes('"X"') || (xValue || obj.xValue || 0) > 0) ? `X = ${xValue !== undefined ? xValue : obj.xValue}` : undefined,
                targetsControllers: (declaredTargets || []).map(tid => RuleUtils.getController(RuleUtils.findObject(state, tid))),
                effects: (ability.type === AbilityType.Activated || ability.type === AbilityType.Triggered) ? ability.effects : [],
                targetDefinitions: (ability.type === AbilityType.Activated || ability.type === AbilityType.Triggered) ? ability.targetDefinitions : undefined,
                choices: (xValue !== undefined ? xValue : obj.xValue) !== undefined && (JSON.stringify(ability).includes('"X"') || (xValue || obj.xValue || 0) > 0) ? [{ label: "X", value: xValue !== undefined ? xValue : obj.xValue }] : []
            },
            zone: Zone.Stack
        };

        // Mana Payment
        const { cost: CostProcessor, mana: ManaProcessor } = getProcessors(state);
        const manaCost = (ability.costs || []).find((cost) => cost.type === 'Mana');
        if (manaCost) {
            const effectiveMana = CostProcessor.getEffectiveManaCost(state, manaCost, obj, stackObj);
            if (!ManaProcessor.canPayManaCost(playerObj, effectiveMana, state, obj)) {
                if (ManaProcessor.canPayWithTotal(playerObj, state.battlefield, effectiveMana, obj)) {
                    logger.info(state, LogCategory.MANA, `Auto-tapping lands to pay ability cost ${effectiveMana}...`);
                    ManaProcessor.autoTapLandsForCost(state, playerId, effectiveMana, engine, obj);
                }
            }
        }

        CostProcessor.pay(state, ability.costs || [], obj.id, playerId);

        // Clean up choice flags
        if (state.interaction) {
            state.interaction.lastSelections = {};
        }

        obj.abilitiesUsedThisTurn++;
        if (ability.type === AbilityType.Activated && ability.limitPerTurn) {
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
        const effectiveMana = manaCostRef ? getProcessors(state).cost.getEffectiveManaCost(state, manaCostRef, obj, stackObj) : "";
        const costLabel = effectiveMana ? ` for ${effectiveMana}` : "";

        state.stack.push(stackObj);
        getProcessors(state).action.updateEntityCache(state, stackObj);
        logger.info(state, LogCategory.ACTION, `Activated ability of ${obj.definition.name}${obj.xValue !== undefined ? ` (X=${obj.xValue})` : ''}${costLabel}`);
        declaredTargets.forEach((tid) => {
            const { trigger: TriggerProc } = getProcessors(state);
            TriggerProc.onEvent(state, {
                type: TriggerEvent.BecomeTarget,
                playerId,
                payload: { targetIds: [tid], sourceId: stackId, sourceObject: obj }
            });
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

    /**
     * Detects hybrid mana symbols in the cost and prompts the player for choices.
     * @returns true if a choice modal was injected, false to continue.
     */
    public static handleHybridManaChoices(
        state: GameState,
        playerId: PlayerId,
        cardToPlay: GameObject,
        totalMana: string,
        declaredTargets: string[],
        parentContext?: ResolutionContext,
        isFreeCast?: boolean,
        exileOnResolution?: boolean
    ): boolean {
        if (isFreeCast) return false;

        const symbols = totalMana.match(/\{([^}]+)\}/g) || [];
        const hybridSymbols = symbols
            .map((s, idx) => ({ s, idx }))
            .filter(item => item.s.includes('/'));

        if (hybridSymbols.length === 0) return false;

        state.interaction.manaChoices = state.interaction.manaChoices || {};
        
        if (Object.keys(state.interaction.manaChoices).length > 0) {
            return false; // Already chosen
        }

        const hybridGroups = hybridSymbols.map(({ s, idx }) => {
            const clean = s.replace(/\{|\}/g, '');
            return {
                symbol: s,
                idx,
                options: clean.split('/')
            };
        });

        state.pendingAction = {
            type: ActionType.ModalSelection,
            playerId: playerId,
            sourceId: cardToPlay.id,
            data: {
                label: `Choose exact payment for ${cardToPlay.definition.name}`,
                hideUndo: false,
                isManaChoice: true,
                isManaChoiceToggle: true,
                isSpellCasting: true,
                hybridGroups,
                declaredTargets,
                parentContext,
                isFreeCast,
                exileOnResolution,
                choices: [] // Empty to prevent default button rendering
            }
        };

        const { logger } = getProcessors(state);
        logger.info(state, LogCategory.ACTION, `[MANA-CHOICE] ${state.players[playerId].name} must toggle hybrid payment.`);
        return true;
    }
}
