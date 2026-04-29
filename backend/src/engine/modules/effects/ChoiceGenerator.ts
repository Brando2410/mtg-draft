import { ActionType, GameObject, GameState, PlayerId, Zone } from '@shared/engine_types';
import { getProcessors } from '../ProcessorRegistry';
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
    targets?: string[];
    isSpellCasting?: boolean;
    isCostChoice?: boolean;
    costType?: string;
    isFreeCast?: boolean;
    exileOnResolution?: boolean;
    metadata?: any;
}

export interface CardChoiceConfig extends ChoiceConfig {
    restrictions?: any[];
    reveal?: boolean;
    filterSelectable?: boolean;
    minChoices?: number;
    maxChoices?: number;
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
        const { targeting: TargetingProcessor } = getProcessors(state);
        
        let options = cards.map(c => {
            const isMatch = TargetingProcessor.matchesRestrictions(state, c, restrictions, {
                controllerId: playerId,
                sourceId,
                stackObject: config.stackObj
            } as any);
            
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

        return this.wrap(state, playerId, sourceId, {
            label: config.label,
            choices: options,
            reveal: config.reveal,
            hideUndo: config.hideUndo,
            lookingCards: cards, // Preserve for UI/Context
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext),
            targets: config.targets,
            isSpellCasting: config.isSpellCasting,
            isCostChoice: config.isCostChoice,
            costType: config.costType,
            isFreeCast: config.isFreeCast,
            exileOnResolution: config.exileOnResolution,
            minChoices: config.minChoices !== undefined ? config.minChoices : (config.stackObj?.data?.minChoices || 1),
            maxChoices: config.maxChoices !== undefined ? config.maxChoices : (config.stackObj?.data?.maxChoices || 1),
        }, config.actionType);
    }

    /**
     * Build generic button-based choices.
     */
    public static createModalChoice(
        state: GameState,
        config: ChoiceConfig & { minChoices?: number, maxChoices?: number, lookingCards?: GameObject[] },
        choices: { label: string, value: any, costs?: any[], effects?: any[] }[]
    ) {
        const { cost: CostProcessor } = getProcessors(state);
        return this.wrap(state, config.playerId, config.sourceId, {
            label: config.label,
            choices: choices.map(c => ({
                ...c,
                selectable: c.costs ? CostProcessor.canPay(state, c.costs, config.sourceId, config.playerId) : true
            })),
            hideUndo: config.hideUndo,
            lookingCards: config.lookingCards,
            stackObj: config.stackObj,
            parentContext: pruneContext(config.parentContext),
            targets: config.targets,
            isSpellCasting: config.isSpellCasting,
            isCostChoice: config.isCostChoice,
            costType: config.costType,
            isFreeCast: config.isFreeCast,
            exileOnResolution: config.exileOnResolution,
            minChoices: config.minChoices !== undefined ? config.minChoices : (config.stackObj?.data?.minChoices || 1),
            maxChoices: config.maxChoices !== undefined ? config.maxChoices : (config.stackObj?.data?.maxChoices || 1),
        }, config.actionType);
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
    public static createDiscardChoice(state: GameState, playerIds: PlayerId[], sourceId: string, amount: number | any, label: string, stackObj?: any, parentContext?: any, onFailureEffects?: any[], log?: (m: string) => void): any {
        if (playerIds.length === 0) return null;
        
        const [currentPlayerId, ...nextPlayerIds] = playerIds;
        const player = state.players[currentPlayerId];
        
        if (log) log(`[DISCARD-DEBUG] createDiscardChoice for ${currentPlayerId}. Next: ${JSON.stringify(nextPlayerIds)}`);
        
        // Skip player if hand is empty
        if (!player || player.hand.length === 0) {
            const failureEffects = onFailureEffects || (stackObj?.data?.onFailureEffects);
            if (failureEffects) {
                const { effect: EffectProcessor } = getProcessors(state);
                if (log) log(`[DISCARD-DEBUG] ${currentPlayerId} cannot discard. Triggering failure effects.`);
                EffectProcessor.resolveEffects({
                    state,
                    effects: failureEffects,
                    log: (m: string) => { if (log) log(m); },
                    sourceId,
                    targets: [currentPlayerId],
                    stackObject: stackObj,
                    parentContext: parentContext,
                    controllerIdOverride: currentPlayerId // Set controller from the discard context
                });
            }
            return this.createDiscardChoice(state, nextPlayerIds, sourceId, amount, label, stackObj, parentContext, failureEffects, log);
        }

        const resolvedAmount = (typeof amount === 'number' || amount === 'ANY' || amount === 'ALL') ? amount : (getProcessors(state).effect.resolveAmount(state, amount, {
            sourceId,
            controllerId: currentPlayerId,
            stackObject: stackObj,
            targets: [currentPlayerId],
            effects: []
        }, [currentPlayerId]));
        
        const isAny = resolvedAmount === 'ANY' || resolvedAmount === 'Any';
        const isAll = resolvedAmount === 'ALL' || resolvedAmount === 'All';
        const discardAmount = isAll ? player.hand.length : (typeof resolvedAmount === 'number' ? Math.min(player.hand.length, resolvedAmount) : (isAny ? player.hand.length : 1));
        const minChoices = isAny ? 0 : discardAmount;
        const maxChoices = (isAny || isAll) ? player.hand.length : discardAmount;

        // Initialize player's discard state for the unified UI
        player.pendingDiscardCount = discardAmount;

        const finalAction = this.createCardChoice(state, player.hand, {
            label: isAny ? `${label} (Any number)` : `${label} (${discardAmount})`,
            playerId: currentPlayerId,
            sourceId,
            optional: isAny,
            // If discarding from OWN hand, use DISCARD type for interactive UI.
            // If Duress style (not implemented here but for future proofing), keep RESOLUTION_CHOICE.
            actionType: ActionType.Discard, 
            stackObj: {
                ...stackObj,
                data: {
                    ...(stackObj?.data || {}),
                    minChoices: minChoices,
                    maxChoices: maxChoices,
                    onFailureEffects: onFailureEffects // Preserve for next steps
                }
            },
            parentContext: pruneContext(parentContext),
            targets: [currentPlayerId],
            onSelected: (card: GameObject) => {
                return [{ type: 'MoveToZone', targetId: card.id, zone: Zone.Graveyard, isDiscard: true }];
            }
        });

        // Inject sequence metadata and ensure top-level count exists for UI decrementing
        if (finalAction) {
            finalAction.count = discardAmount;
            if (finalAction.data) {
                finalAction.data.nextPlayerIds = nextPlayerIds;
                finalAction.data.discardAmount = amount;
                finalAction.data.onFailureEffects = onFailureEffects;
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
                (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, o, cost.restrictions, { controllerId: playerId, sourceId }))
            );
            label = `Tap ${cost.amount || cost.value || 1} creatures`;
        } else if (cost.type === 'Discard') {
            candidates = state.players[playerId].hand.filter(c =>
                !cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, { controllerId: playerId, sourceId })
            );
            label = `Discard ${cost.amount || cost.value || 1} cards`;
        } else if (cost.type === 'Exile') {
            const zones = cost.sourceZones || ['Graveyard'];
            const pool: GameObject[] = [];
            if (zones.includes('Graveyard')) pool.push(...state.players[playerId].graveyard);
            if (zones.includes('Hand')) pool.push(...state.players[playerId].hand);
            if (zones.includes('Battlefield')) pool.push(...state.battlefield.filter(o => String(o.controllerId) === String(playerId)));

            candidates = pool.filter(c =>
                !cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, { controllerId: playerId, sourceId })
            );
            label = `Exile ${cost.amount || cost.value || 1} cards`;
        } else if (cost.type === 'Sacrifice') {
            candidates = state.battlefield.filter(o =>
                String(o.controllerId) === String(playerId) &&
                (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, o, cost.restrictions, { controllerId: playerId, sourceId }))
            );
            label = `Sacrifice ${cost.amount || cost.value || 1} permanents`;
        }

        const amount = Number(cost.value || cost.amount || 1);
        
        const { action: ActionProcessor } = getProcessors(state);
        return ActionProcessor.prepareAction(state, {
            type: ActionType.ModalSelection,
            playerId,
            sourceId,
            data: {
                label,
                isCostChoice: true,
                costType: cost.type,
                minChoices: amount,
                maxChoices: amount,
                stackObj: data.stackObj,
                parentContext: pruneContext(data.parentContext),
                nextEffectIndex: data.nextEffectIndex,
                // Save the choice data so we can resume resolution after the cost is paid
                choiceEffects: choice.effects,
                remainingCosts: choice.costs.filter((c: any) => c !== cost),
                lookingCards: candidates, // Required for UI to render card grid
                choices: candidates.map((c: any) => ({
                    label: c.definition.name,
                    value: c.id,
                    imageUrl: c.definition.image_url || `https://api.scryfall.com/cards/${c.definition.scryfall_id}?format=image&version=normal`,
                    type_line: c.definition.type_line,
                    cardData: c,
                    selectable: true
                }))
            }
        });
    }

    /**
     * Build an interactive choice for X value.
     */
    public static createXChoice(state: GameState, sourceId: string, playerId: PlayerId, choice: any, data: any): any {
        const { action: ActionProcessor } = getProcessors(state);
        return ActionProcessor.prepareAction(state, {
            type: ActionType.ChooseX,
            playerId,
            sourceId,
            data: {
                label: choice.label || "Choose a value for X",
                sourceId,
                isResolutionX: true,
                stackObj: data?.stackObj,
                parentContext: pruneContext(data?.parentContext),
                nextEffectIndex: data?.nextEffectIndex,
                choiceEffects: choice.effects,
                choiceCosts: choice.costs,
                // These are needed for ChoiceProcessor to resume
                selectedChoice: choice,
                originalActionData: data
            }
        });
    }

    /**
     * Wraps data into the standard engine pendingAction format.
     */
    private static wrap(state: GameState, playerId: string, sourceId: string, data: any, type: ActionType | string = ActionType.ResolutionChoice): any {
        const { action: ActionProcessor } = getProcessors(state);
        
        // ARCHITECTURAL NOTE: Metadata Threading
        // We ensure that critical metadata is preserved in a standardized 'metadata' object.
        // This prevents flag loss during complex resolution chains (e.g. Cascade -> Choice -> Cast).
        if (data && !data.metadata) {
            data.metadata = {
                isSpellCasting: data.isSpellCasting,
                isFreeCast: data.isFreeCast,
                exileOnResolution: data.exileOnResolution,
                parentContext: data.parentContext,
                stackObj: data.stackObj,
                targets: data.targets
            };
        }

        return ActionProcessor.prepareAction(state, {
            type,
            playerId,
            sourceId,
            data
        });
    }
}


