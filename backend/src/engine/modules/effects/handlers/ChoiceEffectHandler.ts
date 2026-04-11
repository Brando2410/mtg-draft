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

    // --- SUPPORT FOR PRE-SELECTED CHOICES ---
    const preSelectedIdx = stackObject?.data?.preSelectedChoice !== undefined 
        ? stackObject.data.preSelectedChoice 
        : (stackObject as any)?.preSelectedChoice;

    if (preSelectedIdx !== undefined && dynamicChoices) {
        const choice = dynamicChoices[preSelectedIdx];
        if (choice && choice.effects) {
            log(`[RESOLVING CHOICE] Auto-resolved pre-selected mode: ${choice.label}`);
            const { EffectProcessor } = require('../EffectProcessor');
            EffectProcessor.resolveEffects(state, choice.effects, sourceId, targets, log, 0, stackObject, parentContext);
            return;
        }
    }

    // --- HAND-PICKING OR GRAVEYARD-PICKING ---
    const targetZoneMapping = (effect as any).targetIdMapping;
    if (['TARGET_1_HAND', 'TARGET_1_GRAVEYARD', 'CONTROLLER_HAND', 'CONTROLLER_GRAVEYARD'].includes(targetZoneMapping)) {
        let targetPlayerId: string | undefined;
        if (targetZoneMapping.startsWith('TARGET_1_')) {
            targetPlayerId = targets[0];
        } else {
            targetPlayerId = controllerId;
        }

        const targetPlayer = state.players[targetPlayerId as PlayerId];
        if (targetPlayer) {
            const isGraveyard = targetZoneMapping.endsWith('_GRAVEYARD');
            const sourceCards = isGraveyard ? targetPlayer.graveyard : targetPlayer.hand;
            
            if (targetZoneMapping === 'TARGET_1_HAND') {
                targetPlayer.hand.forEach((c: any) => (c as any).isRevealed = true);
            }

            state.pendingAction = ChoiceGenerator.createCardChoice(state, sourceCards, {
                label: effect.label || (isGraveyard ? 'Choose a card from Graveyard' : 'Choose a card from Hand'),
                playerId: controllerId,
                sourceId: sourceId,
                restrictions: effect.restrictions,
                filterSelectable: true,
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
