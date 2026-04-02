import { GameState, GameObject, PlayerId, ActionType } from '@shared/engine_types';

export interface ChoiceConfig {
    label: string;
    playerId: PlayerId;
    sourceId: string;
    hideUndo?: boolean;
    optional?: boolean;
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
                label: isMatch ? `Seleziona ${c.definition.name}` : `[Invalid] ${c.definition.name}`,
                value: isMatch ? c.id : "none",
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
                label: "Nessuna / Salta",
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
            lookingCards: cards // Preserve for UI/Context
        });
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
            hideUndo: config.hideUndo
        });
    }

    /**
     * Wraps data into the standard engine pendingAction format.
     */
    private static wrap(playerId: string, sourceId: string, data: any): any {
        return {
            type: ActionType.Choice,
            playerId,
            sourceId,
            data
        };
    }
}
