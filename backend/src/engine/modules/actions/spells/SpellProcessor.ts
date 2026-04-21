import { AbilityCost, AbilityType, GameObject, GameState, Zone } from '@shared/engine_types';
import { ActivateAbilityOptions, EngineContext, FinalizeAbilityOptions, FinalizeCastOptions, PlayCardOptions } from '../../../interfaces/EngineContext';
import { oracle } from '../../../OracleLogicMap';
import { CostProcessor } from '../../magic/CostProcessor';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { SpellCostCalculator } from './SpellCostCalculator';
import { SpellInteractiveManager } from './SpellInteractiveManager';
import { SpellValidator } from './SpellValidator';

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
        log: (m: string) => void,
        engine: EngineContext,
        options: PlayCardOptions
    ): boolean {
        const { playerId, cardId: cardInstanceId, bypassPriority = false, bypassTargeting = false, xValue } = options;
        let declaredTargets = options.targets || [];
        const activeId = String(state.activePlayerId).trim();
        const callerId = String(playerId).trim();

        // 1. Priority Error (Rule 117.1)
        if (!bypassPriority && String(state.priorityPlayerId) !== String(playerId)) {
            return false;
        }

        if (state.pendingAction && !bypassPriority) {
            log(`Cannot cast: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        const player = state.players[playerId];
        if (player && player.pendingDiscardCount > 0) {
            log(`Player must finish discarding before playing cards.`);
            return false;
        }

        const cardToPlay = SpellValidator.resolveCardToPlay(state, playerId, cardInstanceId, log, bypassPriority);
        if (!cardToPlay) return false;

        // Apply incoming xValue if provided (for resuming after targeting)
        if (xValue !== undefined) {
            cardToPlay.xValue = xValue;
        }

        // --- ACTIVATED ABILITY REDIRECTION (Graveyard) ---
        // If the card is in the graveyard and we're trying to "play" it, check if it's actually an activated ability card
        if (cardToPlay.zone === Zone.Graveyard && (state.players[playerId].hand.find((c: any) => c.id === cardInstanceId) === undefined)) {
            const { LayerProcessor } = require('../../state/LayerProcessor');
            const stats = LayerProcessor.getEffectiveStats(cardToPlay, state);
            const hasFlashback = stats.keywords?.includes('Flashback') || cardToPlay.definition.keywords?.includes('Flashback');

            if (!hasFlashback) {
                const graveAbilityIndex = cardToPlay.definition.abilities?.findIndex((a: any) =>
                    a.type === AbilityType.Activated &&
                    (a.zone === Zone.Graveyard || a.activeZone === Zone.Graveyard || a.activeZone === Zone.Graveyard)
                );

                if (graveAbilityIndex !== undefined && graveAbilityIndex !== -1) {
                    log(`[DEBUG] Converting playCard to activateAbility for ${cardToPlay.definition.name}`);
                    return SpellProcessor.activateAbility(state, log, engine, {
                        playerId,
                        cardId: cardInstanceId,
                        abilityIndex: graveAbilityIndex,
                        targets: declaredTargets,
                        bypassPriority: bypassPriority,
                        xValue: xValue
                    });
                }
            }
        }

        // --- MDFC FACE SELECTION (CR 711.1) ---
        if (cardToPlay.definition.faces && !bypassPriority && !(cardToPlay as any).selectedFaceDefinition) {
            const { ChoiceGenerator } = require('../../../effects/ChoiceGenerator');
            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = ChoiceGenerator.createModalChoice({
                label: `Cast ${cardToPlay.definition.name}: Choose Face`,
                playerId: playerId,
                sourceId: cardToPlay.id,
                actionType: ActionType.ModalSelection
            }, cardToPlay.definition.faces.map((face: any, idx: number) => ({
                label: `${face.name} (${face.type_line})`,
                value: `FACE_SELECTION_${idx}`
            })));
            state.priorityPlayerId = null;
            return true;
        }

        const currentDefinition = (cardToPlay as any).selectedFaceDefinition || cardToPlay.definition;

        // Persist face choice into the object definition for Zones (Stack/Battlefield)
        if ((cardToPlay as any).selectedFaceDefinition) {
            cardToPlay.definition = (cardToPlay as any).selectedFaceDefinition;
        }

        // --- X-VALUE RESET FAIL-SAFE ---
        if (!bypassPriority && cardToPlay.xValue !== undefined && xValue === undefined) {
            cardToPlay.xValue = undefined;
        }

        // --- TYPE IDENTIFICATION (Type-First Strategy) ---
        // Prioritize structured arrays; fall back to parsing type_line for legacy/imported cards.
        const structuredTypes = (currentDefinition.types || []).map((t: string) => t.toLowerCase());
        const rawTypeLine = (currentDefinition.type_line || '').toLowerCase();
        const parsedTypes = rawTypeLine.split('//')[0].split(/[-—]/)[0].trim().split(/\s+/).filter(Boolean).map((t: string) => t.toLowerCase());

        const types = structuredTypes.length > 0 ? structuredTypes : parsedTypes;

        const isLand = types.includes('land');
        const isInstant = types.includes('instant');
        const isSorcery = types.includes('sorcery');
        const isFlash = (currentDefinition.keywords || []).some((k: string) => k.toLowerCase() === 'flash') ||
            /\bFlash\b/.test(currentDefinition.oracleText || '');

        const isInstantOrFlash = isInstant || isFlash;
        const isInstantOrSorcery = isInstant || isSorcery;
        const isFirstInstantOrSorcery = isInstantOrSorcery && !state.turnState.instantOrSorceryCastThisTurn[playerId];

        if (!SpellValidator.validateCardTiming(state, playerId, cardToPlay, isInstantOrFlash, bypassPriority, log)) {
            return false;
        }

        // 3. Land Handling (Rule 305)
        if (isLand) {
            return SpellValidator.handleLandPlay(state, playerId, cardToPlay, engine, log);
        }

        // 4. Extract logic and effects
        const logic = oracle.getCard(currentDefinition.name);
        if (!logic && !isLand) {
            log(`[WARNING] No logic definition found for ${currentDefinition.name}.`);
        }

        // Priority: Oracle -> Current Definition on Object (for virtual spells/MDFCs)
        const modalAbility = (logic as any)?.abilities?.find((a: any) => a.modes) || currentDefinition.abilities?.find((a: any) => a.modes);
        const hasPreSelectedChoice = (state as any).lastChoiceIndex !== undefined;
        const lastChosenModeIndex = (state as any).lastChosenModeIndex;
        const hasPreSelectedMode = lastChosenModeIndex !== undefined;

        // --- EXTRACT EFFECTIVE TARGETS/EFFECTS (Modally Aware) ---
        let targetDefinition = (logic as any)?.targetDefinition ||
            (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.targetDefinition ||
            currentDefinition.targetDefinition ||
            currentDefinition.abilities?.find((a: any) => a.type === 'Spell')?.targetDefinition;

        let spellEffects = (logic as any)?.effects ||
            (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.effects ||
            currentDefinition.effects ||
            currentDefinition.abilities?.find((a: any) => a.type === 'Spell')?.effects || [];

        if (hasPreSelectedMode && modalAbility?.modes) {
            const indices = Array.isArray(lastChosenModeIndex) ? lastChosenModeIndex : [lastChosenModeIndex];
            log(`[MODAL] Applying chosen modes: ${indices.join(', ')}`);

            const combinedTargets: any[] = [];
            const combinedEffects: any[] = [];

            indices.forEach(idx => {
                const mode = modalAbility.modes[idx];
                if (!mode) return;

                if (mode.targetDefinition) {
                    if (Array.isArray(mode.targetDefinition)) combinedTargets.push(...mode.targetDefinition);
                    else combinedTargets.push(mode.targetDefinition);
                }

                if (mode.effects) combinedEffects.push(...mode.effects);
            });

            if (combinedTargets.length > 0) targetDefinition = combinedTargets;
            if (combinedEffects.length > 0) spellEffects = combinedEffects;
        }

        const choiceEffectIndex = spellEffects.findIndex((e: any, idx: number) => 
            e.type === 'Choice' && 
            e.choices && 
            !e.targetMapping && 
            idx === 0 &&
            (!e.choices.some((c: any) => c.costs && c.costs.length > 0))
        );

        // Step 0.5: Check for X in cost or inherent logic
        const costStr = (currentDefinition.manaCost || '').split('//')[0].trim();
        // X-Value Selection
        const needsX = costStr.includes('{X}') ||
            (logic as any)?.abilities?.some((a: any) => a.costs?.some((c: any) => c.value === 'X')) ||
            (logic as any)?.effects?.some((e: any) => JSON.stringify(e).includes('"X"')) ||
            (hasPreSelectedMode && JSON.stringify(modalAbility.modes[lastChosenModeIndex]).includes('"X"'));

        if (needsX && cardToPlay.xValue === undefined) {
            return SpellInteractiveManager.handleXValueChoice(state, playerId, cardToPlay, declaredTargets, log);
        }

        // CR 601.2f: Determine total cost
        const { totalMana, additionalCosts, usedAlternativeCostId } = SpellCostCalculator.getEffectiveCosts(state, cardToPlay, declaredTargets, currentDefinition);
        (cardToPlay as any).usedAlternativeCostId = usedAlternativeCostId;

        // --- SETUP SEQUENCE: TARGETING -> CHOICE -> FINALIZATION ---

        // Step 1: Check Targeting
        if (targetDefinition && (!declaredTargets || declaredTargets.length === 0) && !bypassTargeting) {
            const result = SpellInteractiveManager.handleTargetingChoice(state, playerId, cardToPlay, targetDefinition, totalMana, cardInstanceId, log, engine);
            if (result === true || result === false) return result;
            declaredTargets = result;
        }

        // Step 1.5: Check Additional Costs (e.g. Goremand's sacrifice)
        const interactiveResult = SpellInteractiveManager.handleInteractiveCosts(state, playerId, cardToPlay, additionalCosts, declaredTargets, cardInstanceId, log);
        if (interactiveResult === true) return true; // Flow paused for input
        if (interactiveResult === null) return false; // Illegal play, stop

        // Step 1.7: Check Mode Selection (Charms/Comands)
        if (modalAbility && !hasPreSelectedMode) {
            const { TargetingProcessor } = require('../targeting/TargetingProcessor');
            const choices = modalAbility.modes.map((mode: any, idx: number) => {
                const isSelectable = !mode.targetDefinition ||
                    mode.targetDefinition.optional ||
                    TargetingProcessor.hasLegalTargets(state, cardToPlay.id, mode.targetDefinition, playerId);

                return {
                    label: mode.label || `Mode ${idx + 1}`,
                    value: `MODE_SELECTION_${idx}`,
                    selectable: isSelectable
                };
            });

            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: modalAbility.label || 'Choose options',
                    choices: choices,
                    minChoices: modalAbility.minChoices || 1,
                    maxChoices: modalAbility.maxChoices || 1,
                    isSpellCasting: true,
                    isModeSelection: true,
                    declaredTargets: declaredTargets || []
                }
            };
            log(`[MODAL] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        // Step 2: Check Modal Choice
        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            // Trigger choice phase (targets are already in declaredTargets if we are here)
            const choiceEffect = spellEffects[choiceEffectIndex];
            const { ActionType } = require('@shared/engine_types');
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
            log(`[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        // Step 3: Finalization
        return SpellProcessor.finalizeSpellCast(state, log, engine, {
            playerId,
            cardToPlay,
            totalMana,
            additionalCosts,
            declaredTargets,
            spellEffects,
            targetDefinition,
            isFirstInstantOrSorcery,
            isInstantOrSorcery
        });
    }

    public static activateAbility(
        state: GameState,
        log: (m: string) => void,
        engine: EngineContext,
        options: ActivateAbilityOptions
    ): boolean {
        const { playerId, cardId, abilityIndex, targets: declaredTargets = [], bypassPriority = false, choiceIndex, bypassTargeting = false, xValue } = options;
        const { TargetingProcessor } = require('../targeting/TargetingProcessor');
        const obj = TargetingProcessor.findObjectInAnyZone(state, cardId);
        if (!obj) return false;

        // Apply incoming xValue if provided
        if (xValue !== undefined) {
            obj.xValue = xValue;
        }

        const player = state.players[playerId];
        if (!player) return false;

        if (!bypassPriority && String(state.priorityPlayerId) !== String(playerId)) {
            log(`Tried to activate ability without priority.`);
            return false;
        }

        // ARCHITECTURAL NOTE: Bypassing Pending Actions
        // When bypassTargeting is true (during auto-tap), we ignore the presence of other 
        // pending actions. This is necessary because land-tapping often triggers 
        // sub-effects (like choice modals) which we have already pre-resolved.
        if (state.pendingAction && !bypassPriority) {
            log(`Cannot activate ability: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        const cardLogic = oracle.getCard(obj.definition.name);
        let abilities = [...(cardLogic?.abilities || [])];
        if (obj.definition.abilities) {
          obj.definition.abilities.forEach((a: any) => {
            if (!abilities.some(existing => existing.id === a.id && a.id !== undefined)) {
              abilities.push(a);
            }
          });
        }

        if (!abilities[abilityIndex]) {
            log(`[ERROR] Ability index ${abilityIndex} not found for ${obj.definition.name}`);
            return false;
        }

        const ability = abilities[abilityIndex];
        if (ability.type !== AbilityType.Activated) {
            log(`[ERROR] Ability index ${abilityIndex} for ${obj.definition.name} is not an activated ability (found ${ability.type})`);
            return false;
        }

        // Step 1: Preliminary Validation (Zone, Costs, Requirements, Limits)
        if (!SpellValidator.validateAbilityActivation(state, playerId, obj, ability, abilityIndex, log)) {
            return false;
        }

        // Step 1.5: Choose X
        if (SpellInteractiveManager.handleAbilityXChoice(state, playerId, obj, abilityIndex, declaredTargets, log)) {
            return true;
        }

        // Step 1.6: Speed/Timing Check
        if (!SpellValidator.validateAbilitySpeed(state, playerId, obj, ability, cardLogic, log)) {
            return false;
        }

        // Step 2: Interactive Cost Selection
        const costResult = SpellInteractiveManager.handleAbilityInteractiveCosts(state, playerId, obj, ability, abilityIndex, declaredTargets, log);
        if (costResult === true) return true;
        if (costResult === false) return false;

        // Step 3: Targeting (Rule 602.2b)
        if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && !bypassTargeting) {
            const targetingResult = SpellInteractiveManager.handleAbilityTargeting(state, playerId, cardId, obj, ability, abilityIndex, log, engine, choiceIndex);
            if (targetingResult) return true; // Handled pending action or single target recursion
        }

        // Step 4: Finalization (Rule 602.2h)
        return SpellProcessor.finalizeAbilityActivation(state, log, engine, {
            playerId,
            obj,
            ability,
            abilityIndex,
            declaredTargets: declaredTargets || [],
            preSelectedChoice: choiceIndex
        });
    }

    public static finalizeSpellCast(
        state: GameState,
        log: (m: string) => void,
        engine: EngineContext,
        options: FinalizeCastOptions
    ): boolean {
        const { playerId, cardToPlay, totalMana, additionalCosts, declaredTargets, spellEffects, targetDefinition, isFirstInstantOrSorcery, isInstantOrSorcery } = options;
        const player = state.players[playerId];
        const { ActionProcessor } = require('../ActionProcessor');
        const { TargetingProcessor } = require('../targeting/TargetingProcessor');
        const { TriggerProcessor } = require('../../effects/triggers/TriggerProcessor');
        const { AbilityType, Zone, CostType } = require('@shared/engine_types');

        // Modal Choice check (modes like "Choose one")
        const choiceEffectIndex = spellEffects.findIndex((e: any, idx: number) => 
            e.type === 'Choice' && 
            e.choices && 
            !e.targetMapping && 
            (!e.choices.some((c: any) => c.costs && c.costs.length > 0))
        );
        const hasPreSelectedChoice = (state as any).lastChoiceIndex !== undefined;

        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            const choiceEffect = spellEffects[choiceEffectIndex];
            const { ActionType } = require('@shared/engine_types');
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
            log(`[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        const preSelectedChoice = (state as any).lastChoiceIndex;
        delete (state as any).lastChoiceIndex;
        delete (state as any).consumedModeIndex;

        // Pay Mana
        const hasConfirmedAutoTap = (state as any).confirmedAutoTap;
        delete (state as any).confirmedAutoTap;

        if (!ManaProcessor.canPayManaCost(player, totalMana, state, cardToPlay)) {
            if (ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana, cardToPlay)) {
                if (hasConfirmedAutoTap) {
                    log(`Using pre-confirmed auto-tap for ${totalMana}...`);
                    ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, log, engine, cardToPlay);
                } else {
                    log(`Auto-tapping lands to pay ${totalMana}...`);
                    const manaSnapshot = JSON.parse(JSON.stringify(player.manaPool));
                    const restrictedSnapshot = JSON.parse(JSON.stringify(player.restrictedMana || []));
                    const { tappedIds, producedMana } = ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, log, engine, cardToPlay);

                    if (tappedIds.length > 0) {
                        const { ActionType } = require('@shared/engine_types');
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
                log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Effective Cost: ${totalMana})`);
                return false;
            }
        }

        log(`Paying ${totalMana} for ${cardToPlay.definition.name}...`);
        const colorsSpent = ManaProcessor.deductManaCost(player, totalMana, state, cardToPlay);
        (cardToPlay as any).colorsSpent = colorsSpent;
        (cardToPlay as any).convergeAmount = colorsSpent.length;

        // Pay Additional Costs
        additionalCosts.forEach((cost: any) => {
            if (cost.type === 'Sacrifice') {
                const chosenId = (state as any).lastChosenSacrificeId;
                const obj = state.battlefield.find(o => o.id === (chosenId || cardToPlay.id));
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId, sourceId: obj.id, data: { object: obj } }, log);
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId, log);
                    log(`Paid additional cost: Sacrificed ${obj.definition.name}.`);
                    if ((cost as any).isCasualty) (state as any).paidCasualtyFor = cardToPlay.id;
                }
            } else if (cost.type === 'Discard') {
                const chosenId = (state as any).lastChosenDiscardId;
                const obj = player.hand.find(o => o.id === chosenId);
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId, data: { card: obj, sourceId: cardToPlay.id } }, log);
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId, log);
                    log(`Paid additional cost: Discarded ${obj.definition.name}.`);
                }
            } else if (cost.type === 'PayLife') {
                const lifeVal = cost.value === 'X' ? (cardToPlay.xValue || 0) : (parseInt(cost.value as string) || 0);
                player.life -= lifeVal;
                TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId, amount: lifeVal }, log);
                log(`Paid additional cost: ${lifeVal} life.`);
            } else if (cost.type === 'Exile') {
                const chosenIds = (state as any).lastChosenExileIds || [];
                chosenIds.forEach((cid: string) => {
                    const obj = TargetingProcessor.findObjectInAnyZone(state, cid);
                    if (obj) {
                        ActionProcessor.moveCard(state, obj, Zone.Exile, playerId, log);
                        log(`Paid additional cost: Exiled ${obj.definition?.name || cid}.`);
                    }
                });
            }
        });

        // Cleanup temporary selection state
        delete (state as any).lastChosenSacrificeId;
        delete (state as any).lastChosenDiscardId;
        delete (state as any).lastChosenExileIds;
        delete (state as any).lastChosenCostChoiceIndex;
        delete (state as any).lastChosenModeIndex;

        // Move to Stack
        const lastZone = cardToPlay.zone;
        if (!(cardToPlay as any).isPreparedCopy) {
            ActionProcessor.moveCard(state, cardToPlay, Zone.Stack, playerId, log);
        } else {
            const { RegistryProcessor } = require('../../core/RegistryProcessor');
            cardToPlay.zone = Zone.Stack;
            cardToPlay.lastNonStackZone = lastZone;
            RegistryProcessor.registerAbilities(state, cardToPlay);
        }

        (cardToPlay as any).paidCost = totalMana;
        (cardToPlay as any).paidManaValue = ManaProcessor.getManaValue(totalMana);

        // Limit tracking
        if ((cardToPlay as any).paidCost === "{0}" && (cardToPlay as any).usedAlternativeCostId) {
            const effectId = (cardToPlay as any).usedAlternativeCostId;
            state.turnState.triggeredAbilitiesUsedThisTurn[effectId] = (state.turnState.triggeredAbilitiesUsedThisTurn[effectId] || 0) + 1;
        }

        // Unprepare source if MDFC/SOS
        if ((cardToPlay as any).isPreparedCopy && (cardToPlay as any).sourceCreatureId) {
            const source = state.battlefield.find(o => o.id === (cardToPlay as any).sourceCreatureId);
            if (source) source.isPrepared = false;
        }

        if (isInstantOrSorcery) state.turnState.instantOrSorceryCastThisTurn[playerId] = true;
        state.turnState.spellsCastThisTurn[playerId] = (state.turnState.spellsCastThisTurn[playerId] || 0) + 1;

        // Triggers: ON_SECOND_SPELL_CAST, etc.
        if (state.turnState.spellsCastThisTurn[playerId] === 2) TriggerProcessor.onEvent(state, { type: 'ON_SECOND_SPELL_CAST', playerId, data: {} }, log);
        if (state.turnState.spellsCastThisTurn[playerId] === 3) TriggerProcessor.onEvent(state, { type: 'ON_THIRD_SPELL_CAST', playerId, data: {} }, log);

        const exileOnResolution = (state.ruleRegistry.continuousEffects.some(e =>
            e.exileOnMoveToGraveyard && (e.targetIds?.includes(cardToPlay.id) || (e.targetMapping === 'CONTROLLER' && e.controllerId === playerId))
        )) || (cardToPlay as any).isFlashbackCast || cardToPlay.definition?.exileOnResolution;

        const targetsControllers = (declaredTargets || []).map((tid: any) => {
            const obj = TargetingProcessor.findObjectInAnyZone(state, tid);
            return obj ? obj.controllerId : null;
        });

        const stackObj = {
            id: `spell_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            controllerId: playerId,
            sourceId: cardToPlay.id,
            type: 'Spell' as const,
            targets: declaredTargets || [],
            card: cardToPlay,
            definition: cardToPlay.definition,
            cannotBeCopied: cardToPlay.definition.cannotBeCopied,
            xValue: cardToPlay.xValue,
            exileOnResolution: exileOnResolution,
            isFlashbackCast: (cardToPlay as any).isFlashbackCast,
            data: { effects: spellEffects, targetDefinition, preSelectedChoice, targetsControllers }
        };

        state.stack.push(stackObj);

        // Casualty
        if ((state as any).paidCasualtyFor === cardToPlay.id) {
            delete (state as any).paidCasualtyFor;
            state.stack.push({
                id: `casualty_trigger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                controllerId: playerId,
                sourceId: stackObj.id,
                type: AbilityType.Triggered as any,
                name: `Casualty Copy (${stackObj.definition.name})`,
                image_url: stackObj.definition.image_url,
                targets: [],
                data: { effects: [{ type: 'CopySpellOnStack', targetMapping: 'SOURCE_OBJECT', chooseNewTargets: true }] }
            });
            log(`[CASUALTY] Copy trigger for ${stackObj.definition.name} placed on stack.`);
        }

        // Fire targeting triggers
        (declaredTargets || []).forEach((tid: any) => {
            TriggerProcessor.onEvent(state, { type: 'ON_BECOME_TARGET', playerId, targetId: tid, sourceId: stackObj.id, data: { sourceId: stackObj.id, sourceCard: cardToPlay } }, log);
        });

        state.consecutivePasses = 0;
        TriggerProcessor.onEvent(state, { type: 'ON_CAST_SPELL', playerId, amount: (cardToPlay as any).paidManaValue || 0, payload: { card: cardToPlay, sourceId: cardToPlay.id, stackSnapshot: JSON.parse(JSON.stringify(stackObj)) } }, log);

        if (isFirstInstantOrSorcery) TriggerProcessor.onEvent(state, { type: 'ON_CAST_FIRST_INSTANT_SORCERY', playerId, amount: (cardToPlay as any).paidManaValue || 0, payload: { card: cardToPlay, sourceId: cardToPlay.id, stackSnapshot: JSON.parse(JSON.stringify(stackObj)) } }, log);
        if (isInstantOrSorcery) TriggerProcessor.onEvent(state, { type: 'ON_CAST_INSTANT_SORCERY', playerId, amount: (cardToPlay as any).paidManaValue || 0, payload: { card: cardToPlay, sourceId: cardToPlay.id, stackSnapshot: JSON.parse(JSON.stringify(stackObj)) } }, log);

        if (!cardToPlay.definition.types.some((t: string) => t.toLowerCase() === 'creature')) {
            TriggerProcessor.onEvent(state, { type: 'ON_CAST_NON_CREATURE', playerId, payload: { card: cardToPlay, sourceId: cardToPlay.id } }, log);
        }

        log(`--------------------------------------------------`);
        log(`[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}${declaredTargets?.length ? ' targeting ' + declaredTargets.join(', ') : ''}`);
        engine.checkStateBasedActions();
        engine.resetPriorityToActivePlayer();
        return true;
    }

    public static finalizeAbilityActivation(
        state: GameState,
        log: (m: string) => void,
        engine: EngineContext,
        options: FinalizeAbilityOptions
    ): boolean {
        const { playerId, obj, ability, abilityIndex, declaredTargets, preSelectedChoice } = options;
        const { AbilityType } = require('@shared/engine_types');
        const { TriggerProcessor } = require('../../effects/triggers/TriggerProcessor');
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
            name: `${obj.definition.name} Ability`,
            image_url: obj.definition.image_url,
            targets: declaredTargets,
            abilityIndex: abilityIndex,
            xValue: (obj as any).xValue,
            card: obj,
            definition: obj.definition,
            preSelectedChoice: preSelectedChoice,
            data: {
                effects: (ability as any).effects || [],
                targetDefinition: ability.targetDefinition
            }
        };

        // Mana Payment
        const manaCost = (ability.costs || []).find((cost: AbilityCost) => cost.type === 'Mana');
        if (manaCost) {
            const effectiveMana = CostProcessor.getEffectiveManaCost(state, manaCost, obj, stackObj);
            if (!ManaProcessor.canPayManaCost(playerObj, effectiveMana, state)) {
                if (ManaProcessor.canPayWithTotal(playerObj, state.battlefield, effectiveMana)) {
                    log(`Auto-tapping lands to pay ability cost ${effectiveMana}...`);
                    ManaProcessor.autoTapLandsForCost(state, playerId, effectiveMana, log, engine);
                }
            }
        }

        CostProcessor.pay(state, ability.costs || [], obj.id, playerId, (m) => log(m));

        // Clean up choice flags
        delete (state as any).lastChosenSacrificeId;
        delete (state as any).lastChosenDiscardId;

        obj.abilitiesUsedThisTurn++;
        if (ability.limitPerTurn) {
            const usageKey = `ability_${obj.id}_${abilityIndex}`;
            state.turnState.triggeredAbilitiesUsedThisTurn[usageKey] = (state.turnState.triggeredAbilitiesUsedThisTurn[usageKey] || 0) + 1;
        }

        if (ability.isManaAbility) {
            const { EffectProcessor } = require('../../effects/EffectProcessor');
            (ability as any).effects.forEach((eff: any) => {
                EffectProcessor.executeEffect({
                    state,
                    effect: eff,
                    sourceId: obj.id,
                    validTargetIds: [],
                    log: (m: string) => log(m),
                    stackObject: stackObj as any
                });
            });
            log(`Activated mana ability of ${obj.definition.name}`);
            return true;
        }

        state.stack.push(stackObj);
        log(`Activated ability of ${obj.definition.name}: ${ability.id}`);

        declaredTargets.forEach((tid: any) => {
            TriggerProcessor.onEvent(state, { type: 'ON_BECOME_TARGET', playerId, targetId: tid, sourceId: stackId, data: { sourceId: stackId, sourceCard: obj } }, log);
        });

        state.consecutivePasses = 0;
        engine.checkStateBasedActions();
        engine.resetPriorityToActivePlayer();
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
