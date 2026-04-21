import { AbilityCost, ActionType, EffectDefinition, GameState, PlayerId, Zone, ChoiceOption, PendingAction } from '@shared/engine_types';
import { oracle } from '../../OracleLogicMap';
import { ChoiceGenerator } from '../effects/ChoiceGenerator';
import { EffectProcessor } from '../effects/EffectProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { ActionProcessor } from './ActionProcessor';
import { PlayerActionProcessor } from './PlayerActionProcessor';
import { SpellProcessor } from './spells/SpellProcessor';
import { TargetingProcessor } from './targeting/TargetingProcessor';

import { EngineContext } from '../../interfaces/EngineContext';

/**
 * Handles interactive player choices (Targeting, Modal Choices)
 */
export class ChoiceProcessor {

  public static resolveChoice(
    state: GameState,
    playerId: string,
    choiceIndex: number | string,
    log: (m: string) => void,
    engine: EngineContext
  ): boolean {
    const action = state.pendingAction as PendingAction;
    if (!action || action.playerId !== playerId) return false;

    const isModal = action.type === 'MODAL_SELECTION';
    const isResolution = action.type === 'RESOLUTION_CHOICE' || action.type === 'OPTIONAL_ACTION' || action.type === 'CHOICE';
    const isScry = action.type === 'SCRY' || action.type === 'SURVEIL';
    const isChoosingX = action.type === 'CHOOSE_X';
    const isOrderTriggers = action.type === ActionType.OrderTriggers;

    if (!isModal && !isResolution && !isScry && !isChoosingX && !isOrderTriggers) return false;

    // Handle Trigger Ordering
    if (isOrderTriggers) {
        const orderRaw = typeof choiceIndex === 'string' ? choiceIndex.split('|') : [];
        const order = orderRaw.map(s => s.replace('CHOICE_', ''));
        return PlayerActionProcessor.resolveTriggerOrdering(state, playerId, order, log);
    }

    // Handle "Back/Undo"
    if (String(choiceIndex) === 'undo' || choiceIndex === -1) {
        return this.handleUndo(state, playerId, action, log);
    }
    
    if (isChoosingX) {
        return this.handleXChoice(state, playerId, action, choiceIndex, log, engine);
    }
    
    const isReorder = isScry; // For backward compatibility with the rest of the file


    // Handle multi-choice (batch selection) separated by '|'
    if (typeof choiceIndex === 'string' && choiceIndex.includes('|')) {
        // If it's a cost choice (TapSelection), we skip the resolution-of-effects logic
        if (action.data?.isCostChoice) {
            return this.handleModalSelection(state, playerId, action.sourceId as string, null, choiceIndex, action, log, engine);
        }
        const indices = choiceIndex.split('|').map(s => {
            const raw = s.startsWith('CHOICE_') ? s.substring(7) : s;
            return parseInt(raw);
        });
        const sourceId = action.sourceId;
        const allEffects: EffectDefinition[] = [];
        let finalChoice: ChoiceOption | null = null;

        indices.forEach(idx => {
            const choice = action.data?.choices?.[idx];
            if (choice) {
                if (choice.effects) allEffects.push(...choice.effects);
                finalChoice = choice; // Use metadata from the last one if needed
            }
        });

        if (allEffects.length === 0 && !finalChoice) return false;

        state.pendingAction = undefined; // Clear modal before resolving effects

        // Resolve all effects in the batch
        if (allEffects.length > 0) {
            const discardEffects = allEffects.filter(e => e.type === 'MoveToZone' && e.isDiscard);
            if (discardEffects.length > 0) {
                state.turnState.lastDiscardedCount = discardEffects.length;
                state.turnState.lastDiscardedIds = [];
            }
            EffectProcessor.resolveEffects({
                state,
                effects: allEffects,
                sourceId: sourceId as string,
                targets: [],
                log,
                startIndex: 0,
                stackObject: action.data?.stackObj,
                parentContext: action.data?.parentContext,
            });
        }

        // After batch is done, check if we need to move to the next player (for DiscardCards)
        const nextPlayerIds = action.data?.nextPlayerIds || action.data?.stackObj?.data?.nextPlayerIds || [];
        if (!state.pendingAction && nextPlayerIds.length > 0) {
            const discardAmount = action.data?.discardAmount || action.data?.stackObj?.data?.discardAmount || 1;
            const failureEffects = action.data?.onFailureEffects || action.data?.stackObj?.data?.onFailureEffects;
            state.pendingAction = ChoiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, action.data?.label || "Discard", action.data?.stackObj, action.data?.parentContext, failureEffects);
        }

        // Resume whatever was happening - CRITICAL: must start from action.data to catch local effects (like Draw after Discard)
        return this.resumeResolution(state, sourceId as string, action.data?.stackObj, action.data, log, engine);
    }

    // 3. Handle Scry/Surveil Reordering early as payload is not an index
    if (isScry) {
        return this.handleScrySurveil(state, playerId, action, choiceIndex, log, engine);
    }

    const rawIdx = typeof choiceIndex === 'string' && choiceIndex.startsWith('CHOICE_') ? choiceIndex.substring(7) : choiceIndex;
    const idx = typeof rawIdx === 'string' ? parseInt(rawIdx) : rawIdx;
    const sourceId = action.sourceId;
    const choice = action.data?.choices?.[idx];
    
    if (!choice || !sourceId) return false;

    // 1. Handle Selection of Abilities (Planeswalkers/Modal costs in battlefield)
    const obj = state.battlefield.find(o => o.id === sourceId);
    if (obj && isModal && !action.data?.isCostChoice) {
        return this.handleBattlefieldAbilityActivation(state, playerId, obj, choice, log, engine);
    }

    // 2. Handle Casting-Phase Choices (Modes, Additional Costs)
    if (isModal || action.data?.isSpellCasting || action.data?.isCostChoice) {
        return this.handleModalSelection(state, playerId, sourceId, choice, choiceIndex, action, log, engine);
    }

    // 4. Handle Resolution-Phase Choices (Effects, Search, Scry, May)
    return this.handleResolutionChoice(state, sourceId, choice, action, log, engine);
}

private static handleScrySurveil(
    state: GameState,
    playerId: string,
    action: PendingAction,
    payload: any,
    log: (m: string) => void,
    engine: any
): boolean {
    const { ActionProcessor } = require('./ActionProcessor');
    const { top = [], bottom = [], graveyard = [] } = (typeof payload === 'string' ? JSON.parse(payload) : payload) as { top?: string[], bottom?: string[], graveyard?: string[] };

    log(`[RESOLVING ${action.type}] ${state.players[playerId].name} reordered cards.`);
    
    // Track result for UI
    state.turnState.lastScrySurveilResult = {
        playerId,
        top: top.length,
        bottom: bottom.length,
        graveyard: graveyard.length,
        type: action.type,
        timestamp: Date.now()
    };

    // 1. Validate all cards are still in a valid state (optional but good)
    const cards = action.data?.lookingCards || [];
    
    // 2. Clear current state ofThese cards (they were pulled from library top)
    // Actually, in EffectProcessor they were popped from the library.
    
    // 3. Move cards to Bottom (Scry) or Graveyard (Surveil)
    bottom.forEach((id: string) => {
        const card = cards.find((c: any) => c.id === id);
        if (card) {
            ActionProcessor.moveCard(state, card, Zone.Library, playerId, log, 'bottom');
        }
    });

    graveyard.forEach((id: string) => {
        const card = cards.find((c: any) => c.id === id);
        if (card) {
            ActionProcessor.moveCard(state, card, Zone.Graveyard, playerId, log);
        }
    });

    // 4. Move cards to Top (Reverse order to maintain stack order)
    [...top].reverse().forEach((id: string) => {
        const card = cards.find((c: any) => c.id === id);
        if (card) {
            ActionProcessor.moveCard(state, card, Zone.Library, playerId, log, 'top');
        }
    });

    // 5. Cleanup
    const stackObj = action.data?.stackObj;
    state.pendingAction = undefined;

    // 6. Resume resolution if needed - CRITICAL: must start from action.data to catch local effects
    if (stackObj) {
        log(`[RESOLVING] Resuming resolution after ${action.type}...`);
        return this.resumeResolution(state, action.sourceId!, stackObj, action.data, log, engine);
    }

    engine.resetPriorityToActivePlayer();
    return true;
}

private static resumeResolution(state: GameState, sourceId: string, stackObj: any, parentContext: any, log: (m: string) => void, engine: any): boolean {
    // This logic is mostly copied from handleResolutionChoice to be DRY
    let currentCtx = { ...parentContext, stackObj }; // Wrap to start resuming
    
    // First, check if the object we are resuming is actually done
    // Cleanup moved to end to support multi-effect spells


    // Then resume parent contexts
    while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex < currentCtx.effects.length) {
        log(`[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
        const nextIdx = currentCtx.nextEffectIndex;
        const effs = currentCtx.effects;
        const parentTargets = currentCtx.targets || [];
        const nextParentCtx = currentCtx.parentContext;
        
        currentCtx = nextParentCtx; 
        const completed = EffectProcessor.resolveEffects({
            state,
            effects: effs,
            sourceId,
            targets: parentTargets,
            log,
            startIndex: nextIdx,
            stackObject: stackObj,
            parentContext: nextParentCtx,
        });
        
        if (stackObj && !completed && state.pendingAction) {
           stackObj.data = { ...stackObj.data, nextEffectIndex: (state.pendingAction as any).data.nextEffectIndex };
        }
    }
    
    if (!state.pendingAction) {
       if (stackObj) {
           const fullStackObj = state.stack.find(s => s.id === stackObj.id);
           if (fullStackObj) {
               if (fullStackObj.type === 'Spell' && fullStackObj.card) {
                   const card = fullStackObj.card;
                   const types = card.definition.types.map(t => (t as string).toLowerCase());
                   const isPermanent = types.includes('creature') || types.includes('artifact') || types.includes('enchantment') || types.includes('planeswalker');
                    
                    if (card.zone === Zone.Stack) {
                        const { oracle } = require("../../OracleLogicMap");
                        const freshDef = oracle.getCard(card.definition.name);
                        const shouldExile = fullStackObj.exileOnResolution || (fullStackObj as any).isCopy || (card as any).isPreparedCopy || freshDef?.exileOnResolution;

                        if (shouldExile) {
                            log(`[RULE 701.5] ${card.definition.name} was exiled instead of being put into graveyard.`);
                            ActionProcessor.removeFromCurrentZone(state, card);
                            if (!(fullStackObj as any).isCopy) {
                                ActionProcessor.moveCard(state, card, Zone.Exile, card.ownerId, log);
                            }
                        } else if (isPermanent) {
                            ActionProcessor.moveCard(state, card, Zone.Battlefield, fullStackObj.controllerId, log);
                        } else {
                            ActionProcessor.moveCard(state, card, Zone.Graveyard, card.ownerId, log);
                        }
                    }
               } else {
                   // Clean up ability/trigger
                   ActionProcessor.removeFromCurrentZone(state, { id: fullStackObj.id, zone: Zone.Stack } as any);
               }
               log(`[STACK] Completed resolution of ${stackObj.type} for ${sourceId}.`);
           }
       }
       engine.resetPriorityToActivePlayer(); 
    } else {
       state.priorityPlayerId = (state as any).pendingAction.playerId || null;
    }
    return true;
}

  private static handleUndo(state: GameState, playerId: string, action: PendingAction, log: (m: string) => void): boolean {
    if (action.data?.hideUndo || action.type === 'RESOLUTION_CHOICE') {
        log(`Undo not available for this mandatory action.`);
        return false;
    }

    const sourceId = action.sourceId!;
    const savedActionData = action.data;

    // A. Revert Battlefield source (Activated Ability/Planeswalker)
    const objOnBattlefield = state.battlefield.find(o => o.id === sourceId);
    if (objOnBattlefield) {
        // ONLY decrement usage and refund if the ability was actually finalized (paid for)
        // increments happen in SpellProcessor.finalizeAbilityActivation
        const abilityIndex = savedActionData?.abilityIndex;
        if (objOnBattlefield.abilitiesUsedThisTurn > 0 && abilityIndex !== undefined) {
            objOnBattlefield.abilitiesUsedThisTurn--;
            
            // Refund Loyalty
            const logic = oracle.getCard(objOnBattlefield.definition.name);
            const ability = (logic?.abilities as any)?.[abilityIndex];
            const lCost = ability?.costs?.find((c: any) => c.type === 'Loyalty')?.value;
            if (lCost !== undefined) {
                objOnBattlefield.counters['loyalty'] = (objOnBattlefield.counters['loyalty'] || 0) - lCost;
                log(`Refunded loyalty for ${objOnBattlefield.definition.name}: ${lCost > 0 ? '+' : ''}${lCost}`);
            }
        }
    }

    // B. Revert Stack source (Putting a spell back in hand)
    const stackObj = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
    if (stackObj && stackObj.card) {
        const card = stackObj.card;
        const player = state.players[card.ownerId];
        if (player) {
            const refundCost = card.definition.manaCost;
            card.xValue = undefined; // Explicitly clear
            ActionProcessor.moveCard(state, card, Zone.Hand, card.ownerId, log);
            
            const { ManaProcessor } = require('../magic/ManaProcessor');
            ManaProcessor.refundManaCost(player, refundCost);
            log(`Undo Choice: ${card.definition.name} returned to hand.`);
        }
    }

    // C. Revert Hand source (MDFC selection phase)
    const player = state.players[playerId];
    const cardInHand = player?.hand.find(c => c.id === sourceId);
    if (cardInHand) {
        (cardInHand as any).selectedFaceDefinition = undefined;
    }

    const { ManaProcessor } = require('../magic/ManaProcessor');

    // Revert Auto-tap lands if we were in the confirmation step
    if (savedActionData?.tappedLandIds && Array.isArray(savedActionData.tappedLandIds)) {
        ManaProcessor.untapLands(state, savedActionData.tappedLandIds);
        
        if (savedActionData.manaSnapshot) {
            // Precise cleanup: Restore EXACT state before auto-tap
            player.manaPool = savedActionData.manaSnapshot;
            player.restrictedMana = savedActionData.restrictedSnapshot || [];
            log(`Undo: Untapped ${savedActionData.tappedLandIds.length} lands and restored mana pool.`);
        } else if (savedActionData.producedMana) {
            // Precision cleanup (via tracked production)
            const pm = savedActionData.producedMana;
            Object.entries(pm).forEach(([color, amount]) => {
                if ((amount as number) > 0) {
                    player.manaPool[color as keyof typeof player.manaPool] -= (amount as number);
                }
            });
            log(`Undo: Untapped ${savedActionData.tappedLandIds.length} lands and cleared auto-tapped mana.`);
        } else if (savedActionData.totalMana) {
            // Fallback (older actions)
            ManaProcessor.refundManaCost(player, savedActionData.totalMana);
            log(`Undo: Untapped ${savedActionData.tappedLandIds.length} lands and refunded mana.`);
        }
    }

    log(`Action cancelled.`);
    state.pendingAction = undefined;
    state.priorityPlayerId = playerId; 

    // CLEANUP TEMPORARY CASTING STATE
    delete (state as any).lastChosenCostChoiceIndex;
    delete (state as any).lastChosenSacrificeId;
    delete (state as any).lastChosenDiscardId;
    delete (state as any).lastChosenExileIds;
    delete (state as any).lastChosenModeIndex;
    delete (state as any).lastChoiceIndex;
    
    return true;
  }

  private static handleBattlefieldAbilityActivation(state: GameState, playerId: string, obj: any, choice: ChoiceOption, log: (m: string) => void, engine: any): boolean {
    if (choice.value === 'none') {
        state.pendingAction = undefined;
        state.priorityPlayerId = playerId;
        log(`Action cancelled.`);
        return true;
    }

    const abilityIndex = typeof choice.value === 'number' ? choice.value : parseInt(choice.value);
    const logic = oracle.getCard(obj.definition.name);
    const ability = (logic as any)?.abilities?.[abilityIndex];

    if (!ability) return false;

    if (ability.targetDefinition) {
       const targetDef = ability.targetDefinition;
        const pool = [
           ...Object.keys(state.players),
           ...state.battlefield.map(o => o.id),
           ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id)),
           ...state.exile.map(o => o.id),
           ...state.stack.map(o => o.id)
        ];
        const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(targetDef, (obj as any).xValue || 0);
        const legalTargetIds = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
            sourceId: obj.id,
            controllerId: obj.controllerId,
            targetDef
        }, tid));
        
        if (legalTargetIds.length === 0 && minCount === 0) {
            log(`No targets found, auto-skipping target selection for ${obj.definition.name} (+1 ability).`);
            state.priorityPlayerId = playerId;
            state.pendingAction = undefined;
            return engine.activateAbility({
                playerId,
                cardId: obj.id,
                abilityIndex,
                bypassPriority: true,
                bypassTargeting: true
            });
       }

       if (legalTargetIds.length < minCount) {
            if (targetDef.optional) {
                 log(`No valid targets found, auto-skipping target selection for ${obj.definition.name}.`);
                 state.pendingAction = undefined;
                 state.priorityPlayerId = playerId;
                  return engine.activateAbility({
                      playerId,
                      cardId: obj.id,
                      abilityIndex,
                      bypassPriority: true,
                      bypassTargeting: true
                  });
            } else {
                log(`No legal targets available. Activation invalid.`);
                return false;
            }
       }
       
       const isGraveyardTargeting = targetDef.type === 'CardInGraveyard';
       
       if (isGraveyardTargeting && legalTargetIds.length > 0) {
           const { ChoiceGenerator } = require('../effects/ChoiceGenerator');
           const { ActionType: AT } = require('@shared/engine_types');
           
           const action = ChoiceGenerator.createCardChoice(
               state,
               legalTargetIds.map((id: string) => TargetingProcessor.findObjectInAnyZone(state, id)!),
               {
                   label: "Select a card from graveyard",
                   playerId,
                   sourceId: obj.id,
                   optional: targetDef.minCount === 0 || targetDef.optional,
                   actionType: AT.ModalSelection,
                   filterSelectable: true,
                   minChoices: targetDef.minCount !== undefined ? targetDef.minCount : 0,
                   maxChoices: targetDef.count || 1
               }
           );
           
           if (action && action.data) {
               action.data.abilityIndex = abilityIndex;
               action.data.isTargetingModal = true;
           }
           state.pendingAction = action;
           
           log(`Select target from graveyard for ${obj.definition.name}'s ability.`);
           return true;
       }
       
        state.pendingAction = {
            type: 'TARGETING',
            playerId,
            sourceId: obj.id,
            data: { 
                label: 'Select Target',
                abilityIndex, 
                targets: legalTargetIds, 
                optional: targetDef.optional, 
                targetDefinition: targetDef,
                maxCount,
                minCount,
                count
            }
        };
       state.priorityPlayerId = playerId;
       log(`Select target for ${obj.definition.name}'s ability.`);
       return true;
    }

    state.pendingAction = undefined;
    state.priorityPlayerId = playerId;
    return engine.activateAbility({
        playerId,
        cardId: obj.id,
        abilityIndex,
        bypassPriority: true,
        bypassTargeting: true
    });
  }

  private static handleModalSelection(state: GameState, playerId: string, sourceId: string, choice: ChoiceOption | null, choiceIndex: any, action: PendingAction, log: (m: string) => void, engine: any): boolean {
    const savedTargets = action.data?.declaredTargets || [];
    const costType = action.data?.costType;
    if (log) log(`[DEBUG] handleModalSelection: costType=${costType}, choiceIndex=${choiceIndex}, choiceValue=${choice?.value}`);

    // Robustly resolve 'choice' if it's null (e.g. from batch selects)
    if (!choice && choiceIndex !== undefined) {
        let idxStr = String(choiceIndex);
        if (idxStr.includes('|')) idxStr = idxStr.split('|')[0];
        const idx = parseInt(idxStr.startsWith('CHOICE_') ? idxStr.substring(7) : idxStr);
        choice = action.data?.choices?.[idx] || null;
        if (log) log(`[DEBUG] handleModalSelection: resolved choice from idx ${idx}: ${choice?.label} (${choice?.value})`);
    }
    
    if (!choice) return false;

    state.pendingAction = undefined; 
    
    if (costType === 'Sacrifice') {
        (state as any).lastChosenSacrificeId = choice?.value;
    } else if (costType === 'Discard') {
        (state as any).lastChosenDiscardId = choice?.value;
        log(`[DEBUG] ChoiceProcessor: Set lastChosenDiscardId to ${choice?.value}`);
    } else if (costType === 'TapSelection' || costType === 'Exile') {
        if (log) log(`[DEBUG] handleModalSelection: Processing ${costType} cost...`);
        // Multi-select might have been passed as choiceIndex batch or single
        if (action.data?.maxChoices && action.data.maxChoices > 1) {
             const batchIds = typeof choiceIndex === 'string' && choiceIndex.includes('|') 
                ? choiceIndex.split('|').map(s => {
                    const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                    return action.data?.choices?.[i]?.value;
                }).filter(v => v)
                : [choice?.value].filter(v => v);
              
             if (costType === 'TapSelection') (state as any).lastChosenTapSelectionIds = batchIds;
             else (state as any).lastChosenExileIds = batchIds;
        } else {
             if (costType === 'TapSelection') (state as any).lastChosenTapSelectionIds = [choice?.value].filter(v => v);
             else (state as any).lastChosenExileIds = [choice?.value].filter(v => v);
        }
    } else if (choice && String(choice.value).startsWith('FACE_SELECTION_')) {
        const faceIdx = parseInt(String(choice.value).substring(15));
        const card = TargetingProcessor.findObjectInAnyZone(state, sourceId);
        if (card && card.definition.faces) {
            (card as any).selectedFaceDefinition = card.definition.faces[faceIdx];
        }
    } else if (choice && String(choice.value).startsWith('COST_CHOICE_')) {
        const choiceIdx = parseInt(String(choice.value).substring(12));
        (state as any).lastChosenCostChoiceIndex = choiceIdx;
    } else if (choice && String(choice.value).startsWith('MODE_SELECTION_')) {
        if (typeof choiceIndex === 'string' && choiceIndex.includes('|')) {
            const indices = choiceIndex.split('|').map(s => {
                const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                const val = action.data?.choices?.[i]?.value;
                return parseInt(String(val).substring(15));
            });
            (state as any).lastChosenModeIndex = indices;
        } else {
            const modeIdx = parseInt(String(choice.value).substring(15));
            (state as any).lastChosenModeIndex = [modeIdx];
        }
    } else {
        (state as any).lastChoiceIndex = choiceIndex;
    }
    
    log(`Selected ${costType ? costType + ' item' : 'choice'}: ${choice.label}`);
    
    if (action.data?.abilityIndex !== undefined) {
        let targets = savedTargets;
        if (action.data.isTargetingModal) {
            targets = choice.value === 'none' ? [] : (Array.isArray(choice.value) ? choice.value : [choice.value]);
        }

        return SpellProcessor.activateAbility(
            state, 
            log, 
            engine,
            {
                playerId, 
                cardId: sourceId, 
                abilityIndex: action.data.abilityIndex, 
                targets, 
                xValue: action.data.xValue,
                bypassPriority: true,
                bypassTargeting: false
            }
        );
    }

    // --- RESUME AFTER INTERACTIVE COST ---
    if (action.data?.isCostChoice && (action.data?.stackObj || action.data?.nextEffectIndex !== undefined)) {
        log(`[RESOLVING] Resuming resolution after interactive cost ${costType}...`);
        const { EffectProcessor } = require('./../effects/EffectProcessor');
        
        // 1. Pay the interactive cost (IDs already in state)
        // We create a dummy cost object to trigger the payment logic in CostProcessor
        const costToPay = { type: action.data.costType, amount: action.data.maxChoices, value: action.data.maxChoices } as any;
        CostProcessor.pay(state, [costToPay], sourceId, playerId, log);
        
        // 2. Pay any remaining costs that were part of the same choice
        if (action.data.remainingCosts && action.data.remainingCosts.length > 0) {
            CostProcessor.pay(state, action.data.remainingCosts, sourceId, playerId, log);
        }

        // 3. Resolve the effects of the choice
        if (action.data.choiceEffects && action.data.choiceEffects.length > 0) {
             EffectProcessor.resolveEffects({
                state,
                effects: action.data.choiceEffects,
                sourceId,
                targets: savedTargets,
                log,
                startIndex: 0,
                stackObject: action.data.stackObj,
                parentContext: action.data.parentContext,
                controllerIdOverride: playerId,
                lookingCards: action.data.lookingCards,
             });
        }

        // 4. Resume parent resolution
        const stackObj = action.data.stackObj;
        let currentCtx = action.data.parentContext;
        while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex < currentCtx.effects.length) {
            log(`[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
            const nextIdx = currentCtx.nextEffectIndex;
            const effs = currentCtx.effects;
            const parentTargets = currentCtx.targets || currentCtx.parentContext?.targets || [];
            const parentCtx = currentCtx.parentContext;
            
            currentCtx = parentCtx; 
            const completed = EffectProcessor.resolveEffects({
                state,
                effects: effs,
                sourceId,
                targets: parentTargets,
                log,
                startIndex: nextIdx,
                stackObject: stackObj,
                parentContext: parentCtx,
                lookingCards: action.data.lookingCards,
            });
            
            if (stackObj && !completed && state.pendingAction) {
               stackObj.data = { ...stackObj.data, nextEffectIndex: (state.pendingAction as any).data.nextEffectIndex };
            }
        }

        this.finalizeResolution(state, sourceId, stackObj, action, log, engine);
        return true;
    }

    if (action.data?.confirmedAutoTap) {
        (state as any).confirmedAutoTap = true;
    }

    let finalTargets = savedTargets;
    if (action.data?.isTargetingModal) {
        // Resolve target(s) from choice(s)
        if (typeof choiceIndex === 'string' && choiceIndex.includes('|')) {
            finalTargets = choiceIndex.split('|').map(s => {
                const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                return action.data?.choices?.[i]?.value;
            }).filter(v => v);
        } else {
            finalTargets = choice?.value ? [choice.value] : [];
        }
        log(`[DEBUG] ChoiceProcessor: Mapping targeting modal selection to targets: ${JSON.stringify(finalTargets)}`);
    }

    return SpellProcessor.playCard(
        state, 
        log, 
        engine,
        {
            playerId, 
            cardId: sourceId, 
            targets: finalTargets, 
            xValue: action.data?.xValue,
            bypassPriority: true,
            bypassTargeting: false
        }
    );
  }

  private static handleResolutionChoice(state: GameState, sourceId: string, choice: ChoiceOption, action: PendingAction, log: (m: string) => void, engine: EngineContext): boolean {
    log(`Option selected: ${choice.label}`);
    const savedActionData = action.data;
    const stackObj = savedActionData?.stackObj;
    const parentTargets = (action.data?.targets || savedActionData?.targets || action.data?.parentContext?.targets || savedActionData?.parentContext?.targets || []);
    let targetsForResolution = parentTargets;
    if (choice.value && typeof choice.value === 'string' && choice.value.length > 20) {
        targetsForResolution = [choice.value, ...parentTargets];
    }

    if (choice.costs && choice.costs.length > 0) {
        if (!CostProcessor.canPay(state, choice.costs, sourceId, action.playerId)) {
            log(`Insufficient resources to select: ${choice.label}`);
            return false;
        }

        state.pendingAction = undefined; 

        // INTERACTIVE COST TRIGGER
        const interactiveCost = choice.costs.find((c: AbilityCost) => 
            (c.type === 'TapSelection' && !(state as any).lastChosenTapSelectionIds) ||
            (c.type === 'Discard' && !(state as any).lastChosenDiscardId) ||
            (c.type === 'Sacrifice' && !(state as any).lastChosenSacrificeId && !this.isSelfSac(c, sourceId)) ||
            (c.type === 'Exile' && !(state as any).lastChosenExileIds)
        );
        
        if (interactiveCost) {
            const { ChoiceGenerator } = require('./../effects/ChoiceGenerator');
            state.pendingAction = ChoiceGenerator.createCostInteractionChoice(state, interactiveCost, sourceId, action.playerId, choice, action.data);
            log(`[INTERACTIVE-COST] Prompting for ${interactiveCost.type} cost selection...`);
            return true;
        }

        CostProcessor.pay(state, choice.costs as AbilityCost[], sourceId, action.playerId, log);
    } else {
        state.pendingAction = undefined; 
    }

    if (choice.effects && choice.effects.length > 0) {
        EffectProcessor.resolveEffects({
            state,
            effects: choice.effects,
            sourceId,
            targets: targetsForResolution,
            log,
            startIndex: 0,
            stackObject: stackObj,
            parentContext: savedActionData as any,
            controllerIdOverride: action.playerId,
            lookingCards: savedActionData?.lookingCards,
        });
    }

    // Cleanup block removed from here and moved to the end


    // Resume Parent Contexts
    let currentCtx = savedActionData as any;
    while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex < currentCtx.effects.length) {
        log(`[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
        const nextIdx = currentCtx.nextEffectIndex;
        const effs = currentCtx.effects;
        const parentTargets = currentCtx.targets || currentCtx.parentContext?.targets || [];
        const parentCtx = currentCtx.parentContext;
        
        currentCtx = parentCtx; 
        const completed = EffectProcessor.resolveEffects({
            state,
            effects: effs,
            sourceId,
            targets: parentTargets,
            log,
            startIndex: nextIdx,
            stackObject: stackObj,
            parentContext: parentCtx,
            lookingCards: savedActionData?.lookingCards,
        });
        
        if (stackObj && !completed && state.pendingAction) {
           stackObj.data = { ...stackObj.data, nextEffectIndex: (state.pendingAction as any).data.nextEffectIndex };
        }
    }

    // --- NEXT PLAYER DISCARD CHECK ---
    if (!state.pendingAction) {
        const nextPlayerIds = action.data?.nextPlayerIds || action.data?.stackObj?.data?.nextPlayerIds || [];
        log(`[DISCARD-DEBUG] Resolution finished for current player. Checking queue...`);
        log(`[DISCARD-DEBUG] Is nextPlayerIds present? ${!!nextPlayerIds}. Length: ${nextPlayerIds.length}`);
        
        if (nextPlayerIds.length > 0) {
            log(`[CHOICE-SEQUENCE] Advancing to next player: ${nextPlayerIds[0]}`);
            const discardAmount = action.data?.discardAmount || action.data?.stackObj?.data?.discardAmount || 1;
            const failureEffects = action.data?.onFailureEffects || action.data?.stackObj?.data?.onFailureEffects;
            
            if (action.type === 'RESOLUTION_CHOICE' && action.data?.choices && !action.data.lookingCards) {
                 // Sequenced Modal Choice
                 state.pendingAction = ChoiceGenerator.createModalChoice(
                    state,
                    {
                        label: action.data.label,
                        playerId: nextPlayerIds[0],
                        sourceId: sourceId as string,
                        actionType: action.type as ActionType,
                        hideUndo: action.data.hideUndo,
                        stackObj: action.data.stackObj,
                        parentContext: action.data.parentContext
                    },
                    (action.data.choices as any[]).map(c => ({ label: c.label, value: c.value, costs: c.costs, effects: c.effects }))
                 );
                 if (state.pendingAction && state.pendingAction.data) {
                    state.pendingAction.data.nextPlayerIds = nextPlayerIds.slice(1);
                 }
            } else if (action.data?.isSacrificeSequence) {
                 // Sequenced Sacrifice Choice
                 const { PermanentHandler } = require('../effects/handlers/PermanentHandler');
                 const realEffect = action.data.parentContext?.effects?.[action.data.parentContext?.nextEffectIndex];
                 PermanentHandler.handleSacrifice(state, log, {
                     sourceId: sourceId as string,
                     controllerId: nextPlayerIds[0],
                     targets: nextPlayerIds,
                     stackObject: action.data.stackObj,
                     parentContext: action.data.parentContext
                 }, realEffect || { label: action.data.label });
            } else if (action.data?.isChoiceSequence) {
                 // Sequenced Choice (Auto-Sequence)
                 const { ChoiceEffectHandler } = require('../effects/handlers/ChoiceEffectHandler');
                 ChoiceEffectHandler.handleChoice(state, action.data.sequencedEffect, log, {
                     sourceId: sourceId as string,
                     controllerId: nextPlayerIds[0],
                     targets: nextPlayerIds,
                     stackObject: action.data.stackObj,
                     parentContext: action.data.parentContext
                 });
            } else {
                 // Sequenced Discard Choice
                 state.pendingAction = ChoiceGenerator.createDiscardChoice(
                    state, 
                    nextPlayerIds, 
                    sourceId as string, 
                    discardAmount, 
                    action.data!.label || "Discard", 
                    action.data!.stackObj, 
                    action.data!.parentContext, 
                    failureEffects,
                    log
                );
            }
        }
    }
    this.finalizeResolution(state, sourceId, stackObj, action, log, engine);
    return true;
  }

  private static finalizeResolution(state: GameState, sourceId: string, stackObj: any, action: PendingAction, log: (m: string) => void, engine: any) {
    if (!state.pendingAction) {
       if (stackObj) {
           const fullStackObj = state.stack.find(s => s.id === stackObj.id);
           if (fullStackObj) {
               if (fullStackObj.type === 'Spell' && fullStackObj.card) {
                   const card = fullStackObj.card;
                   const types = card.definition.types.map(t => (t as string).toLowerCase());
                   const isPermanent = types.includes('creature') || types.includes('artifact') || types.includes('enchantment') || types.includes('planeswalker');
                   
                    if (card.zone !== Zone.Stack) {
                        log(`[STACK] Spell card ${card.definition.name} already moved to ${card.zone}. Skipping cleanup.`);
                    } else {
                        const { oracle } = require("../../OracleLogicMap");
                        const freshDef = oracle.getCard(card.definition.name);
                        const shouldExile = fullStackObj.exileOnResolution || (fullStackObj as any).isCopy || (card as any).isPreparedCopy || freshDef?.exileOnResolution;

                        if (shouldExile) {
                            log(`[RULE 701.5] ${card.definition.name} was exiled instead of being put into graveyard.`);
                            ActionProcessor.removeFromCurrentZone(state, card);
                            if (!(fullStackObj as any).isCopy) {
                                ActionProcessor.moveCard(state, card, Zone.Exile, card.ownerId, log);
                            }
                        } else if (isPermanent) {
                            ActionProcessor.moveCard(state, card, Zone.Battlefield, fullStackObj.controllerId, log);
                        } else {
                            ActionProcessor.moveCard(state, card, Zone.Graveyard, card.ownerId, log);
                        }
                    }
               } else {
                   // Clean up ability/trigger
                   ActionProcessor.removeFromCurrentZone(state, { id: fullStackObj.id, zone: Zone.Stack } as any);
               }
               log(`[STACK] Completed resolution of ${stackObj.type} for ${sourceId}.`);
           }
       }
       engine.resetPriorityToActivePlayer(); 
    } else {
       state.priorityPlayerId = (state as any).pendingAction.playerId || null;
    }
  }

  private static isSelfSac(cost: any, sourceId: string): boolean {
    return cost.targetMapping === 'SELF' || (cost.restrictions || []).some((r: any) => typeof r === 'string' && r.toLowerCase() === 'self');
  }

  public static resolveTargeting(
    state: GameState,
    playerId: PlayerId,
    targetId: string,
    log: (m: string) => void,
    engine: {
        resetPriorityToActivePlayer: () => void;
        finaliseTargeting: (p: PlayerId, targets: string[]) => boolean;
    }
  ): boolean {
    return TargetingProcessor.resolveInteractiveTargeting(state, playerId, targetId, log, engine);
  }

  private static handleXChoice(state: GameState, playerId: string, action: PendingAction, xValue: any, log: (m: string) => void, engine: any): boolean {
    let x = 0;
    if (typeof xValue === 'object' && xValue !== null && 'x' in xValue) {
        x = parseInt(String(xValue.x));
    } else {
        x = parseInt(String(xValue));
    }

    if (isNaN(x) || x < 0) {
        log(`Invalid value for X: ${JSON.stringify(xValue)}`);
        return false;
    }

    const sourceId = action.sourceId!;
    const card = TargetingProcessor.findObjectInAnyZone(state, sourceId);
    if (!card) {
        log(`[CHOOSE_X] Error: Could not find card for sourceId ${sourceId}`);
        return false;
    }

    card.xValue = x;
    state.pendingAction = undefined;

    log(`${state.players[playerId].name} chose X = ${x} for ${card.definition.name}.`);

    const abilityIndex = action.data?.abilityIndex;
    let success = false;
    
    if (abilityIndex !== undefined) {
        success = SpellProcessor.activateAbility(
            state, 
            log, 
            engine,
            {
                playerId, 
                cardId: sourceId, 
                abilityIndex,
                targets: action.data?.declaredTargets || [], 
                xValue: x,
                bypassPriority: true,
                bypassTargeting: false
            }
        );
    } else {
        success = SpellProcessor.playCard(
            state, 
            log, 
            engine,
            {
                playerId, 
                cardId: sourceId, 
                targets: action.data?.declaredTargets || [], 
                xValue: x,
                bypassPriority: true,
                bypassTargeting: false
            }
        );
    }

    if (success === false) {
        card.xValue = undefined;
    }
    return success;
  }
}
