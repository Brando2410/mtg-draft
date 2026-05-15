import { ActionType, GameObject, GameState, PlayerId, Zone, AbilityCost, EffectDefinition, PendingAction, ChoiceOption, TargetRestriction, EngineFrame, StackObject } from '@shared/engine_types';
import { LogCategory } from '../../utils/EngineLogger';
import { getProcessors } from '../ProcessorRegistry';
import { pruneContext } from './EffectProcessor';
import { ActionBuilder } from '../../utils/ActionBuilder';

import { InteractionMetadata } from '@shared/engine_types';

export interface ChoiceConfig extends Partial<InteractionMetadata> {
    label: string;
    playerId: PlayerId;
    sourceId: string;
    hideUndo?: boolean;
    optional?: boolean;
    actionType?: ActionType;
    showCancel?: boolean;
    originalTargets?: string[];
    isCostChoice?: boolean;
    costType?: string;
    metadata?: any;
    effectIndex?: number;
}

export interface CardChoiceConfig extends ChoiceConfig {
    restrictions?: (TargetRestriction | string)[];
    reveal?: boolean;
    filterSelectable?: boolean;
    minChoices?: number;
    maxChoices?: number;
    onSelected?: (card: GameObject) => EffectDefinition[]; // Returns effects to run
    onNone?: () => EffectDefinition[]; // Returns effects if skipped/none selected
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
        const { targeting: TargetingProcessor } = getProcessors(state);

        let options: ChoiceOption[] = cards.map(c => {
            const isMatch = TargetingProcessor.matchesRestrictions(state, c, restrictions, {
                controllerId: playerId,
                sourceId,
                stackObject: config.stackObj,
                effects: [],
                targets: []
            });

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
            });
        }

        const result = this.wrap(state, playerId, sourceId, {
            label: config.label,
            choices: options,
            reveal: config.reveal,
            hideUndo: config.hideUndo,
            lookingCards: cards, // Preserve for UI/Context
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext),
            targets: config.targets,
            originalTargets: config.originalTargets || config.parentContext?.originalTargets,
            isSpellCasting: config.isSpellCasting,
            isCostChoice: config.isCostChoice,
            costType: config.costType,
            isFreeCast: config.isFreeCast,
            exileOnResolution: config.exileOnResolution || config.stackObj?.exileOnResolution,
            minChoices: config.minChoices !== undefined ? config.minChoices : (config.stackObj?.minChoices ?? 1),
            maxChoices: config.maxChoices !== undefined ? config.maxChoices : (config.stackObj?.maxChoices ?? 1),
            metadata: config.metadata
        }, config.actionType);

        const { logger } = getProcessors(state);
        logger.debug(state, LogCategory.ACTION, `[CHOICE-CREATE] CardChoice for ${sourceId} | Targets: ${config.targets?.length || 0} | Original: ${config.originalTargets?.length || 0} | Parent: ${!!config.parentContext}`);
        return result;
    }

    /**
     * Build generic button-based choices.
     */
    public static createModalChoice(
        state: GameState,
        config: ChoiceConfig & { minChoices?: number, maxChoices?: number, allowDuplicates?: boolean, lookingCards?: GameObject[] },
        choices: { label: string, value: any, costs?: any[], effects?: any[] }[]
    ) {
        const { cost: CostProcessor } = getProcessors(state);
        const mappedChoices: any[] = choices.map(c => ({
            ...c,
            selectable: c.costs ? CostProcessor.canPay(state, c.costs, config.sourceId, config.playerId) : true
        }));

        if (config.optional) {
            mappedChoices.push({
                label: "None / Skip",
                value: "none",
                selectable: true,
                effects: []
            });
        }

        if (config.showCancel) {
            mappedChoices.push({
                label: "Cancel",
                value: "cancel",
                selectable: true,
                effects: []
            });
        }

        const result = this.wrap(state, config.playerId, config.sourceId, {
            label: config.label,
            choices: mappedChoices,
            hideUndo: config.hideUndo,
            lookingCards: config.lookingCards,
            allowDuplicates: config.allowDuplicates,
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext),
            targets: config.targets,
            originalTargets: config.originalTargets || config.parentContext?.originalTargets,
            isSpellCasting: config.isSpellCasting,
            isCostChoice: config.isCostChoice,
            costType: config.costType,
            isFreeCast: config.isFreeCast,
            exileOnResolution: config.exileOnResolution || config.stackObj?.exileOnResolution,
            minChoices: config.minChoices !== undefined ? config.minChoices : (config.stackObj?.minChoices ?? 1),
            maxChoices: config.maxChoices !== undefined ? config.maxChoices : (config.stackObj?.maxChoices ?? 1),
        }, config.actionType);

        const { logger } = getProcessors(state);
        logger.debug(state, LogCategory.ACTION, `[CHOICE-CREATE] ModalChoice for ${config.sourceId} | Targets: ${config.targets?.length || 0} | Original: ${config.originalTargets?.length || 0} | Parent: ${!!config.parentContext}`);
        return result;
    }

    /**
     * Build interactive Scry action.
     */
    public static createScryChoice(state: GameState, cards: GameObject[], config: ChoiceConfig) {
        return this.wrap(state, config.playerId, config.sourceId, {
            label: config.label || `Scry ${cards.length}`,
            lookingCards: cards,
            destinations: ['top', 'bottom'],
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext),
            targets: config.targets
        }, ActionType.Scry);
    }

    /**
     * Build interactive Surveil action.
     */
    public static createSurveilChoice(state: GameState, cards: GameObject[], config: ChoiceConfig) {
        return this.wrap(state, config.playerId, config.sourceId, {
            label: config.label || `Surveil ${cards.length}`,
            lookingCards: cards,
            destinations: ['top', 'graveyard'],
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext),
            targets: config.targets
        }, ActionType.Surveil);
    }

    /**
     * Build interactive Discard action.
     * Supports multiple players sequentially, but each player selects all their cards in one go.
     */
    public static createDiscardChoice(state: GameState, playerIds: PlayerId[], sourceId: string, amount: number | any, label: string, stackObj?: any, parentContext?: any, onFailureEffects?: any[]): any {
        if (playerIds.length === 0) return null;

        const { logger } = getProcessors(state);
        const [currentPlayerId, ...nextPlayerIds] = playerIds;
        const player = state.players[currentPlayerId];

        logger.debug(state, LogCategory.ACTION, `[DISCARD-DEBUG] createDiscardChoice for ${currentPlayerId}. Next: ${JSON.stringify(nextPlayerIds)}`);

        // Reset discard tracking state even if skipping
        state.turnState.lastDiscardedCount = 0;
        state.turnState.lastDiscardedIds = [];

        // Skip player if hand is empty
        if (!player || player.hand.length === 0) {
            const failureEffects = onFailureEffects || stackObj?.onFailureEffects;
            if (failureEffects) {
                const { effect: EffectProcessor } = getProcessors(state);
                logger.debug(state, LogCategory.ACTION, `[DISCARD-DEBUG] ${currentPlayerId} cannot discard. Triggering failure effects.`);
                EffectProcessor.resolveEffects({
                    state,
                    context: EffectProcessor.createEngineFrame(state, {
                        sourceId,
                        effects: failureEffects,
                        targets: [currentPlayerId],
                        stackObject: stackObj,
                        parentContext: parentContext,
                        controllerIdOverride: currentPlayerId
                    })
                });
            }
            return this.createDiscardChoice(state, nextPlayerIds, sourceId, amount, label, stackObj, parentContext, failureEffects);
        }

        const resolvedAmount = (typeof amount === 'number' || amount === 'ANY' || amount === 'ALL') ? amount : (getProcessors(state).effect.resolveAmount(state, amount, {
            sourceId,
            controllerId: currentPlayerId,
            stackObject: stackObj,
            targets: [currentPlayerId],
            effects: []
        }, [currentPlayerId]));

        if (resolvedAmount === 0) {
            return this.createDiscardChoice(state, nextPlayerIds, sourceId, amount, label, stackObj, parentContext, onFailureEffects);
        }

        const isAny = resolvedAmount === 'ANY';
        const isAll = resolvedAmount === 'ALL';
        const discardAmount = isAll || isAny ? player.hand.length : (typeof resolvedAmount === 'number' ? Math.min(player.hand.length, resolvedAmount) : 1);
        const minChoices = isAny ? 0 : discardAmount;
        const maxChoices = (isAny || isAll) ? player.hand.length : discardAmount;

        // Initialize player's discard state for the unified UI
        // pendingDiscardCount MUST be > 0 so frontend routes hand clicks to discard (not play).
        if (state.players[currentPlayerId]) {
            state.players[currentPlayerId].pendingDiscardCount = discardAmount;
        }
        logger.debug(state, LogCategory.ACTION, `[DISCARD-DEBUG] Calculated amount for ${currentPlayerId}: ${discardAmount} (from resolved: ${resolvedAmount}, hand: ${state.players[currentPlayerId]?.hand.length})`);
        state.turnState.lastDiscardedCount = 0; // Reset for new selection phase
        state.turnState.lastDiscardedIds = [];

        const finalAction = this.createCardChoice(state, player.hand, {
            label: label,
            playerId: currentPlayerId,
            sourceId,
            optional: isAny,
            actionType: ActionType.Discard,
            minChoices: minChoices,
            maxChoices: maxChoices,
            stackObj: {
                ...stackObj,
                minChoices: minChoices,
                maxChoices: maxChoices,
                onFailureEffects: onFailureEffects
            },
            parentContext: pruneContext(parentContext),
            targets: [currentPlayerId],
            metadata: { 
                discardAmount: amount, 
                isDiscardSequence: true 
            }, // Preserve original resolver/amount for sequential players
            onSelected: (card: GameObject) => {
                return [{ type: 'MoveToZone', targetIds: [card.id], zone: Zone.Graveyard, isDiscard: true }];
            }
        });

        // Inject sequence metadata and ensure top-level count exists for UI decrementing
        if (finalAction) {
            finalAction.count = discardAmount;
            if (finalAction.data) {
                finalAction.data.count = discardAmount; // Critical for UI synchronization
                finalAction.data.nextPlayerIds = nextPlayerIds;
                finalAction.data.discardAmount = amount;
                finalAction.data.onFailureEffects = onFailureEffects;
                finalAction.data.isOptionalDiscard = isAny; // Allow early exit via pass
                finalAction.data.isDiscardSequence = true;
            }
        }

        return finalAction;
    }

    /**
     * Build an interactive choice for a specific cost (e.g. TapSelection).
     */
    public static createCostInteractionChoice(state: GameState, cost: any, sourceId: string, playerId: PlayerId, choice: any, data: any): any {
        const { targeting: TargetingProcessor } = getProcessors(state);

        let candidates: GameObject[] = [];
        let label = "Choose targets for cost";

        if (cost.type === 'TapSelection') {
            candidates = state.battlefield.filter(o =>
                String(o.controllerId) === String(playerId) &&
                !o.isTapped &&
                (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, o, cost.restrictions, { controllerId: playerId, sourceId, effects: [], targets: [] }))
            );
            label = `Tap ${cost.amount || cost.value || 1} creatures`;
        } else if (cost.type === 'Discard') {
            candidates = state.players[playerId].hand.filter(c =>
                !cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, { controllerId: playerId, sourceId, effects: [], targets: [] })
            );
            label = `Discard ${cost.amount || cost.value || 1} cards`;
        } else if (cost.type === 'Exile') {
            const zones = cost.sourceZones || ['Graveyard'];
            const pool: GameObject[] = [];
            if (zones.includes('Graveyard')) pool.push(...state.players[playerId].graveyard);
            if (zones.includes('Hand')) pool.push(...state.players[playerId].hand);
            if (zones.includes('Battlefield')) pool.push(...state.battlefield.filter(o => String(o.controllerId) === String(playerId)));

            candidates = pool.filter(c =>
                !cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, { controllerId: playerId, sourceId, effects: [], targets: [] })
            );
            label = `Exile ${cost.amount || cost.value || 1} cards`;
        } else if (cost.type === 'Sacrifice') {
            candidates = state.battlefield.filter(o =>
                String(o.controllerId) === String(playerId) &&
                (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, o, cost.restrictions, { controllerId: playerId, sourceId, effects: [], targets: [] }))
            );
            label = `Sacrifice ${cost.amount || cost.value || 1} permanents`;
        }

        const amount = Number(cost.value || cost.amount || 1);
        const { action: ActionProcessor } = getProcessors(state);

        if (cost.type === 'TapSelection' || cost.type === 'Sacrifice') {
            return ActionProcessor.prepareAction(state, ActionBuilder.targeting(playerId, sourceId, label)
                .asCost(cost.type)
                .withContext({ stackObj: data.stackObj, parentContext: data.parentContext })
                .withData({
                    minChoices: amount,
                    maxChoices: amount,
                    targetDefinitions: [{
                        type: cost.type === 'TapSelection' ? 'Creature' : 'Permanent',
                        count: amount,
                        restrictions: cost.restrictions || []
                    }],
                    targets: candidates.map(c => c.id),
                    choiceEffects: choice.effects,
                    remainingCosts: choice.costs.filter((c: any) => c !== cost),
                    selectedChoice: choice,
                    originalActionData: data
                })
                .build());
        }
    }

    /**
     * Build an interactive choice for X value.
     */
    public static createXChoice(state: GameState, sourceId: string, playerId: PlayerId, choice: any, data: any): any {
        const { action: ActionProcessor } = getProcessors(state);
        return ActionProcessor.prepareAction(state, ActionBuilder.chooseX(playerId, sourceId, choice.label || "Choose a value for X")
            .withContext({ stackObj: data?.stackObj, parentContext: pruneContext(data?.parentContext), effectIndex: data?.effectIndex })
            .withData({
                isResolutionX: true,
                choiceEffects: choice.effects,
                choiceCosts: choice.costs,
                selectedChoice: choice,
                originalActionData: data
            })
            .build());
    }

    /**
     * Wraps data into the standard engine pendingAction format.
     */
    private static wrap(state: GameState, playerId: string, sourceId: string, data: any, type: ActionType | string = ActionType.ResolutionChoice): any {
        const { action: ActionProcessor } = getProcessors(state);

        // The new ingest() method handles all metadata consolidation and pruning automatically.
        const finalAction = ActionBuilder.fromType(type, playerId, sourceId)
            .ingest(data)
            .build();

        const { logger } = getProcessors(state);
        const meta = data.parentContext || data.stackObj || {};
        logger.debug(state, LogCategory.ACTION, `[CHOICE-WRAP] Wrapped Action: ${type} | Source: ${sourceId} | Targets: ${data.targets?.length || 0} | Original: ${data.originalTargets?.length || 0} | Depth: ${meta.depth}`);

        return ActionProcessor.prepareAction(state, finalAction);
    }
}


