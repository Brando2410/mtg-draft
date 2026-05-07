import { ActionType, GameObject, GameState, PlayerId, Restriction, TargetDefinition, TargetType, Zone, ResolutionContext } from "@shared/engine_types";
import { LogCategory } from "../../../utils/EngineLogger";
import { RuleUtils } from "../../../utils/RuleUtils";
import { TargetingProcessor } from "./TargetingProcessor";
import { getProcessors } from "../../ProcessorRegistry";

export interface TargetingDispatchOptions {
    state: GameState;
    playerId: PlayerId;
    sourceObj: GameObject;
    targetDefinitions: TargetDefinition[];
    existingTargets: string[];
    xValue: number;
    isSpellCasting: boolean;
    isFreeCast?: boolean;
    exileOnResolution?: boolean;
    parentContext?: ResolutionContext;
    abilityIndex?: number;
    preSelectedChoice?: number;
    isCopyTargeting?: boolean;
}

export class TargetingDispatcher {
    /**
     * Centralized logic for dispatching the next interactive targeting step.
     * Evaluates auto-targeting, consecutive modals, and standard prompts.
     * 
     * @returns 
     * - `true` if a pending action was injected (requires user input)
     * - `false` if no valid targets exist and the requirement is mandatory (fizzle)
     * - `string[]` of targets if targeting is automatically completed or skipped
     */
    public static dispatchTargetingStep(options: TargetingDispatchOptions): boolean | string[] {
        const { state, playerId, sourceObj, targetDefinitions, existingTargets, xValue, isSpellCasting, isFreeCast, exileOnResolution, parentContext, abilityIndex, preSelectedChoice, isCopyTargeting } = options;
        const { logger } = getProcessors(state);

        const totalCounts = TargetingProcessor.calculateTotalCounts(targetDefinitions, xValue);
        if (existingTargets.length >= totalCounts.maxCount) {
            return existingTargets;
        }

        const pool = RuleUtils.getAllVisibleObjectIds(state);

        const nextIndex = existingTargets.length;
        const currentDef = TargetingProcessor.getDefinitionForIndex(targetDefinitions, nextIndex, xValue);
        
        const legalPool = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
            sourceId: sourceObj.id,
            controllerId: sourceObj.controllerId || playerId,
            targetDefinitions: targetDefinitions,
            targetIndex: nextIndex
        }, tid));
        
        logger.debug(state, LogCategory.ACTION, `[DEBUG] Found ${legalPool.length} legal targets for slot ${nextIndex} of ${sourceObj.definition.name}: [${legalPool.join(', ')}]`);

        const restrictions = currentDef?.restrictions || [];
        const isOpponentTarget = currentDef?.type === TargetType.Opponent || (currentDef?.type === TargetType.Player && restrictions.includes(Restriction.Opponent));
        const isSingleOpponentTarget = isOpponentTarget && legalPool.length === 1;

        if (isSingleOpponentTarget) {
            const opponentId = legalPool[0];
            logger.info(state, LogCategory.ACTION, `[AUTO-TARGET] Automatically targeting the only opponent for ${sourceObj.definition.name}.`);

            if (totalCounts.maxCount === 1) {
                return [...existingTargets, opponentId]; // Completely finished targeting
            }

            // More than 1 target total: auto-select this step and continue to the next one immediately
            const autoSelected = [...existingTargets, opponentId];
            const nextDefAfterAuto = TargetingProcessor.getDefinitionForIndex(targetDefinitions, autoSelected.length, xValue);
            const secondaryPool = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                sourceId: sourceObj.id,
                controllerId: sourceObj.controllerId || playerId,
                targetDefinitions: targetDefinitions,
                targetIndex: autoSelected.length
            }, tid));
            
            const nextCounts = TargetingProcessor.getCountsForDefinition(nextDefAfterAuto, xValue);
            const prompt = TargetingProcessor.generateTargetPrompt(targetDefinitions, autoSelected.length, xValue, isSpellCasting);

            state.pendingAction = {
                type: ActionType.Targeting,
                playerId: playerId,
                sourceId: sourceObj.id,
                data: {
                    targetDefinitions,
                    targets: secondaryPool,
                    selectedTargets: autoSelected,
                    label: nextDefAfterAuto?.label || '',
                    isSpellCasting,
                    xValue,
                    maxCount: nextCounts.maxCount,
                    minCount: nextCounts.minCount,
                    count: nextCounts.count,
                    prompt,
                    isOptional: nextCounts.minCount === 0,
                    canSkip: nextCounts.minCount === 0 || autoSelected.length >= nextCounts.minCount,
                    isFreeCast,
                    exileOnResolution,
                    parentContext,
                    abilityIndex,
                    preSelectedChoice,
                    isCopyTargeting,
                    spellCopyRef: (isCopyTargeting || parentContext) ? (sourceObj as any) : undefined // Only link to stack if it's already there
                }
            };
            return true;
        }

        if (legalPool.length === 0) {
            if (currentDef?.optional || currentDef?.minCount === 0) {
                logger.info(state, LogCategory.ACTION, `No legal targets found for slot ${nextIndex}, auto-skipping.`);
                return existingTargets; // Return what we have so far
            } else {
                logger.info(state, LogCategory.ACTION, `Illegal Play: No valid targets available for ${sourceObj.definition.name} slot ${nextIndex}.`);
                return false;
            }
        }

        const stepCounts = TargetingProcessor.getCountsForDefinition(currentDef, xValue);

        // --- ENHANCEMENT: Consecutive Graveyard/Exile Targeting Modal ---
        const isOffBattlefieldTargeting = currentDef && (currentDef.type === TargetType.CardInGraveyard || currentDef.type === TargetType.CardInExile);

        if (isOffBattlefieldTargeting && legalPool.length > 0 && currentDef) {
            let consecutiveCount = 0;
            let consecutiveMin = 0;
            
            // 1. Find where the current definition starts in the global target index
            let currentDefStart = 0;
            let currentDefIdx = -1;
            for (let i = 0; i < targetDefinitions.length; i++) {
                const d = targetDefinitions[i];
                const dCounts = TargetingProcessor.getCountsForDefinition(d, xValue);
                if (d === currentDef) {
                    currentDefIdx = i;
                    break;
                }
                currentDefStart += dCounts.maxCount;
            }

            // 2. Add remaining slots from the current definition
            const currentCounts = TargetingProcessor.getCountsForDefinition(currentDef, xValue);
            const slotsUsedInCurrentDef = nextIndex - currentDefStart;
            
            // IF we are in the middle of a definition (slotsUsedInCurrentDef > 0),
            // and it's an off-battlefield target, it means we ALREADY showed the modal for this group.
            // We should not show it again for the remaining optional slots.
            if (slotsUsedInCurrentDef > 0) {
                logger.info(state, LogCategory.ACTION, `[ZONE-SHIFT-MODAL] Already processed ${slotsUsedInCurrentDef} slots for ${currentDef.type} group. Finishing group.`);
                return existingTargets;
            }

            consecutiveCount = Math.max(0, currentCounts.maxCount - slotsUsedInCurrentDef);
            consecutiveMin = Math.max(0, currentCounts.minCount - slotsUsedInCurrentDef);

            // 3. Look ahead for more consecutive definitions of the same type
            if (currentDefIdx !== -1) {
                for (let i = currentDefIdx + 1; i < targetDefinitions.length; i++) {
                    const d = targetDefinitions[i];
                    if (d && (d.type === currentDef.type)) {
                        const dCounts = TargetingProcessor.getCountsForDefinition(d, xValue);
                        consecutiveCount += dCounts.maxCount;
                        consecutiveMin += dCounts.minCount;
                    } else {
                        break;
                    }
                }
            }

            if (consecutiveCount <= 0) {
                return existingTargets; // No more slots in this group, move on
            }

            const choices = legalPool.map(id => {
                const obj = RuleUtils.findObject(state, id);
                return {
                    label: (RuleUtils.isEntity(obj) ? obj.definition.name : (RuleUtils.isPlayer(obj) ? obj.name : id)),
                    value: id,
                    cardData: obj,
                    selectable: true
                };
            });

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: sourceObj.id,
                data: {
                    targetDefinitions,
                    isTargetingModal: true,
                    choices,
                    minChoices: Math.max(1, consecutiveMin),
                    maxChoices: consecutiveCount,
                    label: currentDef?.label || `Choose a card from your graveyard for ${sourceObj.definition.name}`,
                    isSpellCasting,
                    xValue,
                    isFreeCast,
                    exileOnResolution,
                    parentContext,
                    abilityIndex,
                    preSelectedChoice,
                    isCopyTargeting,
                    spellCopyRef: (isCopyTargeting || parentContext) ? (sourceObj as any) : undefined // Only link to stack if it's already there
                }
            };
            logger.info(state, LogCategory.ACTION, `[ZONE-SHIFT-MODAL] Grouping ${consecutiveCount} consecutive ${currentDef.type} targets into modal.`);
            return true;
        }

        const prompt = TargetingProcessor.generateTargetPrompt(targetDefinitions, nextIndex, xValue, isSpellCasting);

        state.pendingAction = {
            type: ActionType.Targeting,
            playerId: playerId,
            sourceId: sourceObj.id,
            data: {
                targetDefinitions,
                targets: legalPool,
                label: currentDef?.label || `Select target for ${sourceObj.definition.name}`,
                selectedTargets: existingTargets,
                isSpellCasting,
                xValue,
                maxCount: stepCounts.maxCount,
                minCount: stepCounts.minCount,
                count: stepCounts.count,
                prompt,
                isOptional: stepCounts.minCount === 0,
                canSkip: stepCounts.minCount === 0 || existingTargets.length >= stepCounts.minCount,
                isFreeCast,
                exileOnResolution,
                parentContext,
                abilityIndex,
                preSelectedChoice,
                isCopyTargeting,
                spellCopyRef: (isCopyTargeting || parentContext) ? (sourceObj as any) : undefined // Only link to stack if it's already there
            }
        };
        logger.info(state, LogCategory.ACTION, `[TARGETING] ${state.players[playerId].name} is selecting targets for ${sourceObj.definition.name}...`);
        return true;
    }
}
