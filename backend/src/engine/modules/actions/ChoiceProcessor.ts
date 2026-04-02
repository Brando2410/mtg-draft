import { GameState, PlayerId, Zone } from '@shared/engine_types';
import { M21_LOGIC } from '../../data/m21_logic';

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
        tapForMana?: (p: PlayerId, c: string) => void;
        checkAutoPass?: (p: PlayerId) => void;
    }
  ): boolean {
    const action = state.pendingAction;
    if (!action || action.playerId !== playerId) return false;

    const isModal = action.type === 'MODAL_SELECTION';
    const isResolution = action.type === 'RESOLUTION_CHOICE' || action.type === 'OPTIONAL_ACTION' || action.type === 'CHOICE';

    if (!isModal && !isResolution) return false;

    // Handle "Back/Undo"
    if (String(choiceIndex) === 'undo' || choiceIndex === -1) {
        return this.handleUndo(state, playerId, action, log);
    }

    const idx = typeof choiceIndex === 'string' ? parseInt(choiceIndex) : choiceIndex;
    const sourceId = action.sourceId;
    const choice = action.data?.choices[idx];
    
    if (!choice || !sourceId) return false;

    // 1. Handle Selection of Abilities (Planeswalkers/Modal costs in battlefield)
    const obj = state.battlefield.find(o => o.id === sourceId);
    if (obj && obj.definition.types.includes('Planeswalker') && isModal) {
        return this.handlePlaneswalkerActivation(state, playerId, obj, choice, log, engine);
    }

    // 2. Handle Casting-Phase Choices (Modes, Additional Costs)
    if (isModal || action.data?.isSpellCasting || action.data?.isCostChoice) {
        return this.handleModalSelection(state, playerId, sourceId, choice, choiceIndex, action, log, engine);
    }

    // 3. Handle Resolution-Phase Choices (Effects, Search, Scry, May)
    return this.handleResolutionChoice(state, sourceId, choice, action, log, engine);
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
            const logic = M21_LOGIC[objOnBattlefield.definition.name];
            const ability = logic?.abilities[abilityIndex];
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
            card.zone = Zone.Hand;
            player.hand.push(card);
            state.stack = state.stack.filter(s => s.id !== stackObj.id);
            
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

  private static handlePlaneswalkerActivation(state: GameState, playerId: string, obj: any, choice: any, log: (m: string) => void, engine: any): boolean {
    const { TargetingProcessor } = require('./TargetingProcessor');
    const abilityIndex = choice.value;
    const ability = M21_LOGIC[obj.definition.name].abilities[abilityIndex];

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
          data: { abilityIndex, legalTargetIds, optional: targetDef.optional, targetDefinition: targetDef }
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
    } else {
        (state as any).lastChoiceIndex = choiceIndex;
    }
    
    log(`Selected ${costType ? costType + ' item' : 'choice'}: ${choice.label}`);
    
    const { SpellProcessor } = require('./SpellProcessor');
    return SpellProcessor.playCard(
        state, 
        playerId, 
        sourceId, 
        savedTargets, 
        log, 
        {
            tapForMana: (p: any, c: any) => engine.tapForMana ? engine.tapForMana(p, c) : true,
            checkAutoPass: (p: any) => engine.checkAutoPass ? engine.checkAutoPass(p) : engine.resetPriorityToActivePlayer()
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
    
    const { EffectProcessor } = require('../effects/EffectProcessor');
    if (choice.effects && choice.effects.length > 0) {
        EffectProcessor.resolveEffects(state, choice.effects, sourceId, targetsForResolution, log, 0, stackObj, savedActionData);
    }

    // Resume Parent Contexts OR finalize resolution
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

        if (completed && stackObj) {
            const index = state.stack.indexOf(stackObj);
            if (index !== -1) {
                state.stack.splice(index, 1);
                log(`[STACK] Removed completed trigger for ${sourceId} from stack.`);
            }
        }
    }
    
    if (!state.pendingAction) {
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
    const { TargetingProcessor } = require('./TargetingProcessor');
    return TargetingProcessor.resolveInteractiveTargeting(state, playerId, targetId, log, engine);
  }
}
