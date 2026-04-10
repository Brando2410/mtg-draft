import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject, ActionType } from '@shared/engine_types';
import { ActionProcessor } from '../../actions/ActionProcessor';
import { TriggerProcessor } from '../TriggerProcessor';
import { ChoiceGenerator } from '../ChoiceGenerator';

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
        } else if (effect.type === 'DrawCards' || effect.type === 'ReturnToHand' || effect.type === 'MoveToZone') {
            (effect as any).destination = Zone.Hand;
        }
    }

    log(`[MOVE-ZONE] Type: ${effect.type}, Selection: ${selectionType}, Destination: ${effect.destination || effect.zone}`);

    // Map legacy effect types to selection modes if needed
    if (effect.type === 'DrawCards') {
        return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], destination: Zone.Hand, fromTop: (effect as any).amount || 1 }, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'Mill') {
        return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], destination: Zone.Graveyard, fromTop: (effect as any).amount || 1 }, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'SearchLibrary') {
        return this.resolveLibrarySearch(state, { ...effect, selectionType: 'Search', sourceZones: effect.sourceZones || [Zone.Library], shuffle: true, reveal: true }, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'Scry') {
        return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: (effect as any).amount || 1 }, controllerId, log, stackObject, parentContext);
    }
    if (effect.type === 'Surveil') {
        return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: (effect as any).amount || 1 }, controllerId, log, stackObject, parentContext);
    }

    if (effect.type === 'PutRemainderOnBottomRandom' && targetIds.length > 1) {
        ActionProcessor.shuffle(targetIds);
    }

    if (selectionType === 'Target' && targetIds.length > 0) {
        return this.resolveMoveTargets(state, effect, targetIds, log, stackObject, parentContext);
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

    return this.resolveSingleTargetMove(state, effect, targetIds, log, stackObject, parentContext);
  }

  private static resolveMoveTargets(state: GameState, effect: EffectDefinition, targetIds: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const destination = effect.zone || effect.destination || Zone.Hand;

    targetIds.forEach((tid: string) => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (obj) {
            const from = obj.zone;
            ActionProcessor.moveCard(state, obj, destination, obj.ownerId, log, effect.libraryPosition);
            if (destination === Zone.Exile) {
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
    
    log(`[DEBUG] resolveLibraryTopMoves: player=${controllerId}, fromTop=${fromTop}, librarySize=${player.library.length}`);
    
    for (let i = 0; i < Number(fromTop) && player.library.length > 0; i++) {
        cards.push(player.library.pop()!);
    }
    
    if (cards.length === 0) {
        log(`[DEBUG] Scry/Surveil aborted: No cards found in library.`);
        return;
    }

    // Special logic for choices from top
    if (effect.type === 'LookAtTopAndPick') {
        state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
            label: effect.label || `Choose a card from the top ${cards.length}`,
            playerId: controllerId,
            sourceId: stackObject?.sourceId || '',
            restrictions: effect.restrictions,
            reveal: effect.reveal,
            optional: effect.optional,
            actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
            onSelected: (c: any) => {
                const subEffects = [];
                if (effect.splitDestinations) {
                    subEffects.push({ type: 'MoveToZone', targetId: (c as any).id, zone: effect.splitDestinations[0].zone, tapped: effect.splitDestinations[0].tapped, reveal: effect.reveal });
                } else {
                    subEffects.push({ type: 'MoveToZone', targetId: (c as any).id, zone: destination, reveal: effect.reveal });
                }
                
                const remainder = cards.filter(o => o.id !== c.id);
                if (remainder.length > 0) {
                    if (effect.shuffleRemainder) ActionProcessor.shuffle(remainder);
                    subEffects.push({ 
                        type: 'MoveToZone', 
                        selectionType: 'Target', 
                        targetIds: remainder.map(o => o.id), 
                        zone: effect.remainderZone || Zone.Library,
                        libraryPosition: effect.remainderPosition || effect.libraryPosition || 'bottom'
                    });
                }
                return subEffects;
            },
            onNone: () => {
                if (effect.shuffleRemainder) ActionProcessor.shuffle(cards);
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
        return;
    }

    if (effect.type === 'Scry') {
        state.pendingAction = ChoiceGenerator.createScryChoice(state, cards, {
            label: `Scry ${cards.length}`, 
            playerId: controllerId, 
            sourceId: stackObject?.sourceId || '',
            stackObj: stackObject,
            parentContext: parentContext
        });
        log(`[RESOLVING] Initiated Scry ${cards.length} for ${controllerId}. (Action: ${state.pendingAction!.type})`);
        return;
    }

    if (effect.type === 'Surveil') {
        state.pendingAction = ChoiceGenerator.createSurveilChoice(state, cards, {
            label: `Surveil ${cards.length}`, 
            playerId: controllerId, 
            sourceId: stackObject?.sourceId || '',
            stackObj: stackObject,
            parentContext: parentContext
        });
        log(`[RESOLVING] Initiated Surveil ${cards.length} for ${controllerId}.`);
        return;
    }

    // Default: Move all cards to destination
    cards.forEach(c => {
        const from = c.zone;
        ActionProcessor.moveCard(state, c, destination, controllerId, log, 'top', effect.type === 'DrawCards');
        if (effect.tapped && destination === Zone.Battlefield) c.isTapped = true;
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
        label: `${effect.label || "Search your library"} (${(effect as any).count || 1}/${effect.amount || 1})`,
        playerId: controllerId,
        sourceId: stackObject?.sourceId || '',
        restrictions: effect.restrictions,
        reveal: effect.reveal,
        optional: effect.optional,
        filterSelectable: true,
        actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
        onSelected: (c: any) => {
            const subEffects: any[] = [];
            const destination = effect.zone || effect.destination || Zone.Hand;
            
            subEffects.push({ type: 'MoveToZone', targetId: (c as any).id, zone: destination, tapped: effect.tapped, reveal: effect.reveal });
            
            const currentAmount = (effect.amount as number) || 1;
            const currentCount = ((effect as any).count as number) || 1;

            if (currentCount < currentAmount) {
                // If this was a named restriction search (like Alpine Houndmaster), 
                // remove the picked name from the next search iteration to enforce "one of each".
                let nextRestrictions = effect.restrictions ? [...effect.restrictions] : undefined;
                if (nextRestrictions) {
                    const pickedName = c.definition.name;
                    nextRestrictions = nextRestrictions.filter(r => {
                        if (typeof r === 'object' && (r.name || r.nameEquals)) {
                            return (r.name || r.nameEquals).toLowerCase() !== pickedName.toLowerCase();
                        }
                        if (typeof r === 'string') {
                            return r.toLowerCase() !== pickedName.toLowerCase();
                        }
                        return true;
                    });
                }

                // If we still have cards left to find AND characteristics left to match
                if (!nextRestrictions || nextRestrictions.length > 0) {
                   subEffects.push({
                       ...effect,
                       amount: currentAmount,
                       count: currentCount + 1,
                       restrictions: nextRestrictions,
                       shuffle: false // Only shuffle at the very end
                   });
                } else if (effect.shuffle) {
                    subEffects.push({ type: 'Shuffle', targetMapping: 'CONTROLLER' } as any);
                }
            } else if (effect.shuffle) {
                subEffects.push({ type: 'Shuffle', targetMapping: 'CONTROLLER' } as any);
            }
            
            if ((effect as any).effects) {
                subEffects.push(...(effect as any).effects.map((sub: any) => ({ ...sub, targetId: (c as any).id })));
            }
            return subEffects;
        },
        onNone: () => {
            const currentAmount = (effect.amount as number) || 1;
            const currentCount = ((effect as any).count as number) || 1;

            if (currentCount < currentAmount) {
                // If the user skipped one search, we still offer the next one if available
                return [{
                    ...effect,
                    amount: currentAmount,
                    count: currentCount + 1,
                    shuffle: false
                }];
            }

            if (effect.shuffle) return [{ type: 'Shuffle', targetMapping: 'CONTROLLER' } as any];
            return [];
        },
        stackObj: stackObject,
        parentContext: parentContext
    });
  }

  private static resolveMassMove(state: GameState, effect: EffectDefinition, targetIds: string[], controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const { TargetingProcessor } = require('../../actions/TargetingProcessor');
    const targetPlayerIds = targetIds.length > 0 ? targetIds : [controllerId];
    const destination = effect.zone || effect.destination || Zone.Hand;
    const sources = effect.sourceZones || [Zone.Battlefield];

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
                ActionProcessor.moveCard(state, c, destination, c.ownerId, log);
                if (destination === Zone.Exile) {
                    TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: c.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
                }
            });
            log(`[MASS-MOVE] Moved ${pool.length} cards to ${destination}.`);
        }
    });
  }

  private static resolveSingleTargetMove(state: GameState, effect: EffectDefinition, targetIds: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const obj = this.findObject(state, (effect as any).targetId || targetIds[0], stackObject, parentContext);
    if (obj) {
        const from = obj.zone;
        let destination = effect.zone || effect.destination;
        if (!destination) {
            if (effect.type === 'Exile') destination = Zone.Exile;
            else destination = Zone.Hand;
        }
        ActionProcessor.moveCard(state, obj, destination, obj.ownerId, log, effect.libraryPosition);
        if (effect.tapped && destination === Zone.Battlefield) obj.isTapped = true;
        if (effect.reveal) (obj as any).isRevealed = true;
        if (destination === Zone.Exile) {
            TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: obj.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
        }
    }
  }

  private static findObject(state: GameState, id: string, stackObject?: any, parentContext?: any): GameObject | undefined {
      // Proxy to the main findObject in EffectProcessor or local impl
      // For now, let's assume we pass it or recreate it for isolation
      const foundOnField = state.battlefield.find(o => o.id === id);
      if (foundOnField) return foundOnField;

      if (stackObject) {
         const card = stackObject.card || stackObject;
         if (card && card.id === id) return card;
      }

      const foundOnStack = state.stack.find(s => s.id === id || s.sourceId === id)?.card;
      if (foundOnStack) return foundOnStack;

      const foundInGY = Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === id);
      if (foundInGY) return foundInGY;

      const foundInExile = state.exile.find(o => o.id === id);
      if (foundInExile) return foundInExile;

      for (const playerId in state.players) {
          const foundInHand = state.players[playerId as PlayerId].hand.find(o => o.id === id);
          if (foundInHand) return foundInHand;
          const foundInLib = state.players[playerId as PlayerId].library.find(o => o.id === id);
          if (foundInLib) return foundInLib;
      }

      return undefined;
  }
}
