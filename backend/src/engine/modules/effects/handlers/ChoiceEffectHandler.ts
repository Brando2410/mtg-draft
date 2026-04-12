import { GameState, PlayerId, ActionType, GameObject, Zone } from '@shared/engine_types';
import { ChoiceGenerator } from '../ChoiceGenerator';
import { TriggerProcessor } from '../TriggerProcessor';
import { ActionProcessor } from '../../actions/ActionProcessor';

/**
 * Strategy for CR 608: Resolution Choices and CR 701: Keyword Actions (Choice-based)
 */
export class ChoiceEffectHandler {

  public static handleChoice(
    state: GameState,
    effect: any,
    sourceId: string,
    targets: string[],
    log: (m: string) => void,
    controllerId: PlayerId,
    stackObject?: any,
    parentContext?: any,
    findObject?: any
  ) {
    const sourceObj = findObject(state, sourceId, stackObject) || stackObject?.card || stackObject;
    if (!sourceObj) return;

    let dynamicChoices = effect.choices;
    if (dynamicChoices) {
        const { ConditionProcessor } = require('./../../core/ConditionProcessor');
        dynamicChoices = dynamicChoices.filter((c: any) => {
            if (!c.condition) return true;
            return ConditionProcessor.matchesCondition(state, c.condition, sourceId, controllerId, stackObject);
        });
    }

    // --- SUPPORT FOR PRE-SELECTED CHOICES ---
    const preSelectedIdx = stackObject?.data?.preSelectedChoice !== undefined 
        ? stackObject.data.preSelectedChoice 
        : (stackObject as any)?.preSelectedChoice;

    if (preSelectedIdx !== undefined && dynamicChoices) {
        const rawIndices = String(preSelectedIdx).split('|').map(s => {
            return s.startsWith('CHOICE_') ? parseInt(s.substring(7)) : parseInt(s);
        });

        const allEffects: any[] = [];
        rawIndices.forEach(idx => {
            const choice = dynamicChoices[idx];
            if (choice && choice.effects) {
                allEffects.push(...choice.effects);
            }
        });

        if (allEffects.length > 0) {
            log(`[RESOLVING CHOICE] Auto-resolved pre-selected modes: ${rawIndices.join(', ')}`);
            const { EffectProcessor } = require('../EffectProcessor');
            EffectProcessor.resolveEffects(state, allEffects, sourceId, targets, log, 0, stackObject, parentContext);
            return;
        }
    }

    // --- HAND-PICKING OR GRAVEYARD-PICKING ---
    const targetZoneMapping = (effect as any).targetIdMapping;
    if (['TARGET_1_HAND', 'TARGET_1_GRAVEYARD', 'TARGET_1_BATTLEFIELD', 'CONTROLLER_HAND', 'CONTROLLER_GRAVEYARD', 'CONTROLLER_BATTLEFIELD', 'CONTROLLER_SIDEBOARD', 'NAME_A_CARD'].includes(targetZoneMapping)) {
        let targetPlayerId: string | undefined;
        let mappingPlayerId: string | undefined; // Player who chooses

        if (targetZoneMapping.startsWith('TARGET_1_')) {
            mappingPlayerId = targets[0];
        } else {
            mappingPlayerId = controllerId;
        }

        const targetPlayer = state.players[mappingPlayerId as PlayerId];
        if (targetPlayer || targetZoneMapping.endsWith('_BATTLEFIELD')) {
            const isGraveyard = targetZoneMapping.endsWith('_GRAVEYARD');
            const isSideboard = targetZoneMapping.endsWith('_SIDEBOARD');
            const isBattlefield = targetZoneMapping.endsWith('_BATTLEFIELD');
            const isNameACard = targetZoneMapping === 'NAME_A_CARD';

            let sourceCards: GameObject[] = [];
            if (isNameACard) {
                // Use controller's library as a pool of names
                sourceCards = state.players[controllerId].library;
            } else if (isBattlefield) {
                sourceCards = state.battlefield.filter(o => o.controllerId === mappingPlayerId);
            } else if (targetPlayer) {
                sourceCards = isGraveyard ? targetPlayer.graveyard : (isSideboard ? (targetPlayer.sideboard || []) : targetPlayer.hand);
            }
            
            if (isNameACard) {
                state.pendingAction = ChoiceGenerator.createCardChoice(state, sourceCards, {
                    label: "Name a non-land card",
                    playerId: mappingPlayerId as PlayerId,
                    sourceId: sourceId,
                    restrictions: effect.restrictions || ['Nonland'],
                    filterSelectable: true,
                    optional: false,
                    actionType: ActionType.ResolutionChoice,
                    onSelected: (c: any) => {
                        if (stackObject) {
                            if (!stackObject.data) stackObject.data = {};
                            stackObject.data.chosenName = c.definition.name;
                        }
                        return (effect.effects || []);
                    },
                    hideUndo: true,
                    stackObj: stackObject,
                    parentContext: parentContext
                });
                return;
            }
            
            if (targetZoneMapping === 'TARGET_1_HAND') {
                targetPlayer!.hand.forEach((c: any) => (c as any).isRevealed = true);
            }

            state.pendingAction = ChoiceGenerator.createCardChoice(state, sourceCards, {
                label: effect.label || (isGraveyard ? 'Choose a card from Graveyard' : (isSideboard ? 'Choose a Lesson from Sideboard' : (isBattlefield ? 'Choose a permanent to return' : 'Choose a card from Hand'))),
                playerId: mappingPlayerId as PlayerId, // The player who makes the choice
                sourceId: sourceId,
                restrictions: effect.restrictions,
                filterSelectable: true,
                minChoices: effect.minChoices,
                maxChoices: effect.maxChoices,
                optional: effect.optional !== false,
                actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
                onSelected: (c) => (effect.effects || []).map((sub: any) => ({ ...sub, targetId: c.id })),
                hideUndo: true,
                stackObj: stackObject,
                parentContext: parentContext
            });
            return;
        }
    }

    // --- GENERIC MODAL CHOICES ---
    state.pendingAction = ChoiceGenerator.createModalChoice(
        { 
            label: effect.label || 'Choose an option', 
            playerId: controllerId, 
            sourceId: sourceId, 
            actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
            hideUndo: true,
            minChoices: effect.minChoices,
            maxChoices: effect.maxChoices,
            stackObj: stackObject,
            parentContext: parentContext
        },
        dynamicChoices || []
    );
  }

  public static handleNecromentia(
    state: GameState,
    effect: any,
    sourceId: string,
    targets: string[],
    log: (m: string) => void,
    controllerId: PlayerId,
    stackObject?: any,
    parentContext?: any
  ) {
    const targetOpponentId = targets[0] as PlayerId;
    const targetOpponent = state.players[targetOpponentId];
    if (!targetOpponent) return;

    if (!stackObject.data?.chosenName) {
        state.pendingAction = ChoiceGenerator.createCardChoice(state, state.players[controllerId].library, {
            label: "Name a nonbasic card",
            playerId: controllerId,
            sourceId: sourceId,
            restrictions: ['NonbasicLand'],
            optional: false,
            actionType: ActionType.ResolutionChoice,
            onSelected: (c: any) => {
                stackObject.data.chosenName = c.definition.name;
                return [{ type: 'Necromentia', targetMapping: 'TARGET_1' }];
            },
            stackObj: stackObject,
            parentContext: parentContext
        });
        return;
    }

    const chosenName = stackObject.data.chosenName;
    const zones = [Zone.Graveyard, Zone.Hand, Zone.Library];
    let exiledCount = 0;

    zones.forEach(zone => {
        let pool = (zone === Zone.Graveyard ? targetOpponent.graveyard : zone === Zone.Hand ? targetOpponent.hand : targetOpponent.library);
        const toExile = pool.filter(c => c.definition.name.toLowerCase() === chosenName.toLowerCase());
        if (zone === Zone.Hand) exiledCount = toExile.length;

        toExile.forEach(c => {
            const from = c.zone;
            ActionProcessor.moveCard(state, c, Zone.Exile, c.ownerId, log);
            TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: c.id, sourceId, sourceZone: from }, log);
        });
    });

    if (exiledCount > 0) {
        const { PermanentHandler } = require('./PermanentHandler');
        PermanentHandler.handleCreateToken(state, [targetOpponentId], exiledCount, {
            name: 'Zombie', power: '2', toughness: '2', colors: ['B'],
            types: ['Creature'], subtypes: ['Zombie'],
            image_url: 'https://cards.scryfall.io/large/front/d/e/ded254ec-1d94-4458-944c-329a4305ee4c.jpg'
        }, log);
    }
  }
}
