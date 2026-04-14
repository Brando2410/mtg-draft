import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject, ActionType, EffectType, TargetMapping } from '@shared/engine_types';
import { ActionProcessor } from '../../actions/ActionProcessor';
import { TriggerProcessor } from '../TriggerProcessor';
import { ChoiceGenerator } from '../ChoiceGenerator';
import { TargetingProcessor } from '../../actions/TargetingProcessor';

/**
 * Strategy for CR 701: Keyword Actions (Zone Movement)
 */
export class MoveEffectHandler {

  public static handle(
    state: GameState,
    effect: EffectDefinition,
    targets: string[],
    log: (m: string) => void,
    controllerId: PlayerId,
    stackObject?: any,
    parentContext?: any
  ) {
    const targetIds = targets.length > 0 ? targets : ((stackObject as any)?.targets || []);
    const selectionType = effect.selectionType || 'Target';

    // Rule: Resolve default destination for specific movement keywords
    if (!effect.zone && !effect.destination) {
        if (effect.type === 'Exile' || effect.type === 'ExileTopCard' || effect.type === 'ExileAllCards') {
            (effect as any).destination = Zone.Exile;
        } else if (effect.type === 'DrawCards' || effect.type === 'ReturnToHand' || effect.type === 'MoveToZone' || effect.type === 'PutInHand') {
            (effect as any).destination = Zone.Hand;
        } else if (effect.type === EffectType.DiscardCards || (effect.type as any) === 'Mill' || (effect.type as any) === 'Discard') {
            (effect as any).destination = Zone.Graveyard;
        }
    }

    log(`[MOVE-ZONE] Type: ${effect.type}, Selection: ${selectionType}, Destination: ${effect.destination || effect.zone}`);

    // Map legacy effect types to selection modes if needed
    if (effect.type === 'DrawCards') {
        return this.resolveDrawCards(state, effect, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'Mill') {
        return this.resolveMill(state, effect, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'SearchLibrary') {
        return this.resolveLibrarySearch(state, { ...effect, selectionType: 'Search', sourceZones: effect.sourceZones || [Zone.Library], shuffle: true, reveal: true }, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'Scry') {
        return this.resolveScry(state, effect, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'Surveil') {
        return this.resolveSurveil(state, effect, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === EffectType.LookAtTopAndPick) {
        return this.resolveLookAtTopAndPick(state, effect, controllerId, log, stackObject, parentContext);
    }

    if (effect.type === EffectType.ExchangeHandAndGraveyard) {
        return this.resolveExchangeHandAndGraveyard(state, effect, targets, controllerId, log);
    }

    if (effect.type === 'PutRemainderOnBottomRandom' && targetIds.length > 1) {
        ActionProcessor.shuffle(targetIds);
    }

    if (selectionType === 'Target' && targetIds.length > 0) {
        return this.resolveMoveTargets(state, effect, targetIds, controllerId, log, stackObject, parentContext);
    }
    if ((effect.fromTop || 0) > 0 && (effect.sourceZones || []).includes(Zone.Library)) {
        const affectedPlayerId = targetIds.find((tid: string) => state.players[tid as PlayerId]) as PlayerId || controllerId;
        return this.resolveLibraryTopMoves(state, effect, affectedPlayerId, log, stackObject, parentContext);
    }
    if (selectionType === 'Search' && (effect.sourceZones || []).includes(Zone.Library)) {
        return this.resolveLibrarySearch(state, effect, controllerId, log, stackObject, parentContext);
    }
    if (selectionType === 'All') {
        return this.resolveMassMove(state, effect, targetIds, controllerId, log, stackObject, parentContext);
    }

    return this.resolveSingleTargetMove(state, effect, targetIds, controllerId, log, stackObject, parentContext);
  }

  private static resolveDrawCards(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const amount = typeof effect.amount === 'number' ? effect.amount : 1;
    return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], destination: Zone.Hand, fromTop: amount, isDraw: true }, controllerId, log, stackObject, parentContext);
  }

  private static resolveMill(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const amount = typeof effect.amount === 'number' ? effect.amount : 1;
    return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], destination: Zone.Graveyard, fromTop: amount }, controllerId, log, stackObject, parentContext);
  }

  private static resolveScry(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const amount = typeof effect.amount === 'number' ? effect.amount : 1;
    return this.resolveLibraryTopMoves(state, { ...effect, type: 'Scry', selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: amount }, controllerId, log, stackObject, parentContext);
  }

  private static resolveSurveil(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const amount = typeof effect.amount === 'number' ? effect.amount : 1;
    return this.resolveLibraryTopMoves(state, { ...effect, type: 'Surveil', selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: amount }, controllerId, log, stackObject, parentContext);
  }

  private static resolveLookAtTopAndPick(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const amount = typeof effect.fromTop === 'number' ? effect.fromTop : 1;
    return this.resolveLibraryTopMoves(state, { ...effect, type: EffectType.LookAtTopAndPick, selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: amount }, controllerId, log, stackObject, parentContext);
  }

  private static resolveExchangeHandAndGraveyard(state: GameState, effect: EffectDefinition, targets: string[], controllerId: PlayerId, log: (m: string) => void) {
    const playerIds = targets.length > 0 ? targets.map(t => t as PlayerId) : [controllerId];
    playerIds.forEach(pid => {
        const player = state.players[pid];
        if (player) {
            const oldHand = [...player.hand];
            const oldGY = [...player.graveyard];
            log(`[EXCHANGE] Swapping hand/graveyard for ${player.name}.`);
            oldGY.forEach(c => ActionProcessor.moveCard(state, c, Zone.Hand, pid, log));
            oldHand.forEach(c => ActionProcessor.moveCard(state, c, Zone.Graveyard, pid, log));
        }
    });
  }

  private static resolveMoveTargets(state: GameState, effect: EffectDefinition, targetIds: string[], controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const destination = effect.zone || effect.destination || Zone.Hand;
    const isDiscard = effect.type === EffectType.DiscardCards || (effect as any).isDiscard;

    targetIds.forEach((tid: string) => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (obj) {
            const from = obj.zone;
            const destPlayerId = effect.ownerControl ? obj.ownerId : controllerId;
            ActionProcessor.moveCard(state, obj, destination, destPlayerId, log, effect.libraryPosition, false, isDiscard);
            if (destination === Zone.Exile) {
                (state as any).lastExiledIds = [tid];
                if (parentContext) {
                    if (!parentContext.exiledIds) parentContext.exiledIds = [];
                    parentContext.exiledIds.push(tid);
                }
                TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: tid, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
            }
        }
    });
  }

  private static resolveLibraryTopMoves(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const player = state.players[controllerId];
    if (!player) return;

    const fromTop = effect.fromTop || 0;
    const destination = effect.zone || effect.destination || Zone.Hand;
    const cards: GameObject[] = [];
    
    // Pop from library to temporary 'Looking' pool
    for (let i = 0; i < Number(fromTop) && player.library.length > 0; i++) {
        cards.push(player.library.pop()!);
    }
    
    if (cards.length === 0) return;

    if (effect.type === EffectType.LookAtTopAndPick) {
        state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
            label: effect.label || `Choose a card from the top ${cards.length}`,
            playerId: controllerId,
            sourceId: stackObject?.sourceId || '',
            restrictions: effect.restrictions,
            reveal: effect.reveal,
            optional: effect.optional || effect.selectionType === 'AnyNumber',
            minChoices: (effect.selectionType === 'AnyNumber' || effect.amount === 'ANY') ? 0 : 1,
            maxChoices: (effect.selectionType === 'AnyNumber' || (effect as any).amount === 'ANY') ? cards.length : (effect.amount as number || 1),
            actionType: (effect.optional || effect.selectionType === 'AnyNumber') ? ActionType.OptionalAction : ActionType.ResolutionChoice,
            onSelected: (selectedCard: GameObject) => {
                // Per-card movement response
                const subEffects: any[] = [];
                subEffects.push({ 
                    type: 'MoveToZone', 
                    targetId: selectedCard.id, 
                    zone: destination, 
                    tapped: effect.tapped, 
                    reveal: effect.reveal,
                    isFreeCast: effect.isFreeCast
                });
                
                if (effect.isFreeCast) {
                    subEffects.push({ type: 'CastSpell', targetId: selectedCard.id, isFreeCast: true });
                }

                if ((effect as any).additionalEffectPerCard) {
                    subEffects.push((effect as any).additionalEffectPerCard);
                }

                return subEffects;
            },
            onNone: () => {
                // If skip, all return to library
                return [{ 
                    type: 'MoveToZone', 
                    selectionType: 'Target', 
                    targetIds: cards.map(o => o.id), 
                    zone: effect.remainderZone || Zone.Library,
                    libraryPosition: effect.remainderPosition || effect.libraryPosition || 'bottom'
                }];
            },
            stackObj: stackObject,
            parentContext: parentContext
        });

        // --- BATCH REMAINDER FIX ---
        // We inject the remainder movement as a trailing effect in the parent context if we are in a resolution.
        // This ensures it only runs once AFTER all choices are made.
        if (parentContext && parentContext.effects) {
             const remainderMove = { 
                type: 'MoveToZone', 
                selectionType: 'All', 
                sourceZones: [Zone.Library], // Currently "looking" at them means they are logically nowhere or on top of lib
                targetIds: cards.map(c => c.id),
                targetMapping: 'REMAINDER_OF_POOL', 
                zone: effect.remainderZone || Zone.Library,
                libraryPosition: effect.remainderPosition || effect.libraryPosition || 'bottom',
                shuffle: effect.shuffleRemainder
            };
            // Insert after current effect
            parentContext.effects.splice(parentContext.nextEffectIndex + 1, 0, remainderMove);
        }

        return;
    }

    if (effect.type === 'Scry') {
        state.pendingAction = ChoiceGenerator.createScryChoice(state, cards, { label: `Scry ${cards.length}`, playerId: controllerId, sourceId: stackObject?.sourceId || '', stackObj: stackObject, parentContext: parentContext });
        return;
    }

    if (effect.type === 'Surveil') {
        state.pendingAction = ChoiceGenerator.createSurveilChoice(state, cards, { label: `Surveil ${cards.length}`, playerId: controllerId, sourceId: stackObject?.sourceId || '', stackObj: stackObject, parentContext: parentContext });
        return;
    }

    // Default: Automatic move (Draw, Mill, Exile)
    if (destination === Zone.Exile) {
        (state as any).lastExiledIds = cards.map(c => c.id);
    }
    cards.forEach(c => {
        const from = c.zone;
        ActionProcessor.moveCard(state, c, destination, controllerId, log, 'top', effect.type === 'DrawCards');
        if (destination === Zone.Battlefield) {
            if (effect.tapped) c.isTapped = true;
        }
        if (destination === Zone.Exile) {
            TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: c.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
        }
    });
  }

  private static resolveLibrarySearch(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const player = state.players[controllerId];
    if (!player) return;

    const sourceZones = effect.sourceZones || [Zone.Library];
    const pool: GameObject[] = [];
    sourceZones.forEach(z => {
        if (z === Zone.Library) pool.push(...player.library);
        if (z === Zone.Graveyard) pool.push(...player.graveyard);
        if (z === Zone.Hand) pool.push(...player.hand);
    });

    state.pendingAction = ChoiceGenerator.createCardChoice(state, pool, {
        label: `${effect.label || "Search your library"}`,
        playerId: controllerId,
        sourceId: stackObject?.sourceId || '',
        restrictions: effect.restrictions,
        reveal: effect.reveal,
        optional: effect.optional || effect.selectionType === 'AnyNumber',
        filterSelectable: true,
        minChoices: (effect.selectionType === 'AnyNumber' || effect.amount === 'ANY') ? 0 : 1,
        maxChoices: (effect.selectionType === 'AnyNumber' || effect.amount === 'ANY') ? pool.length : (effect.amount as number || 1),
        actionType: (effect.optional || effect.selectionType === 'AnyNumber') ? ActionType.OptionalAction : ActionType.ResolutionChoice,
        onSelected: (c: GameObject) => {
            const subEffects: any[] = [];
            const destination = effect.zone || effect.destination || Zone.Hand;
            subEffects.push({ type: 'MoveToZone', targetId: c.id, zone: destination, tapped: effect.tapped, reveal: effect.reveal });
            return subEffects;
        },
        onNone: () => [],
        stackObj: stackObject,
        parentContext: parentContext
    });

    // In search, we usually shuffle the WHOLE library regardless of selection
    if (effect.shuffle && parentContext && parentContext.effects) {
         parentContext.effects.splice(parentContext.nextEffectIndex + 1, 0, { type: 'Shuffle', targetMapping: 'CONTROLLER' } as any);
    }
  }

  private static resolveMassMove(state: GameState, effect: EffectDefinition, targetIds: string[], controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const targetPlayerIds = targetIds.length > 0 ? targetIds : [controllerId];
    const destination = effect.zone || effect.destination || Zone.Hand;
    const sources = effect.sourceZones || [Zone.Battlefield];
    const isDiscard = effect.type === EffectType.DiscardCards || (effect as any).isDiscard;

    targetPlayerIds.forEach((tid: string) => {
        const player = state.players[tid as PlayerId];
        if (player) {
            let pool = sources.flatMap(z => {
                if (z === Zone.Graveyard) return [...player.graveyard];
                if (z === Zone.Hand) return [...player.hand];
                if (z === Zone.Library) return [...player.library];
                if (z === Zone.Battlefield) return state.battlefield.filter(o => o.controllerId === tid);
                return [];
            });

            if (effect.restrictions) {
                pool = pool.filter(o => TargetingProcessor.matchesRestrictions(state, o, effect.restrictions!, controllerId, (stackObject as any)?.sourceId || ''));
            }

            pool.forEach(c => {
                const from = c.zone;
                ActionProcessor.moveCard(state, c, destination, c.ownerId, log, 'top', false, isDiscard);
                if (destination === Zone.Exile) {
                    TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: c.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
                }
            });
        }
    });
  }

  private static resolveSingleTargetMove(state: GameState, effect: EffectDefinition, targetIds: string[], controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const idsToMove = (effect as any).targetId ? [(effect as any).targetId] : targetIds;
    const destination = effect.zone || effect.destination || (effect.type === 'Exile' ? Zone.Exile : Zone.Hand);
    const isDiscard = effect.type === EffectType.DiscardCards || (effect as any).isDiscard;

    idsToMove.forEach(tid => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (!obj) return;

        const from = obj.zone;
        const destPlayerId = effect.ownerControl ? obj.ownerId : controllerId;
        ActionProcessor.moveCard(state, obj, destination, destPlayerId, log, effect.libraryPosition, false, isDiscard);
        
        if (effect.tapped && destination === Zone.Battlefield) obj.isTapped = true;
        if (destination === Zone.Exile) {
            if (parentContext) {
                if (!parentContext.exiledIds) parentContext.exiledIds = [];
                parentContext.exiledIds.push(obj.id);
            }
            TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: obj.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
        }
    });
  }

  private static findObject(state: GameState, id: string, stackObject?: any, parentContext?: any): GameObject | undefined {
      return TargetingProcessor.findObjectInAnyZone(state, id) || undefined;
  }
}
