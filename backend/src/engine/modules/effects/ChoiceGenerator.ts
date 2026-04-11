import { GameState, GameObject, PlayerId, ActionType, Zone } from '@shared/engine_types';
import { pruneContext } from './EffectProcessor';

export interface ChoiceConfig {
    label: string;
    playerId: PlayerId;
    sourceId: string;
    hideUndo?: boolean;
    optional?: boolean;
    actionType?: ActionType;
    stackObj?: any;
    parentContext?: any;
}

export interface CardChoiceConfig extends ChoiceConfig {
    restrictions?: any[];
    reveal?: boolean;
    filterSelectable?: boolean;
    onSelected?: (card: GameObject) => any[]; // Returns effects to run
    onNone?: () => any[]; // Returns effects if skipped/none selected
}

/**
 * ChoiceGenerator: Modular utility to build standard Choice Actions.
 * Keeps logic DRY across different effect types (Library, Hand, Modal).
 */
export class ChoiceGenerator {

    /**
     * Build choices from a static list of objects (Cards).
     */
    public static createCardChoice(
        state: GameState,
        cards: GameObject[],
        config: CardChoiceConfig
    ) {
        const { playerId, sourceId, restrictions = [], onSelected, onNone } = config;

        const { TargetingProcessor } = require('../actions/TargetingProcessor');
        let options = cards.map(c => {
            const isMatch = TargetingProcessor.matchesRestrictions(state, c, restrictions, playerId, sourceId);
            
            return {
                label: isMatch ? `Select ${c.definition.name}` : `[Invalid] ${c.definition.name}`,
                value: c.id,
                imageUrl: c.definition.image_url,
                cardData: c,
                selectable: isMatch,
                effects: isMatch && onSelected ? onSelected(c) : []
            };
        });

        // CR 701.19: When searching, hidden invalid choices improve UX
        if (config.filterSelectable) {
            options = options.filter(o => o.selectable);
        }

        // Add the 'None/Skip' option if optional
        if (config.optional !== false) {
            options.push({
                label: "None / Skip",
                value: "none",
                imageUrl: undefined,
                cardData: undefined,
                selectable: true,
                effects: onNone ? onNone() : []
            } as any);
        }

        return this.wrap(playerId, sourceId, {
            label: config.label,
            choices: options,
            hideUndo: config.hideUndo,
            lookingCards: cards, // Preserve for UI/Context
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext),
            minChoices: config.stackObj?.data?.minChoices || 1,
            maxChoices: config.stackObj?.data?.maxChoices || 1,
        }, config.actionType);
    }

    /**
     * Build generic button-based choices.
     */
    public static createModalChoice(
        config: ChoiceConfig,
        choices: { label: string, value: any, effects?: any[] }[]
    ) {
        return this.wrap(config.playerId, config.sourceId, {
            label: config.label,
            choices: choices.map(c => ({
                ...c,
                selectable: true
            })),
            hideUndo: config.hideUndo,
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext)
        }, config.actionType);
    }

    /**
     * Build interactive Scry action.
     */
    public static createScryChoice(state: GameState, cards: GameObject[], config: ChoiceConfig) {
        return this.wrap(config.playerId, config.sourceId, {
            label: config.label || `Scry ${cards.length}`,
            lookingCards: cards,
            destinations: ['top', 'bottom'],
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext)
        }, ActionType.Scry);
    }

    /**
     * Build interactive Surveil action.
     */
    public static createSurveilChoice(state: GameState, cards: GameObject[], config: ChoiceConfig) {
        return this.wrap(config.playerId, config.sourceId, {
            label: config.label || `Surveil ${cards.length}`,
            lookingCards: cards,
            destinations: ['top', 'graveyard'],
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext)
        }, ActionType.Surveil);
    }

    /**
     * Build interactive Discard action.
     * Supports multiple players sequentially, but each player selects all their cards in one go.
     */
    public static createDiscardChoice(state: GameState, playerIds: PlayerId[], sourceId: string, amount: number | any, label: string, stackObj?: any, parentContext?: any): any {
        if (playerIds.length === 0) return null;
        
        const [currentPlayerId, ...nextPlayerIds] = playerIds;
        const player = state.players[currentPlayerId];
        
        // Skip player if hand is empty
        if (!player || player.hand.length === 0) {
            return this.createDiscardChoice(state, nextPlayerIds, sourceId, amount, label, stackObj, parentContext);
        }

        const discardAmount = Math.min(player.hand.length, (typeof amount === 'number' ? amount : 1));

        return this.createCardChoice(state, player.hand, {
            label: `${label} (${discardAmount})`,
            playerId: currentPlayerId,
            sourceId,
            optional: false,
            actionType: ActionType.ResolutionChoice,
            stackObj: {
                ...stackObj,
                data: {
                    ...(stackObj?.data || {}),
                    minChoices: discardAmount,
                    maxChoices: discardAmount,
                    nextPlayerIds: nextPlayerIds,
                    discardAmount: amount // Original amount for next players
                }
            },
            parentContext: pruneContext(parentContext),
            onSelected: (card: GameObject) => {
                // This is now called for each card in the batch by ChoiceProcessor
                return [{ type: 'MoveToZone', targetId: card.id, zone: Zone.Graveyard, isDiscard: true }];
            }
        });
    }

    /**
     * Wraps data into the standard engine pendingAction format.
     */
    private static wrap(playerId: string, sourceId: string, data: any, type: ActionType | string = ActionType.ResolutionChoice): any {
        return {
            type,
            playerId,
            sourceId,
            data
        };
    }
}

