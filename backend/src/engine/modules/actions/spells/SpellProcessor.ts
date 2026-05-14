import {
    AbilityCost,
    AbilityDefinition,
    AbilityType,
    ActionType,
    BaseEntity,
    ContinuousEffect,
    ChoiceOption,
    EffectDefinition,
    EffectType,
    GameObject,
    GameState,
    StackObject,
    TargetMapping,
    TriggerEvent,
    Zone,
    PlayerId,
    TargetDefinition
} from '@shared/engine_types';
import { ModalEffect, EngineFrame } from '@shared/types/effects';
import { IdUtils } from '@shared/utils/IdUtils';
import { LogCategory, EngineLogger } from '../../../utils/EngineLogger';
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
import type { SpellCostCalculator } from './SpellCostCalculator';
import type { SpellInteractiveManager } from './SpellInteractiveManager';
import type { SpellValidator } from './SpellValidator';
import { getProcessors } from '../../ProcessorRegistry';
import type { ManaProcessor } from '../../magic/ManaProcessor';
import type { ResolutionManager } from '../../core/stack/ResolutionManager';
import { ActionBuilder } from '../../../utils/ActionBuilder';

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

    public static playCard(state: GameState, engine: EngineContext, options: PlayCardOptions): boolean {
        const { playerId, cardId: cardInstanceId, bypassPriority, parentContext, isFreeCast, isMiracleCast, exileOnResolution, xValue } = options;
        const { spellValidator: SpellValidator, logger, priority: PriorityProcessor, choiceGenerator: ChoiceGenerator, action: ActionProcessor, layer: LayerProcessor, spellInteractiveManager: SpellInteractiveManager, spellCostCalculator: SpellCostCalculator, condition: ConditionProcessor, targeting: TargetingProcessor } = getProcessors(state);

        const cardToPlay = SpellValidator.resolveCardToPlay(state, playerId, cardInstanceId, bypassPriority || false);
        let declaredTargets = options.targets || [];

        if (!cardToPlay) return false;

        logger.debug(state, LogCategory.ACTION, `[MIRACLE-TRACE] playCard entry: cardId=${cardInstanceId}, isMiracleCast=${isMiracleCast}, isFreeCast=${isFreeCast}`);
        logger.debug(state, LogCategory.ACTION, `[PLAY-ENTRY-FULL] ${cardInstanceId}: targets=${declaredTargets.length} (${declaredTargets.join(', ')}), x=${xValue}`);

        // 1. Priority Error (Rule 117.1)
        if (!(bypassPriority || false) && String(state.priorityPlayerId) !== String(playerId)) {
            return false;
        }

        if (state.pendingAction && !(bypassPriority || false)) {
            logger.info(state, LogCategory.ACTION, `Cannot cast: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        // 2. Discard Guard (Rule 701.8)
        const playerMustDiscard = Object.values(state.players).find(p => p.pendingDiscardCount > 0);
        if (playerMustDiscard) {
            logger.info(state, LogCategory.ACTION, `[DISCARD-BLOCK] Player ${playerMustDiscard.name} must finish discarding (${playerMustDiscard.pendingDiscardCount} cards) before any player can cast spells.`);
            return false;
        }

        const player = state.players[playerId];
        if (player && player.pendingDiscardCount > 0) {
            logger.info(state, LogCategory.ACTION, `Player ${player.name} must finish discarding (${player.pendingDiscardCount} remaining) before playing cards.`);
            return false;
        }

        // Apply incoming xValue if provided (for resuming after targeting)
        if (xValue !== undefined) {
            cardToPlay.xValue = xValue;
        }

        if (isFreeCast) {
            cardToPlay.isFreeCast = true;
        } else {
            delete cardToPlay.isFreeCast;
        }

        if (isMiracleCast) {
            cardToPlay.isMiracleCast = true;
        } else {
            delete cardToPlay.isMiracleCast;
        }

        if (exileOnResolution !== undefined) {
            if (exileOnResolution) cardToPlay.exileOnResolution = true;
            else delete cardToPlay.exileOnResolution;
        } else if (cardToPlay.definition.exileOnResolution) {
            cardToPlay.exileOnResolution = true;
        }

        // --- ACTIVATED ABILITY REDIRECTION (Graveyard) ---
        if (cardToPlay.zone === Zone.Graveyard && (state.players[playerId].hand.find((c) => c.id === cardInstanceId) === undefined)) {
            const stats = LayerProcessor.getEffectiveStats(cardToPlay, state);
            const hasFlashback = stats.keywords?.includes('Flashback') || cardToPlay.definition.keywords?.includes('Flashback');

            if (!hasFlashback) {
                const graveAbilityIndex = cardToPlay.definition.abilities?.findIndex((a) => {
                    if (typeof a === 'string') return false;
                    return a.type === AbilityType.Activated &&
                        a.activeZone === Zone.Graveyard;
                });

                if (graveAbilityIndex !== undefined && graveAbilityIndex !== -1) {
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
        if (cardToPlay.definition.faces && !(bypassPriority || false) && !cardToPlay.selectedFaceDefinition) {
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

        // --- CAST MODE SELECTION (CR 601.2b) ---
        if (isFreeCast === undefined && options.forceFlashback === undefined && !(bypassPriority || false) && !options.isModeSelected) {
            const hasFlashback = RuleUtils.hasKeyword(cardToPlay, 'Flashback') && cardToPlay.zone === Zone.Graveyard;
            const freeCastEffect = PriorityProcessor.findFreeCastPermission(state, playerId, cardToPlay.id);
            const normalPermission = (cardToPlay.zone === Zone.Hand) ||
                PriorityProcessor.findPermissionEffect(state, playerId, EffectType.AllowCastFromGraveyard, cardToPlay.id) ||
                PriorityProcessor.findPermissionEffect(state, playerId, EffectType.AllowPlayExiled, cardToPlay.id);

            const castModes: ChoiceOption[] = [];
            if (normalPermission) {
                castModes.push({ label: `Cast Normally (${cardToPlay.definition.manaCost})`, value: 'CAST_MODE_NORMAL' });
            }
            if (hasFlashback) {
                castModes.push({ label: `Cast via Flashback (${cardToPlay.definition.flashbackCost || cardToPlay.definition.manaCost})`, value: 'CAST_MODE_FLASHBACK' });
            }
            if (freeCastEffect) {
                castModes.push({ label: `Cast for Free ({0})`, value: 'CAST_MODE_FREE' });
            }

            if (castModes.length > 1) {
                state.pendingAction = ActionProcessor.prepareAction(state, ChoiceGenerator.createModalChoice(state, {
                    label: `Cast ${cardToPlay.definition.name}: Choose Method`,
                    playerId: playerId,
                    sourceId: cardToPlay.id,
                    actionType: ActionType.ModalSelection
                }, castModes));
                state.priorityPlayerId = null;
                return true;
            }
        }

        const currentDefinition = cardToPlay.selectedFaceDefinition || cardToPlay.definition;

        // --- HAND ACTION SELECTION ---
        if (cardToPlay.zone === Zone.Hand && !(bypassPriority || false) && !options.isAbilitySelectionBypassed) {
            const activatableAbilities = (cardToPlay.definition.abilities || []).map((a, idx) => ({ a, idx })).filter(({ a }) =>
                typeof a !== 'string' && a.type === AbilityType.Activated && (a.activeZone === Zone.Hand || (Array.isArray(a.activeZone) && a.activeZone.includes(Zone.Hand)))
            );

            const validAbilities = activatableAbilities.filter(({ idx }) =>
                PriorityProcessor.canAbilityBeActivated(state, playerId, cardToPlay.id, idx, bypassPriority || false)
            );

            const isSpellPlayable = PriorityProcessor.canObjectBePlayed(state, playerId, cardToPlay.id, bypassPriority || false, undefined, undefined, true);

            if (validAbilities.length > 1 || (validAbilities.length > 0 && isSpellPlayable)) {
                const choices: ChoiceOption[] = [];

                if (isSpellPlayable) {
                    choices.push({ label: `Cast ${cardToPlay.definition.name} (${currentDefinition.manaCost || '0'})`, value: 'PLAY_ACTION_SPELL' });
                }

                choices.push(...validAbilities.map(({ a, idx }) => {
                    const ability = a as AbilityDefinition;
                    return {
                        label: `Activate Ability: ${ability.label || ability.manaCost || 'Alternative Mode'}`,
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

            if (validAbilities.length === 1 && !isSpellPlayable) {
                const { idx } = validAbilities[0];
                return getProcessors(state).spell.activateAbility(state, engine, {
                    playerId,
                    cardId: cardToPlay.id,
                    abilityIndex: idx,
                    targets: declaredTargets,
                    bypassPriority: true
                });
            }
        }

        if (cardToPlay.selectedFaceDefinition) {
            cardToPlay.definition = cardToPlay.selectedFaceDefinition;
        }

        if (!(bypassPriority || false) && cardToPlay.xValue !== undefined && xValue === undefined) {
            cardToPlay.xValue = undefined;
        }

        const isLand = RuleUtils.isType(cardToPlay, 'land');
        const isInstant = RuleUtils.isType(cardToPlay, 'instant');
        const isSorcery = RuleUtils.isType(cardToPlay, 'sorcery');
        const isFlash = RuleUtils.hasKeyword(cardToPlay, 'flash');

        const isInstantOrFlash = isInstant || isFlash;
        const isInstantOrSorcery = isInstant || isSorcery;
        const isFirstInstantOrSorcery = isInstantOrSorcery && !state.turnState.instantOrSorceryCastThisTurn[playerId];

        if (!SpellValidator.validateCardTiming(state, playerId, cardToPlay, isInstantOrFlash, bypassPriority || false)) {
            return false;
        }

        if (RuleUtils.isLand(cardToPlay)) {
            return SpellValidator.handleLandPlay(state, playerId, cardToPlay, engine);
        }

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

        const costStr = (currentDefinition.manaCost || '').split('//')[0].trim();

        // Safely check for X in pre-selected modal modes
        let modeHasX = false;
        if (hasPreSelectedMode && modalAbility?.modes) {
            const index = (Array.isArray(lastChosenModeIndex) ? lastChosenModeIndex : [lastChosenModeIndex])[0];
            const chosenMode = modalAbility.modes[index as number];
            if (chosenMode) {
                modeHasX = JSON.stringify(chosenMode).includes('"X"');
            }
        }

        // X-Value Selection
        const needsX = costStr.includes('{X}') ||
            logic?.abilities?.some((a: any) => typeof a !== 'string' && (a.costs || a.additionalCosts)?.some((c: any) => String(c.value).includes('X'))) ||
            currentDefinition.abilities?.some((a: any) => typeof a !== 'string' && (a.costs || a.additionalCosts)?.some((c: any) => String(c.value).includes('X'))) ||
            logic?.effects?.some((e: any) => JSON.stringify(e).includes('"X"')) ||
            modeHasX;

        if (needsX && cardToPlay.xValue === undefined) {
            if (isFreeCast) {
                cardToPlay.xValue = 0;
            } else {
                return SpellInteractiveManager.handleXValueChoice(state, playerId, cardToPlay, declaredTargets, parentContext, isFreeCast, isMiracleCast, exileOnResolution);
            }
        }

        let { totalMana, additionalCosts, usedAlternativeCostId, isFlashback } = SpellCostCalculator.getEffectiveCosts(state, cardToPlay, declaredTargets, currentDefinition, options.forceFlashback);
        cardToPlay.usedAlternativeCostId = usedAlternativeCostId;
        if (isFlashback) cardToPlay.isFlashbackCast = true;

        if (SpellProcessor.handleHybridManaChoices(state, playerId, cardToPlay, totalMana, declaredTargets, parentContext, isFreeCast, exileOnResolution)) {
            return true;
        }

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

        if (modalAbility && !hasPreSelectedMode) {
            let minChoices = modalAbility.minChoices || 1;
            let maxChoices = modalAbility.maxChoices || 1;

            if (modalAbility.chooseBothCondition) {
                const met = ConditionProcessor.matchesCondition(state, modalAbility.chooseBothCondition, {
                    sourceId: cardToPlay.id,
                    controllerId: playerId,
                    stackObject: {
                        id: cardToPlay.id,
                        sourceId: cardToPlay.id,
                        sourceObject: cardToPlay,
                        controllerId: playerId,
                        ownerId: cardToPlay.ownerId,
                        definition: cardToPlay.definition,
                        type: (modalAbility as AbilityDefinition).type,
                        counters: {},
                        effects: [],
                        targets: []
                    } as StackObject,
                    effects: [],
                    targets: []
                });
                if (met) {
                    maxChoices = modalAbility.modes!.length;
                }
            }

            const choices = modalAbility.modes!.map((mode, idx: number) => {
                const isSelectable = !mode.targetDefinitions || mode.targetDefinitions.length === 0 ||
                    mode.targetDefinitions.every((td: TargetDefinition) => td.optional) ||
                    TargetingProcessor.hasLegalTargets(state, cardToPlay.id, mode.targetDefinitions, playerId);

                return {
                    label: mode.label || `Mode ${idx + 1}`,
                    value: `MODE_SELECTION_${idx}`,
                    selectable: isSelectable
                };
            });

            state.pendingAction = ActionBuilder.modal(playerId, cardToPlay.id, modalAbility.label || 'Choose options')
                .withContext({ isSpellCasting: true, isFreeCast, isMiracleCast, parentContext, exileOnResolution })
                .withChoices(choices, minChoices, maxChoices)
                .withData({ isModeSelection: true, allowDuplicates: modalAbility.allowDuplicates, declaredTargets: declaredTargets || [] })
                .build();
            return true;
        }

        const interactiveResult = SpellInteractiveManager.handleInteractiveCosts(state, playerId, cardToPlay, additionalCosts, declaredTargets, cardInstanceId, parentContext, isFreeCast, isMiracleCast, exileOnResolution);
        if (interactiveResult === true) return true;
        if (interactiveResult === null) return false;

        if (targetDefinitions.length > 0) {
            const result = SpellInteractiveManager.handleTargetingChoice(state, playerId, cardToPlay, targetDefinitions, totalMana, cardInstanceId, engine, parentContext, isFreeCast, isMiracleCast, exileOnResolution, declaredTargets);
            if (typeof result === 'boolean') return result;
            declaredTargets = result;
        }

        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            const choiceEffect = spellEffects[choiceEffectIndex] as ModalEffect;
            state.pendingAction = ActionBuilder.modal(playerId, cardToPlay.id, choiceEffect.label || 'Choose an option')
                .withContext({ isSpellCasting: true, isFreeCast, isMiracleCast, parentContext, exileOnResolution })
                .withChoices(choiceEffect.choices as ChoiceOption[], (choiceEffect.minChoices as number) || 1, (choiceEffect.maxChoices as number) || 1)
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            return true;
        }

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
            isMiracleCast,
            parentContext
        });
    }

    public static activateAbility(state: GameState, engine: EngineContext, options: ActivateAbilityOptions): boolean {
        const { playerId, cardId, abilityIndex, targets: declaredTargets = [], bypassPriority = false, choiceIndex, bypassTargeting = false, xValue, parentContext, exileOnResolution } = options;
        const { logger, layer: LayerProcessor, spellValidator: SpellValidator, spellInteractiveManager: SpellInteractiveManager } = getProcessors(state);

        const playerMustDiscard = Object.values(state.players).find(p => p.pendingDiscardCount > 0);
        if (playerMustDiscard) {
            logger.info(state, LogCategory.ACTION, `[DISCARD-BLOCK] Player ${playerMustDiscard.name} must finish discarding (${playerMustDiscard.pendingDiscardCount} cards) before any player can activate abilities.`);
            return false;
        }

        const obj = RuleUtils.findObject(state, cardId);
        if (!obj) return false;

        if (xValue !== undefined && RuleUtils.isEntity(obj)) {
            obj.xValue = xValue;
        }

        const player = state.players[playerId];
        if (!player) return false;

        if (!bypassPriority && String(state.priorityPlayerId) !== String(playerId)) {
            return false;
        }

        if (state.pendingAction && !bypassPriority) {
            return false;
        }

        if (!RuleUtils.isEntity(obj)) return false;
        const definition = obj.definition;

        const stats = LayerProcessor.getEffectiveStats(obj as GameObject, state);

        let abilities: AbilityDefinition[] = [];
        if ('abilities' in definition && definition.abilities) {
            definition.abilities.forEach((a: AbilityDefinition | string) => {
                if (typeof a === 'string') return;
                abilities.push(a);
            });
        }

        if (stats.abilities) {
            stats.abilities.forEach((a: AbilityDefinition | string) => {
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
            return false;
        }

        const ability = abilities[abilityIndex];
        if (ability.type !== AbilityType.Activated) {
            return false;
        }

        if (!SpellValidator.validateAbilityActivation(state, playerId, obj as GameObject, ability, abilityIndex)) {
            return false;
        }

        if (SpellInteractiveManager.handleAbilityXChoice(state, playerId, obj as GameObject, abilityIndex, declaredTargets)) {
            return true;
        }

        if (!SpellValidator.validateAbilitySpeed(state, playerId, obj as GameObject, ability)) {
            return false;
        }

        const costResult = SpellInteractiveManager.handleAbilityInteractiveCosts(state, playerId, obj as GameObject, ability, abilityIndex, declaredTargets);
        if (costResult === true) return true;
        if (costResult === false) {
            // No interactive costs, continue
        } else if (costResult === null) {
            return false;
        }

        if (ability.targetDefinitions && ability.targetDefinitions.length > 0) {
            const targetingResult = SpellInteractiveManager.handleAbilityTargeting(state, playerId, cardId, obj as GameObject, ability, abilityIndex, engine, choiceIndex, parentContext, exileOnResolution);
            if (targetingResult !== true) return targetingResult;
        }

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

    public static finalizeSpellCast(state: GameState, engine: EngineContext, options: FinalizeCastOptions): boolean {
        const { playerId, cardToPlay, totalMana, additionalCosts, declaredTargets, spellEffects, targetDefinitions, isFirstInstantOrSorcery, isInstantOrSorcery, isFreeCast, isMiracleCast, parentContext } = options;
        const player = state.players[playerId];
        const { logger, action: ActionProcessor, trigger: TriggerProcessor } = getProcessors(state);

        const choiceEffectIndex = spellEffects.findIndex((e, idx) =>
            e.type === EffectType.Choice &&
            (e as ModalEffect).choices &&
            !e.targetMapping &&
            idx === 0 &&
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
                    choices: choiceEffect.choices as import('@shared/engine_types').ChoiceOption[],
                    minChoices: (choiceEffect.minChoices as number) || 1,
                    maxChoices: (choiceEffect.maxChoices as number) || 1,
                    metadata: {
                        isSpellCasting: true,
                        isFreeCast,
                        isMiracleCast,
                        parentContext
                    },
                    declaredTargets: declaredTargets || []
                }
            };
            return true;
        }

        const preSelectedChoice = choiceEffectIndex !== -1 ? state.interaction?.lastChoiceIndex : undefined;
        if (state.interaction) {
            delete state.interaction.lastChoiceIndex;
        }

        const hasConfirmedAutoTap = state.interaction?.flags.confirmedAutoTap;
        if (state.interaction) delete state.interaction.flags.confirmedAutoTap;

        const { mana: ManaProcessor } = getProcessors(state);
        if (!isFreeCast) {
            if (!hasConfirmedAutoTap && ManaProcessor.canPayMana(state, player, totalMana, cardToPlay)) {
                const manaSnapshot = JSON.parse(JSON.stringify(player.manaPool));
                const restrictedSnapshot = JSON.parse(JSON.stringify(player.restrictedMana || []));

                const { tappedIds, producedMana } = ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, engine, cardToPlay);

                if (tappedIds.length > 0) {
                    state.pendingAction = ActionBuilder.confirmAutoTap(playerId, cardToPlay.id, `Confirm auto-tap for ${cardToPlay.definition.name}?`)
                        .ingest({
                            isSpellCasting: true,
                            isFreeCast: isFreeCast,
                            isMiracleCast: isMiracleCast,
                            parentContext,
                            confirmedAutoTap: true,
                            tappedLandIds: tappedIds,
                            producedMana,
                            manaSnapshot,
                            restrictedSnapshot,
                            totalMana,
                            declaredTargets: declaredTargets || []
                        })
                        .build();
                    return true;
                }
            } else if (!hasConfirmedAutoTap && !ManaProcessor.canPayMana(state, player, totalMana, cardToPlay)) {
                return false;
            }
        }

        if (!isFreeCast && !ManaProcessor.canPayMana(state, player, totalMana, cardToPlay)) {
            return false;
        }

        const colorsSpent = isFreeCast ? [] : getProcessors(state).mana.deductManaCost(player, totalMana, state, cardToPlay);
        cardToPlay.colorsSpent = colorsSpent;
        cardToPlay.convergeAmount = colorsSpent.length;

        additionalCosts.forEach((cost) => {
            if (cost.type === 'Sacrifice') {
                const chosenId = state.interaction?.lastSelections['Sacrifice']?.[0];
                const obj = state.battlefield.find(o => o.id === (chosenId || cardToPlay.id));
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: TriggerEvent.Sacrifice, playerId, payload: { sourceId: obj.id, targetIds: [obj.id], object: obj } });
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId);
                    if (cost.isCasualty && state.interaction) {
                        state.interaction.flags.paidCasualtyFor = cardToPlay.id;
                    }
                }
            } else if (cost.type === 'Discard') {
                const chosenId = state.interaction?.lastSelections['Discard']?.[0];
                const obj = player.hand.find(o => o.id === chosenId);
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: TriggerEvent.Discard, playerId, payload: { object: obj, sourceId: cardToPlay.id, targetIds: [obj.id] } });
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId);
                }
            } else if (cost.type === 'PayLife') {
                const lifeVal = cost.value === 'X' ? (cardToPlay.xValue || 0) : (typeof cost.value === 'number' ? cost.value : parseInt(String(cost.value || '0')));
                player.life -= lifeVal;
                TriggerProcessor.onEvent(state, { type: TriggerEvent.LifeLoss, playerId, payload: { amount: lifeVal, targetIds: [playerId] } });
            } else if (cost.type === 'Exile') {
                const chosenIds = state.interaction?.lastSelections['Exile'] || [];
                chosenIds.forEach((cid: string) => {
                    const obj = RuleUtils.findObject(state, cid);
                    if (obj) {
                        ActionProcessor.moveCard(state, obj as GameObject, Zone.Exile, playerId);
                    }
                });
            } else if (cost.type === 'TapSelection') {
                const chosenIds = state.interaction?.lastSelections['TapSelection'] || [];
                chosenIds.forEach((cid: string) => {
                    const obj = state.battlefield.find(o => o.id === cid);
                    if (obj) {
                        obj.isTapped = true;
                        TriggerProcessor.onEvent(state, { type: TriggerEvent.Tap, playerId, payload: { sourceId: obj.id, targetIds: [obj.id], object: obj } });
                    }
                });
            }
        });

        const lastZone = cardToPlay.zone;
        if (!cardToPlay.isPreparedCopy) {
            ActionProcessor.moveCard(state, cardToPlay, Zone.Stack, playerId);
        } else {
            const { registry: RegistryProcessor, lki: LkiProcessor } = getProcessors(state);
            LkiProcessor.saveSnapshot(state, cardToPlay, lastZone);
            cardToPlay.zone = Zone.Stack;
            RegistryProcessor.registerAbilities(state, cardToPlay);
        }

        cardToPlay.paidCost = totalMana;
        cardToPlay.paidManaValue = ManaProcessor.getManaValue(totalMana);

        if (cardToPlay.paidCost === "{0}" && cardToPlay.usedAlternativeCostId) {
            const effectId = cardToPlay.usedAlternativeCostId;
            state.turnState.triggeredAbilitiesUsedThisTurn[effectId] = (state.turnState.triggeredAbilitiesUsedThisTurn[effectId] || 0) + 1;
        }

        if (cardToPlay.isPreparedCopy && cardToPlay.sourceCreatureId) {
            const source = state.battlefield.find(o => o.id === cardToPlay.sourceCreatureId);
            if (source) source.isPrepared = false;
        }

        if (isInstantOrSorcery) state.turnState.instantOrSorceryCastThisTurn[playerId] = true;
        state.turnState.spellsCastThisTurn[playerId] = (state.turnState.spellsCastThisTurn[playerId] || 0) + 1;

        if (state.turnState.spellsCastThisTurn[playerId] === 2) TriggerProcessor.onEvent(state, { type: TriggerEvent.SecondSpellCast, playerId, payload: {} });
        if (state.turnState.spellsCastThisTurn[playerId] === 3) TriggerProcessor.onEvent(state, { type: TriggerEvent.ThirdSpellCast, playerId, payload: {} });

        if (!state.gameStats) state.gameStats = { castCounts: {} };
        if (!state.gameStats.castCounts[playerId]) state.gameStats.castCounts[playerId] = {};
        const cardName = cardToPlay.definition.name;
        state.gameStats.castCounts[playerId][cardName] = (state.gameStats.castCounts[playerId][cardName] || 0) + 1;

        const exileOnResolutionFinal = (state.ruleRegistry.continuousEffects.some((e: ContinuousEffect) =>
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


        const targetsControllers = (declaredTargets || []).map((tid) => {
            const obj = RuleUtils.findObject(state, tid);
            return RuleUtils.getController(obj);
        });

        logger.debug(state, LogCategory.ACTION, `[FINAL-PLAY-LOG] Finalizing ${cardToPlay.definition.name} with ${declaredTargets.length} targets: [${declaredTargets.join(', ')}]`);
        const stackObj: StackObject = {
            id: IdUtils.generateId('spell'),
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
            image_url: cardToPlay.definition.image_url,
            exileOnResolution: exileOnResolutionFinal || parentContext?.exileOnResolution,
            xValue: cardToPlay.xValue,
            isCopy: cardToPlay.isCopy,
            isPreparedCopy: cardToPlay.isPreparedCopy,
            isFlashbackCast: cardToPlay.isFlashbackCast,
            targetsControllers,
            paidManaValue: cardToPlay.paidManaValue,
            lastChosenModeIndex: state.interaction?.lastChosenModeIndex,
            summary: cardToPlay.xValue !== undefined && ((cardToPlay.definition.manaCost || "").includes("{X}") || cardToPlay.xValue > 0) ? `X = ${cardToPlay.xValue}` : undefined,
            castFromZone: lastZone,
            zone: Zone.Stack
        };

        state.stack.push(stackObj);
        getProcessors(state).action.updateEntityCache(state, stackObj);
        logger.info(state, LogCategory.STACK, `--------------------------------------------------`);
        logger.info(state, LogCategory.STACK, `[STACK] + ${player.name} cast ${cardToPlay.definition.name}${cardToPlay.xValue !== undefined ? ` (X=${cardToPlay.xValue})` : ''} for ${totalMana}`);

        const paidCasualty = state.interaction?.flags.paidCasualtyFor === cardToPlay.id;
        if (paidCasualty) {
            delete state.interaction.flags.paidCasualtyFor;

            const casualtyObj: StackObject = {
                id: IdUtils.generateId('casualty_trigger'),
                controllerId: playerId,
                ownerId: stackObj.ownerId,
                sourceId: stackObj.id,
                type: AbilityType.Triggered,
                counters: {},
                definition: stackObj.definition,
                name: `Casualty Copy (${stackObj.definition.name})`,
                image_url: stackObj.definition.image_url,
                targets: [],
                effects: [{ type: EffectType.CopySpellOnStack, targetMapping: 'SOURCE_OBJECT', chooseNewTargets: true }],
                zone: Zone.Stack
            };
            state.stack.push(casualtyObj);
            getProcessors(state).action.updateEntityCache(state, casualtyObj);
        }

        (declaredTargets || []).forEach((tid) => {
            TriggerProcessor.onEvent(state, { type: TriggerEvent.BecomeTarget, playerId, payload: { targetIds: [tid], sourceId: stackObj.id, sourceObject: cardToPlay } });
        });

        state.consecutivePasses = 0;
        TriggerProcessor.onEvent(state, { type: TriggerEvent.CastSpell, playerId, payload: { object: cardToPlay, sourceId: stackObj.id, targetIds: declaredTargets || [], amount: cardToPlay.paidManaValue || 0 } });

        if (cardToPlay.usedAlternativeCostId) {
            state.turnState.triggeredAbilitiesUsedThisTurn[cardToPlay.usedAlternativeCostId] = (state.turnState.triggeredAbilitiesUsedThisTurn[cardToPlay.usedAlternativeCostId] || 0) + 1;
        }

        if (isFirstInstantOrSorcery) TriggerProcessor.onEvent(state, { type: TriggerEvent.CastFirstInstantOrSorcery, playerId, payload: { object: cardToPlay, sourceId: stackObj.id, targetIds: declaredTargets || [], amount: cardToPlay.paidManaValue || 0 } });
        if (isInstantOrSorcery) TriggerProcessor.onEvent(state, { type: TriggerEvent.CastInstantOrSorcery, playerId, payload: { object: cardToPlay, sourceId: stackObj.id, targetIds: declaredTargets || [], amount: cardToPlay.paidManaValue || 0 } });

        if (!RuleUtils.isCreature(cardToPlay)) {
            TriggerProcessor.onEvent(state, { type: TriggerEvent.CastNonCreature, playerId, payload: { object: cardToPlay, sourceId: cardToPlay.id, targetIds: [cardToPlay.id] } });
        }

        if (state.interaction) {
            state.interaction.lastSelections = {};
            state.interaction.lastChoiceIndex = undefined;
            state.interaction.lastChosenModeIndex = undefined;
            state.interaction.manaChoices = undefined;
            state.interaction.flags = {};
        }

        if (!state.pendingAction) {
            engine.checkStateBasedActions();
            engine.resetPriorityToActivePlayer();
        }
        return true;
    }

    public static finalizeAbilityActivation(state: GameState, engine: EngineContext, options: FinalizeAbilityOptions): boolean {
        const { playerId, obj, ability, abilityIndex, declaredTargets, xValue, preSelectedChoice, parentContext, exileOnResolution } = options;
        const { logger } = getProcessors(state);
        const playerObj = state.players[playerId];

        const stackId = IdUtils.generateAbilityId();
        const effectiveExileOnResolution = exileOnResolution || (ability.effects && ability.effects.some((e: EffectDefinition) =>
            (e.type === EffectType.Exile || e.type === EffectType.ExileAllCards || e.type === EffectType.MoveToZone) &&
            (e.targetMapping === TargetMapping.Self || e.targetIds?.includes(obj.id)) &&
            (!e.zone || e.zone === Zone.Exile)
        ));

        const finalX = xValue !== undefined ? xValue : obj.xValue;
        const stackObj: StackObject = {
            id: stackId,
            controllerId: playerId,
            ownerId: obj.ownerId,
            sourceId: obj.id,
            targets: declaredTargets,
            type: ability.type,
            isCopy: obj.isCopy,
            isPreparedCopy: obj.isPreparedCopy,
            xValue: finalX,
            isManaAbility: ability.isManaAbility,
            sourceObject: obj,
            definition: obj.definition,
            exileOnResolution: effectiveExileOnResolution,
            name: `${obj.definition.name} Ability${finalX !== undefined && (JSON.stringify(ability).includes('"X"') || finalX > 0) ? ` (X=${finalX})` : ""}`,
            image_url: obj.definition.image_url,
            abilityIndex: abilityIndex,
            effects: (ability.type === AbilityType.Activated || ability.type === AbilityType.Triggered) ? ability.effects : [],
            targetDefinitions: (ability.type === AbilityType.Activated || ability.type === AbilityType.Triggered) ? ability.targetDefinitions : undefined,
            preSelectedChoice,
            declaredXValue: finalX,
            choices: (finalX !== undefined && (JSON.stringify(ability).includes('"X"') || finalX > 0)) ? [{ label: "X", value: finalX }] : [],
            targetsControllers: (declaredTargets || []).map(tid => RuleUtils.getController(RuleUtils.findObject(state, tid))),
            counters: {},
            summary: (finalX !== undefined && (JSON.stringify(ability).includes('"X"') || finalX > 0)) ? `X = ${finalX}` : undefined,
            zone: Zone.Stack
        };

        const hasConfirmedAutoTap = state.interaction?.flags.confirmedAutoTap;
        if (state.interaction) delete state.interaction.flags.confirmedAutoTap;

        const { cost: CostProcessor, mana: ManaProcessor } = getProcessors(state);
        const manaCost = (ability.costs || []).find((cost) => cost.type === 'Mana');
        if (manaCost) {
            const effectiveMana = CostProcessor.getEffectiveManaCost(state, manaCost, obj, stackObj);
            if (!ManaProcessor.canPayMana(state, playerObj, effectiveMana, obj)) {
                return false;
            }

            if (!hasConfirmedAutoTap) {
                const manaSnapshot = JSON.parse(JSON.stringify(playerObj.manaPool));
                const restrictedSnapshot = JSON.parse(JSON.stringify(playerObj.restrictedMana || []));

                const { tappedIds, producedMana } = ManaProcessor.autoTapLandsForCost(state, playerId, effectiveMana, engine, obj);

                if (tappedIds.length > 0) {
                    state.pendingAction = ActionBuilder.confirmAutoTap(playerId, obj.id, `Confirm auto-tap for ${obj.definition.name}?`)
                        .ingest({
                            isSpellCasting: true,
                            parentContext,
                            confirmedAutoTap: true,
                            tappedLandIds: tappedIds,
                            producedMana,
                            manaSnapshot,
                            restrictedSnapshot,
                            totalMana: effectiveMana,
                            abilityIndex,
                            declaredTargets: declaredTargets || []
                        })
                        .build();
                    return true;
                }
            }
        }

        CostProcessor.pay(state, ability.costs || [], obj, playerId);

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
                    context: EffectProcessor.createEngineFrame(state, {
                        sourceId: obj.id,
                        targets: [],
                        stackObject: stackObj
                    })
                });
            });
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
        if (!state.pendingAction && options.parentContext) {
            const { resolution: ResolutionManager } = getProcessors(state);
            return ResolutionManager.resume(state, engine, stackObj, obj.id, options.parentContext);
        }

        if (!state.pendingAction) {
            obj.xValue = undefined;
            engine.checkStateBasedActions();
            engine.resetPriorityToActivePlayer();
        }
        return true;
    }

    public static getEffectiveCosts(state: GameState, card: GameObject, targets: string[] = [], overrideDefinition?: any, forceFlashback?: boolean, overrideStats?: any) {
        const { spellCostCalculator: SpellCostCalculator } = getProcessors(state);
        return SpellCostCalculator.getEffectiveCosts(state, card, targets, overrideDefinition, forceFlashback, overrideStats);
    }

    public static handleHybridManaChoices(
        state: GameState,
        playerId: PlayerId,
        cardToPlay: GameObject,
        totalMana: string,
        declaredTargets: string[],
        parentContext?: EngineFrame,
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

        state.pendingAction = ActionBuilder.modal(playerId, cardToPlay.id, `Choose exact payment for ${cardToPlay.definition.name}`)
            .ingest({
                isSpellCasting: true,
                parentContext,
                isFreeCast,
                exileOnResolution,
                isManaChoice: true,
                isManaChoiceToggle: true,
                hybridGroups,
                declaredTargets,
                choices: [{ label: 'Cancel', value: 'cancel' }]
            })
            .build();

        const { logger } = getProcessors(state);
        logger.info(state, LogCategory.ACTION, `[MANA-CHOICE] ${state.players[playerId].name} must toggle hybrid payment.`);
        return true;
    }
}

