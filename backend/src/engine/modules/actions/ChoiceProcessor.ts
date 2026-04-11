import { GameState, PlayerId, Zone, ActionType } from '@shared/engine_types';
import { m21 } from '../../data/m21';
import { EffectProcessor } from '../effects/EffectProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { ActionProcessor } from './ActionProcessor';
import { SpellProcessor } from './SpellProcessor';
import { TargetingProcessor } from './TargetingProcessor';
import { ChoiceGenerator } from '../effects/ChoiceGenerator';
import { PlayerActionProcessor } from './PlayerActionProcessor';

/**
 * Handles interactive player choices (Targeting, Modal Choices)
 */
export class ChoiceProcessor {

  public static resolveChoice(
    state: GameState,
    playerId: string,
    choiceIndex: number | string,
    log: (m: string) => void,
    engine: {
        resetPriorityToActivePlayer: () => void;
        activateAbility: (p: PlayerId, c: string, idx: number, targets: string[], bypass?: boolean) => boolean;
        finaliseTargeting?: (p: PlayerId, targets: string[]) => boolean;
        tapForMana: (p: PlayerId, c: string) => void;
        checkAutoPass?: (p: PlayerId) => void;
        passPriority?: (p: PlayerId) => void;
    }
  ): boolean {
    const action = state.pendingAction;
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
        const order = orderRaw.map(s => s.startsWith('CHOICE_') ? s.substring(7) : s);
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
        const indices = choiceIndex.split('|').map(s => {
            const raw = s.startsWith('CHOICE_') ? s.substring(7) : s;
            return parseInt(raw);
        });
        const sourceId = action.sourceId;
        const allEffects: any[] = [];
        let finalChoice: any = null;

        indices.forEach(idx => {
            const choice = action.data?.choices[idx];
            if (choice) {
                if (choice.effects) allEffects.push(...choice.effects);
                finalChoice = choice; // Use metadata from the last one if needed
            }
        });

        if (allEffects.length === 0 && !finalChoice) return false;

        state.pendingAction = undefined; // Clear modal before resolving effects

        // Resolve all effects in the batch
        if (allEffects.length > 0) {
            EffectProcessor.resolveEffects(state, allEffects, sourceId as string, [], log, 0, action.data?.stackObj, action.data?.parentContext);
        }

        // After batch is done, check if we need to move to the next player (for DiscardCards)
        const nextPlayerIds = action.data?.stackObj?.data?.nextPlayerIds || [];
        if (!state.pendingAction && nextPlayerIds.length > 0) {
            const discardAmount = action.data?.stackObj?.data?.discardAmount;
            state.pendingAction = ChoiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, action.data.label, action.data.stackObj, action.data.parentContext);
        }

        // Resume whatever was happening
        return this.resumeResolution(state, sourceId as string, action.data?.stackObj, action.data?.parentContext, log, engine);
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
    action: any,
    payload: any,
    log: (m: string) => void,
    engine: any
): boolean {
    const { ActionProcessor } = require('./ActionProcessor');
    const { top = [], bottom = [], graveyard = [] } = typeof payload === 'string' ? JSON.parse(payload) : payload;

    log(`[RESOLVING ${action.type}] ${state.players[playerId].name} reordered cards.`);

    // 1. Validate all cards are still in a valid state (optional but good)
    const cards = action.data.lookingCards || [];
    
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
    const stackObj = action.data.stackObj;
    const parentContext = action.data.parentContext;
    state.pendingAction = undefined;

    // 6. Resume resolution if needed
    if (stackObj) {
        log(`[RESOLVING] Resuming resolution after ${action.type}...`);
        return this.resumeResolution(state, action.sourceId, stackObj, parentContext, log, engine);
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
        const completed = EffectProcessor.resolveEffects(state, effs, sourceId, parentTargets, log, nextIdx, stackObj, nextParentCtx);
        
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
                   
                   if (isPermanent) {
                       ActionProcessor.moveCard(state, card, Zone.Battlefield, fullStackObj.controllerId, log);
                   } else {
                       ActionProcessor.moveCard(state, card, Zone.Graveyard, card.ownerId, log);
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

  private static handleUndo(state: GameState, playerId: string, action: any, log: (m: string) => void): boolean {
    if (action.data?.hideUndo || action.type === 'RESOLUTION_CHOICE') {
        log(`Undo not available for this mandatory action.`);
        return false;
    }

    const sourceId = action.sourceId;
    const savedActionData = action.data;

    // A. Revert Battlefield source (Activated Ability/Planeswalker)
    const objOnBattlefield = state.battlefield.find(o => o.id === sourceId);
    if (objOnBattlefield) {
        if (objOnBattlefield.abilitiesUsedThisTurn > 0) objOnBattlefield.abilitiesUsedThisTurn--;
        
        // Refund Loyalty
        const abilityIndex = savedActionData?.abilityIndex;
        if (abilityIndex !== undefined) {
            const logic = m21[objOnBattlefield.definition.name];
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
            card.xValue = undefined; // Explicitly clear
            ActionProcessor.moveCard(state, card, Zone.Hand, card.ownerId, log);
            
            const { ManaProcessor } = require('../magic/ManaProcessor');
            ManaProcessor.refundManaCost(player, card.definition.manaCost);
            log(`Undo Choice: ${card.definition.name} returned to hand.`);
        }
    }

    log(`Action cancelled.`);
    state.pendingAction = undefined;
    state.priorityPlayerId = playerId; 
    return true;
  }

  private static handleBattlefieldAbilityActivation(state: GameState, playerId: string, obj: any, choice: any, log: (m: string) => void, engine: any): boolean {
    const abilityIndex = typeof choice.value === 'number' ? choice.value : parseInt(choice.value);
    const logic = m21[obj.definition.name];
    const ability = (logic as any)?.abilities?.[abilityIndex];

    if (!ability) return false;

    if (ability.targetDefinition) {
       const targetDef = ability.targetDefinition;
       const legalTargetIds = [
          ...Object.keys(state.players),
          ...state.battlefield.map(o => o.id)
       ].filter(tid => TargetingProcessor.isLegalTarget(state, obj.id, tid, targetDef));
          
       if (legalTargetIds.length === 0) {
            if (targetDef.optional) {
                 log(`No legal targets found, auto-skipping target selection for ${obj.definition.name}.`);
                 state.pendingAction = undefined;
                 state.priorityPlayerId = playerId;
                 return engine.activateAbility(playerId, obj.id, abilityIndex, [], true);
            } else {
                log(`No legal targets available. Activation invalid.`);
                return false;
            }
       }
       
       state.pendingAction = {
          type: 'TARGETING',
          playerId,
          sourceId: obj.id,
          data: { abilityIndex, targets: legalTargetIds, optional: targetDef.optional, targetDefinition: targetDef }
       };
       state.priorityPlayerId = playerId;
       log(`Select target for ${obj.definition.name}'s ability.`);
       return true;
    }

    state.pendingAction = undefined;
    state.priorityPlayerId = playerId;
    return engine.activateAbility(playerId, obj.id, abilityIndex, [], true);
  }

  private static handleModalSelection(state: GameState, playerId: string, sourceId: string, choice: any, choiceIndex: any, action: any, log: (m: string) => void, engine: any): boolean {
    const savedTargets = action.data.declaredTargets || [];
    const costType = action.data.costType;
    
    state.pendingAction = undefined; 
    
    if (costType === 'Sacrifice') {
        (state as any).lastChosenSacrificeId = choice.value;
    } else if (costType === 'Discard') {
        (state as any).lastChosenDiscardId = choice.value;
        log(`[DEBUG] ChoiceProcessor: Set lastChosenDiscardId to ${choice.value}`);
    } else {
        (state as any).lastChoiceIndex = choiceIndex;
    }
    
    log(`Selected ${costType ? costType + ' item' : 'choice'}: ${choice.label}`);
    
    if (action.data.abilityIndex !== undefined) {
        return SpellProcessor.activateAbility(
            state, 
            playerId, 
            sourceId, 
            action.data.abilityIndex, 
            savedTargets, 
            log, 
            {
                tapForMana: (p: any, c: any) => engine.tapForMana(p, c),
                passPriority: (p: any) => engine.passPriority ? engine.passPriority(p) : engine.resetPriorityToActivePlayer(),
                checkAutoPass: (p: any) => engine.checkAutoPass ? engine.checkAutoPass(p) : engine.resetPriorityToActivePlayer()
            },
            true 
        );
    }

    return SpellProcessor.playCard(
        state, 
        playerId, 
        sourceId, 
        savedTargets, 
        log, 
        {
            tapForMana: (p: any, c: any) => engine.tapForMana ? engine.tapForMana(p, c) : true,
            checkAutoPass: (p: any) => engine.checkAutoPass ? engine.checkAutoPass(p) : engine.resetPriorityToActivePlayer(),
            passPriority: (p: any) => {}, 
            checkStateBasedActions: () => {}
        },
        true 
    );
  }

  private static handleResolutionChoice(state: GameState, sourceId: string, choice: any, action: any, log: (m: string) => void, engine: any): boolean {
    log(`Option selected: ${choice.label}`);
    const savedActionData = action.data;
    const stackObj = savedActionData?.stackObj;
    const targetsForResolution = choice.value ? [choice.value] : (savedActionData?.targets || []);
    
    state.pendingAction = undefined; 
    
    if (choice.costs && choice.costs.length > 0) {
        if (!CostProcessor.canPay(state, choice.costs, sourceId, action.playerId)) {
            log(`Insufficient resources to select: ${choice.label}`);
            return false;
        }
        CostProcessor.pay(state, choice.costs, sourceId, action.playerId, log);
    }

    if (choice.effects && choice.effects.length > 0) {
        EffectProcessor.resolveEffects(state, choice.effects, sourceId, targetsForResolution, log, 0, stackObj, savedActionData);
    }

    // Cleanup block removed from here and moved to the end


    // Resume Parent Contexts
    let currentCtx = savedActionData;
    while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex < currentCtx.effects.length) {
        log(`[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
        const nextIdx = currentCtx.nextEffectIndex;
        const effs = currentCtx.effects;
        const parentTargets = currentCtx.targets || [];
        const parentCtx = currentCtx.parentContext;
        
        currentCtx = parentCtx; 
        const completed = EffectProcessor.resolveEffects(state, effs, sourceId, parentTargets, log, nextIdx, stackObj, parentCtx);
        
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
                   
                   if (isPermanent) {
                       ActionProcessor.moveCard(state, card, Zone.Battlefield, fullStackObj.controllerId, log);
                   } else {
                       ActionProcessor.moveCard(state, card, Zone.Graveyard, card.ownerId, log);
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

  private static handleXChoice(state: GameState, playerId: string, action: any, xValue: any, log: (m: string) => void, engine: any): boolean {
    const x = parseInt(String(xValue));
    if (isNaN(x) || x < 0) {
        log(`Invalid value for X: ${xValue}`);
        return false;
    }

    const sourceId = action.sourceId;
    const card = TargetingProcessor.findObjectInAnyZone(state, sourceId);
    if (!card) return false;

    card.xValue = x;
    state.pendingAction = undefined;

    log(`${state.players[playerId].name} chose X = ${x} for ${card.definition.name}.`);

    const success = SpellProcessor.playCard(
        state, 
        playerId, 
        sourceId, 
        action.data.declaredTargets || [], 
        log, 
        {
            tapForMana: (p: any, c: any) => engine.tapForMana ? engine.tapForMana(p, c) : true,
            checkAutoPass: (p: any) => engine.checkAutoPass ? engine.checkAutoPass(p) : engine.resetPriorityToActivePlayer(),
            passPriority: (p: any) => {}, 
            checkStateBasedActions: () => {}
        },
        true 
    );

    if (success === false) {
        card.xValue = undefined;
    }
    return success;
  }
}
