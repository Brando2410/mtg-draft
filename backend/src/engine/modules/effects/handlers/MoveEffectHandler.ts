import { GameState, EffectDefinition, TargetType, TargetDefinition, GameObjectId, PlayerId, Zone, GameObject, ActionType, EffectType, TargetMapping } from '@shared/engine_types';
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
        const targetIds = (effect as any).targetId ? [(effect as any).targetId] : (targets.length > 0 ? targets : []);

        // Fallback to stack targets ONLY if this is a top-level effect resolution and no targets were provided
        const finalTargetIds = (targetIds.length === 0 && !parentContext) ? ((stackObject as any)?.targets || []) : targetIds;

        const selectionType = effect.selectionType || 'Target';

        // Rule: Resolve default destination for specific movement keywords
        if (!effect.zone && !effect.destination) {
            if (effect.type === 'Exile' || effect.type === 'ExileTopCard' || effect.type === 'ExileAllCards') {
                (effect as any).destination = Zone.Exile;
            } else if (effect.type === 'DrawCards' || effect.type === 'ReturnToHand' || effect.type === 'MoveToZone' || effect.type === 'PutInHand') {
                (effect as any).destination = Zone.Hand;
            } else if (effect.type === EffectType.DiscardCards || (effect.type as any) === 'Mill' || (effect.type as any) === 'Discard' || (effect.type as any) === 'PutInGraveyard') {
                (effect as any).destination = Zone.Graveyard;
            } else if (effect.type === EffectType.PutOnBattlefield) {
                (effect as any).destination = Zone.Battlefield;
            }
        }

        log(`[MOVE-ZONE] Type: ${effect.type}, Selection: ${selectionType}, Destination: ${effect.destination || effect.zone}`);

        // Map legacy effect types to selection modes if needed
        if (effect.type === 'DrawCards') {
            return this.resolveDrawCards(state, effect, controllerId, log, stackObject, parentContext, finalTargetIds);
        }
        if (effect.type === 'Mill') {
            return this.resolveMill(state, effect, controllerId, log, stackObject, parentContext);
        }
        if (effect.type === 'SearchLibrary') {
            return this.resolveLibrarySearch(state, { ...effect, selectionType: 'Search', sourceZones: effect.sourceZones || [Zone.Library], shuffle: true, reveal: true }, controllerId, log, stackObject, parentContext, targets);
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
        if (effect.type === 'RevealUntilCondition') {
            return this.resolveRevealUntilCondition(state, effect, controllerId, log, stackObject, parentContext);
        }

        if (effect.type === EffectType.DiscardCards || (effect.type as any) === 'Discard') {
            const playerIds = finalTargetIds.filter((id: string) => state.players[id as PlayerId]) as PlayerId[];
            const amount = typeof effect.amount === 'number' ? effect.amount : 1;
            return ChoiceGenerator.createDiscardChoice(state, playerIds, (stackObject as any)?.sourceId || '', amount, effect.label || "Choose a card to discard", stackObject, parentContext, effect.effects, log);
        }

        if (effect.type === EffectType.ExchangeHandAndGraveyard) {
            return this.resolveExchangeHandAndGraveyard(state, effect, targets, controllerId, log);
        }

        if (effect.type === 'PutRemainderOnBottomRandom' && finalTargetIds.length > 1) {
            ActionProcessor.shuffle(finalTargetIds);
        }

        if (selectionType === 'Target' && finalTargetIds.length > 0) {
            return this.resolveMoveTargets(state, effect, finalTargetIds, controllerId, log, stackObject, parentContext);
        }
        const { EffectProcessor } = require('../EffectProcessor');
        const fromTopResolved = EffectProcessor.resolveAmount(state, effect.fromTop || 0, (stackObject as any)?.sourceId || '', controllerId, stackObject, finalTargetIds);
        if (fromTopResolved > 0 && (effect.sourceZones || []).includes(Zone.Library)) {
            const affectedPlayerId = finalTargetIds.find((tid: string) => state.players[tid as PlayerId]) as PlayerId || controllerId;
            return this.resolveLibraryTopMoves(state, { ...effect, fromTop: fromTopResolved }, affectedPlayerId, log, stackObject, parentContext);
        }
        if (selectionType === 'Search' && (effect.sourceZones || []).includes(Zone.Library)) {
            return this.resolveLibrarySearch(state, effect, controllerId, log, stackObject, parentContext, targets);
        }
        if (selectionType === 'All') {
            return this.resolveMassMove(state, effect, finalTargetIds, controllerId, log, stackObject, parentContext);
        }

        if (effect.type === 'ExileUntilManaValue') {
            return this.resolveExileUntilManaValue(state, effect, controllerId, log, stackObject, parentContext);
        }

        if (effect.targetDefinition && finalTargetIds.length === 0) {
            return this.resolveInteractiveMovementSelection(state, effect, controllerId, log, stackObject, parentContext);
        }

        return this.resolveSingleTargetMove(state, effect, finalTargetIds, controllerId, log, stackObject, parentContext);
    }

    private static resolveInteractiveMovementSelection(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
        const targetDef = Array.isArray(effect.targetDefinition) ? effect.targetDefinition[0] : effect.targetDefinition!;
        if (!targetDef) return;

        const player = state.players[controllerId];
        if (!player) return;

        let pool: GameObject[] = [];
        if (targetDef.type === TargetType.CardInHand) pool = player.hand;
        else if (targetDef.type === TargetType.CardInGraveyard) pool = player.graveyard;
        else if (targetDef.type === TargetType.Permanent) pool = state.battlefield.filter(o => o.controllerId === controllerId);
        else return;

        const sourceId = (stackObject as any)?.sourceId || '';

        state.pendingAction = ChoiceGenerator.createCardChoice(state, pool, {
            label: effect.label || `Select a card to move`,
            playerId: controllerId,
            sourceId: sourceId,
            restrictions: targetDef.restrictions,
            filterSelectable: true,
            optional: effect.optional,
            minChoices: (targetDef.minCount !== undefined) ? targetDef.minCount : (targetDef.count || 1),
            maxChoices: targetDef.count || 1,
            actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
            onSelected: (c: GameObject) => {
                const subEffects: any[] = [];
                const destination = effect.zone || effect.destination || Zone.Hand;
                subEffects.push({
                    type: 'MoveToZone',
                    targetId: c.id,
                    zone: destination,
                    tapped: effect.tapped,
                    reveal: effect.reveal,
                    effects: effect.effects
                });
                return subEffects;
            },
            stackObj: stackObject,
            parentContext: parentContext
        });
    }

    private static resolveExileUntilManaValue(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
        const player = state.players[controllerId];
        if (!player) return;

        const threshold = typeof effect.amount === 'number' ? effect.amount : 4;
        let totalMV = 0;
        const cards: GameObject[] = [];
        const { ManaProcessor } = require('../../magic/ManaProcessor');

        // Rule: Rule 701.12: To exile cards until a condition is met
        while (player.library.length > 0 && totalMV < threshold) {
            const card = player.library.pop()!;
            const mv = ManaProcessor.getManaValue(card.definition.manaCost || "");

            totalMV += mv;
            cards.push(card);
            ActionProcessor.moveCard(state, card, Zone.Exile, controllerId, log);
            TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: card.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: Zone.Library }, log);
        }

        if (cards.length > 0) {
            log(`[EXILE-UNTIL] Exiled ${cards.length} cards with total MV ${totalMV} (Threshold: ${threshold}).`);

            // Push a choice to cast any number of them
            state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
                label: `Cast any number of exiled spells?`,
                playerId: controllerId,
                sourceId: (stackObject as any)?.sourceId || '',
                optional: true,
                minChoices: 0,
                maxChoices: cards.length,
                actionType: ActionType.OptionalAction,
                onSelected: (c: GameObject) => {
                    const subEffects = [];
                    const types = c.definition.types.map(t => t.toLowerCase());
                    if (!types.includes('land')) {
                        subEffects.push({ type: 'CastSpell' as any, targetId: c.id, isFreeCast: true });
                    }
                    return subEffects;
                },
                stackObj: stackObject,
                parentContext: parentContext
            });
        }
    }

    private static resolveDrawCards(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any, targets: string[] = []) {
        const { EffectProcessor } = require('../EffectProcessor');
        const amount = EffectProcessor.resolveAmount(state, effect.amount, (stackObject as any)?.sourceId || '', controllerId, stackObject);
        const affectedPlayerId = targets.find(tid => state.players[tid as PlayerId]) as PlayerId || controllerId;
        return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], destination: Zone.Hand, fromTop: amount, isDraw: true }, affectedPlayerId, log, stackObject, parentContext);
    }

    private static resolveMill(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
        const { EffectProcessor } = require('../EffectProcessor');
        const amount = EffectProcessor.resolveAmount(state, effect.amount, (stackObject as any)?.sourceId || '', controllerId, stackObject);
        return this.resolveLibraryTopMoves(state, { ...effect, selectionType: 'TopN', sourceZones: [Zone.Library], destination: Zone.Graveyard, fromTop: amount }, controllerId, log, stackObject, parentContext);
    }

    private static resolveScry(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
        const { EffectProcessor } = require('../EffectProcessor');
        const amount = EffectProcessor.resolveAmount(state, effect.amount, (stackObject as any)?.sourceId || '', controllerId, stackObject);
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

    private static resolveRevealUntilCondition(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
        const player = state.players[controllerId];
        if (!player) return;

        const revealed: any[] = [];
        let targetCard: any = null;

        while (player.library.length > 0) {
            const card = player.library.pop()!;
            ActionProcessor.moveCard(state, card, Zone.Exile, controllerId, log);

            (card as any).isRevealed = true;
            revealed.push(card);

            if (TargetingProcessor.matchesRestrictions(state, card, effect.restrictions || [], controllerId, (stackObject as any)?.sourceId || '')) {
                targetCard = card;
                break;
            }
        }

        const found = !!targetCard;
        if (log && revealed.length > 0) log(`[REVEAL-UNTIL] Exiled ${revealed.length} cards from library. Found match: ${found}`);

        if (found) {
            // The card is already in Exile now.
            if (effect.next) {
                const nextEffect = { ...effect.next } as any;
                if (nextEffect.type === 'Choice' && (nextEffect.choices || nextEffect.choice)) {
                    const { ChoiceGenerator } = require('../ChoiceGenerator');
                    const choicesArr = nextEffect.choices || nextEffect.choice?.choices || [];

                    state.pendingAction = ChoiceGenerator.createCardChoice(state, [targetCard], {
                        label: nextEffect.label || (nextEffect.choice?.label) || `Cast ${targetCard.definition.name}?`,
                        playerId: controllerId,
                        sourceId: targetCard.id,
                        optional: true,
                        onSelected: (c: any) => {
                            const yesChoice = choicesArr.find((ch: any) => ch.label === 'Yes' || ch.value === 'yes');
                            return (yesChoice?.effects || []).map((eff: any) => ({ ...eff, targetId: targetCard.id }));
                        },
                        onNone: () => {
                            const noChoice = choicesArr.find((ch: any) => ch.label === 'No' || ch.value === 'no');
                            return (noChoice?.effects || []).map((eff: any) => ({ ...eff, targetId: targetCard.id }));
                        },
                        stackObj: stackObject,
                        parentContext: parentContext
                    });
                    return;
                }
                const { EffectProcessor } = require('../EffectProcessor');
                EffectProcessor.executeEffect(state, nextEffect, targetCard.id, [targetCard.id], log, stackObject, parentContext);
                if (state.pendingAction) return;
            }
        }

        // Move non-matching cards (and the match if it wasn't handled) from Exile to bottom
        const remaining = revealed.filter(c => c !== targetCard);
        if (remaining.length > 0) {
            const remainderZone = (effect as any).remainderZone || Zone.Library;
            const remainderPos = (effect as any).remainderPosition || 'bottom';
            const shuffle = (effect as any).shuffleRemainder;

            if (shuffle) {
                ActionProcessor.shuffle(remaining);
            }

            for (const c of remaining) {
                ActionProcessor.moveCard(state, c, (effect as any).remainderZone || Zone.Library, c.ownerId, log, 'bottom');
            }
        }
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
                if ((effect.reveal || (effect as any).revealed) && (destination === Zone.Hand || destination === Zone.Library)) {
                    obj.isRevealed = true;
                }
                if (destination === Zone.Battlefield && (effect as any).tapped) {
                    obj.isTapped = true;
                }
                if (destination === Zone.Exile) {
                    (state as any).lastExiledIds = [tid];
                    if (parentContext) {
                        if (!parentContext.exiledIds) parentContext.exiledIds = [];
                        parentContext.exiledIds.push(tid);
                    }
                    TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: tid, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
                }

                // --- NESTED EFFECTS SUPPORT ---
                if (effect.effects && effect.effects.length > 0) {
                    const { EffectProcessor } = require('../EffectProcessor');
                    EffectProcessor.resolveEffects(state, effect.effects, (stackObject as any)?.sourceId || tid, [tid], log, 0, stackObject, { ...parentContext, parentTargets: targetIds });
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

                    if (typeof (effect as any).onSelected === 'function') {
                        const custom = (effect as any).onSelected(selectedCard);
                        if (Array.isArray(custom)) subEffects.push(...custom);
                    } else {
                        subEffects.push({
                            type: 'MoveToZone',
                            targetId: selectedCard.id,
                            zone: destination,
                            tapped: effect.tapped,
                            reveal: effect.reveal,
                            isFreeCast: effect.isFreeCast
                        });
                    }

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
        if (effect.type === 'Mill') {
            (state as any).lastMilledIds = cards.map(c => c.id);
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

    private static resolveLibrarySearch(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any, targets: string[] = []) {
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
                subEffects.push({
                    type: 'MoveToZone',
                    targetId: c.id,
                    targetPlayerId: controllerId,
                    zone: destination,
                    tapped: effect.tapped,
                    libraryPosition: effect.libraryPosition,
                    reveal: effect.reveal,
                    effects: effect.effects // Pass through nested effects (Fabled Passage)
                });
                return subEffects;
            },
            onNone: () => [],
            stackObj: stackObject,
            parentContext: parentContext,
            targets: targets
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
        let destination = effect.zone || effect.destination;
        if (!destination) {
            if (effect.type === 'Exile') destination = Zone.Exile;
            else if (effect.type === 'PutOnBattlefield') destination = Zone.Battlefield;
            else destination = Zone.Hand;
        }
        const isDiscard = effect.type === EffectType.DiscardCards || (effect as any).isDiscard;

        idsToMove.forEach(tid => {
            const obj = this.findObject(state, tid, stackObject, parentContext);
            if (!obj) return;

            const from = obj.zone;
            const destPlayerId = effect.ownerControl ? obj.ownerId : controllerId;
            ActionProcessor.moveCard(state, obj, destination, destPlayerId, log, effect.libraryPosition, false, isDiscard);

            if ((effect.reveal || (effect as any).revealed) && destination !== Zone.Battlefield) {
                obj.isRevealed = true;
            }

            if (effect.tapped && destination === Zone.Battlefield) obj.isTapped = true;
            if (destination === Zone.Exile) {
                if (parentContext) {
                    if (!parentContext.exiledIds) parentContext.exiledIds = [];
                    parentContext.exiledIds.push(obj.id);
                }
                TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: obj.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
            }

            // --- CHAINING ---
            const subEffects = effect.next ? [effect.next] : (effect as any).effects;
            if (subEffects && subEffects.length > 0) {
                const { EffectProcessor } = require('../EffectProcessor');
                EffectProcessor.resolveEffects(state, subEffects, (stackObject as any)?.sourceId || '', targetIds, log, 0, stackObject, parentContext);
            }
        });
    }

    private static findObject(state: GameState, id: string, stackObject?: any, parentContext?: any): GameObject | undefined {
        if (stackObject && (stackObject.id === id || stackObject.sourceId === id)) return stackObject.card || stackObject;
        return TargetingProcessor.findObjectInAnyZone(state, id) || undefined;
    }
}
