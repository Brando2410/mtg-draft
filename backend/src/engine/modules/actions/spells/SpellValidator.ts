import { AbilityDefinition, AbilityType, ActivatedAbilityDefinition, CardLogic, EffectType, EnginePrefix, GameObject, GameState, Keyword, Phase, PlayerId, TargetMapping, Zone } from '@shared/engine_types';
import { EngineContext } from '../../../interfaces/EngineContext';
import { LogCategory, EngineLogger } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { RestrictionValidator } from '../../core/RestrictionValidator';
import { PriorityProcessor } from '../../core/turn/PriorityProcessor';
import { CostProcessor } from '../../magic/CostProcessor';
import { getProcessors } from '../../ProcessorRegistry';


export class SpellValidator {

    public static resolveCardToPlay(state: GameState, playerId: PlayerId, cardInstanceId: string, bypassPermission = false, forceFlashback?: boolean): GameObject | null {
        const player = state.players[playerId];

        // 1. Search in Hand (Real objects)
        const cardInHand = player.hand.find(c => c.id === cardInstanceId);
        if (cardInHand) return cardInHand;

        // 2. Search for Virtual Actions (Flashback, Permission, FreeCast, Prepared)
        const isVirtualPrepared = cardInstanceId.startsWith(EnginePrefix.VirtualPrepared);
        const isFlashback = cardInstanceId.startsWith(EnginePrefix.Flashback);
        const isPermission = cardInstanceId.startsWith(EnginePrefix.Permission);
        const isFree = cardInstanceId.startsWith(EnginePrefix.FreeCast);
        const isCopy = cardInstanceId.startsWith(EnginePrefix.Copy);

        if (isVirtualPrepared || isFlashback || isPermission || isFree || isCopy) {
            let realId = cardInstanceId;
            if (isVirtualPrepared) realId = cardInstanceId.replace(EnginePrefix.VirtualPrepared, '');
            if (isFlashback) realId = cardInstanceId.replace(EnginePrefix.Flashback, '');
            if (isPermission) realId = cardInstanceId.replace(EnginePrefix.Permission, '');
            if (isFree) realId = cardInstanceId.replace(EnginePrefix.FreeCast, '');

            if (isCopy) {
                const parts = cardInstanceId.split('_');
                if (parts.length >= 2) realId = parts[1];
            }

            const realObj = RuleUtils.findObject(state, realId);
            if (realObj && RuleUtils.isGameObject(realObj)) {
                if (isVirtualPrepared && realObj.zone === Zone.Battlefield && realObj.isPrepared) {
                    const face = realObj.definition.preparedFace || realObj.definition.faces?.[1];
                    if (face) {
                        const copyId = isCopy ? cardInstanceId : `${EnginePrefix.Copy}${realObj.id}_${Date.now()}`;
                        if (state.dynamicCopies && state.dynamicCopies[copyId]) return state.dynamicCopies[copyId];
                        
                        const copy: GameObject = {
                            ...realObj,
                            id: copyId,
                            definition: { ...face, image_url: face.image_url || realObj.definition.image_url },
                            zone: Zone.Exile,
                            isPreparedCopy: true,
                            sourceCreatureId: realObj.id,
                            effectiveStats: undefined,
                            image_url: face.image_url || realObj.definition.image_url,
                            counters: {},
                            isTapped: false,
                            damageMarked: 0,
                            summoningSickness: false,
                            faceDown: false,
                            abilitiesUsedThisTurn: 0,
                            attachedTo: undefined
                        };

                        if (!state.dynamicCopies) state.dynamicCopies = {};
                        state.dynamicCopies[copyId] = copy;
                        return copy;
                    }
                }

                return {
                    ...realObj,
                    isFlashbackCast: isFlashback,
                    isFreeCast: isFree,
                    isVirtual: true
                };
            }
        }

        // 3. Search in Non-hand zones using Real ID (New Modal System)
        let realId = cardInstanceId;
        const isV = cardInstanceId.startsWith(EnginePrefix.VirtualHand);
        if (isV) realId = cardInstanceId.replace(EnginePrefix.VirtualHand, '');

        const obj = RuleUtils.findObject(state, realId);
        if (RuleUtils.isEntity(obj) && obj.controllerId === playerId && (obj.zone !== Zone.Hand || isV)) {
            const realObj = obj as GameObject;
            const stats = getProcessors(state).layer.getEffectiveStats(realObj, state);
            const hasFlashback = realObj.zone === Zone.Graveyard && (stats.keywords?.includes(Keyword.Flashback) || realObj.definition.keywords?.includes(Keyword.Flashback));

            // Set flags on the REAL object
            realObj.isFlashbackCast = forceFlashback === true;
            realObj.isVirtual = true;
            return realObj;
        }

        if (state.paradigmCopies && state.paradigmCopies[cardInstanceId]) return state.paradigmCopies[cardInstanceId];
        if (state.dynamicCopies && state.dynamicCopies[cardInstanceId]) return state.dynamicCopies[cardInstanceId];

        return null;
    }

    public static validateCardTiming(state: GameState, playerId: PlayerId, cardToPlay: GameObject, isInstantOrFlash: boolean, bypassPriority: boolean): boolean {
        const { logger } = getProcessors(state);
        // Rule 117.1a: Spell casting timing
        const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
        const activeId = String(state.activePlayerId).trim();
        const stackEmpty = state.stack.length === 0;

        if (!bypassPriority) {
            if (!isInstantOrFlash && (String(playerId) !== activeId || !isMainPhase || !stackEmpty)) {
                logger.info(state, LogCategory.ACTION, `Illegal Play: ${cardToPlay.definition.name} can only be played at sorcery speed.`);
                return false;
            }
            if (String(state.priorityPlayerId) !== String(playerId)) {
                logger.info(state, LogCategory.ACTION, `Illegal Play: You do not have priority.`);
                return false;
            }
        }
        return true;
    }

    public static handleLandPlay(state: GameState, playerId: PlayerId, cardToPlay: GameObject, engine: EngineContext): boolean {
        const { logger, action: ActionProcessor, trigger: TriggerProcessor } = getProcessors(state);
        const player = state.players[playerId];
        const activeId = String(state.activePlayerId).trim();
        const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);

        if (String(playerId) !== activeId || !isMainPhase || state.stack.length > 0) {
            logger.info(state, LogCategory.ACTION, `Illegal Play: Lands can only be played at sorcery speed.`);
            return false;
        }

        if (player.hasPlayedLandThisTurn) {
            logger.info(state, LogCategory.ACTION, `Illegal Play: You have already played a land this turn.`);
            return false;
        }

        player.hasPlayedLandThisTurn = true;
        ActionProcessor.moveCard(state, cardToPlay, Zone.Battlefield, playerId);
        TriggerProcessor.onEvent(state, { type: 'ON_LAND_PLAY', playerId, payload: { object: cardToPlay, targetIds: [cardToPlay.id], sourceId: cardToPlay.id } });
        engine.resetPriorityToActivePlayer();
        return true;
    }


    public static validateAbilityActivation(state: GameState, playerId: PlayerId, obj: GameObject, ability: AbilityDefinition, abilityIndex: number): boolean {
        const { logger } = getProcessors(state);
        const activeZone = ability.activeZone || Zone.Battlefield;
        if (activeZone !== Zone.Any && activeZone !== obj.zone) {
            logger.info(state, LogCategory.ACTION, `Illegal Activation: ${obj.definition.name}'s ability cannot be activated from ${obj.zone}.`);
            return false;
        }

        if (!RestrictionValidator.canActivateAbility(state, playerId, ability, obj)) {
            logger.info(state, LogCategory.ACTION, `Illegal Activation: Ability activation is currently restricted.`);
            return false;
        }

        if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) {
            logger.info(state, LogCategory.ACTION, `Illegal Activation: Cannot pay costs for ${obj.definition.name}'s ability.`);
            return false;
        }

        if (ability.triggerCondition && !ability.triggerCondition(state, { type: 'NONE' } as any, { sourceId: obj.id, controllerId: playerId , effects: [], targets: []})) {
            logger.info(state, LogCategory.ACTION, `Illegal Activation: Activation requirements for ${obj.definition.name} are not met.`);
            return false;
        }

        if (ability.type === AbilityType.Activated) {
            const activatedAbility = ability as ActivatedAbilityDefinition;
            if (activatedAbility.limitPerTurn) {
                const usedCount = state.turnState.triggeredAbilitiesUsedThisTurn[`ability_${obj.id}_${abilityIndex}`] || 0;
                if (usedCount >= activatedAbility.limitPerTurn) {
                    logger.info(state, LogCategory.ACTION, `Illegal Activation: This ability has already been used ${usedCount} times this turn.`);
                    return false;
                }
            }
        }
        return true;
    }


    public static validateAbilitySpeed(state: GameState, playerId: PlayerId, obj: GameObject, ability: AbilityDefinition): boolean {
        const { logger } = getProcessors(state);
        const isPlaneswalker = RuleUtils.isPlaneswalker(obj);
        
        let isSorceryOnly = false;
        if (ability.type === AbilityType.Activated) {
            const activated = ability as ActivatedAbilityDefinition;
            isSorceryOnly = !!activated.activatedOnlyAsSorcery;
        }

        if (isPlaneswalker || isSorceryOnly) {
            const activeId = String(state.activePlayerId).trim();
            const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
            const stackEmpty = state.stack.length === 0;
            const isSorcerySpeed = String(playerId) === activeId && isMainPhase && stackEmpty;
            const canActivateAnyTime = (obj.definition.abilities || []).some((a: string | AbilityDefinition) => {
                if (typeof a === 'string') return false;
                return a.type === AbilityType.Static && String(a.id).includes('any_turn');
            }) ||
                state.ruleRegistry.continuousEffects.some(e =>
                    e.type === EffectType.AllowOutOfTurnActivation &&
                    (e.targetIds?.includes(obj.id) || (e.targetMapping === TargetMapping.Self && e.sourceId === obj.id))
                );

            if (!canActivateAnyTime && !isSorcerySpeed) {
                logger.info(state, LogCategory.ACTION, `Illegal Activation: This ability can only be activated at sorcery speed.`);
                return false;
            }

            if (isPlaneswalker && obj.abilitiesUsedThisTurn > 0) {
                logger.info(state, LogCategory.ACTION, `Illegal Activation: This permanent's activated abilities have already been used this turn.`);
                return false;
            }
        }
        return true;
    }
}
