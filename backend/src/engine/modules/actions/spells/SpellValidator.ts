import { AbilityDefinition, AbilityType, ActivatedAbilityDefinition, CardLogic, EffectType, EnginePrefix, GameObject, GameState, Keyword, Phase, PlayerId, TargetMapping, Zone } from '@shared/engine_types';
import { EngineContext } from '../../../interfaces/EngineContext';
import { LogCategory, EngineLogger } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { RestrictionValidator } from '../../core/RestrictionValidator';
import { PriorityProcessor } from '../../core/turn/PriorityProcessor';
import { CostProcessor } from '../../magic/CostProcessor';
import { getProcessors } from '../../ProcessorRegistry';


export class SpellValidator {

    public static resolveCardToPlay(state: GameState, playerId: PlayerId, cardInstanceId: string, bypassPermission = false): GameObject | null {
        const player = state.players[playerId];

        // 1. Search in Hand
        const cardInHand = player.hand.find(c => c.id === cardInstanceId);
        if (cardInHand) return cardInHand;

        // 2. Search in Non-hand zones with Permission Check
        const obj = RuleUtils.findObject(state, cardInstanceId);
        if (RuleUtils.isEntity(obj) && obj.controllerId === playerId) {
            let permissionType: string | undefined;
            if (obj.zone === Zone.Graveyard) permissionType = EffectType.AllowCastFromGraveyard;
            else if (obj.zone === Zone.Exile) permissionType = EffectType.AllowPlayExiled;
            else if (obj.zone === Zone.Library) permissionType = EffectType.AllowPlayFromTop;

            const { layer: LayerProcessor } = getProcessors(state);
            const stats = ('isTapped' in obj) ? LayerProcessor.getEffectiveStats(obj as GameObject, state) : { keywords: [] as string[] };
            const hasFlashback = obj.zone === Zone.Graveyard && (stats.keywords?.includes(Keyword.Flashback) || obj.definition.keywords?.includes(Keyword.Flashback));

            if (hasFlashback) {
                obj.isFlashbackCast = true;
                EngineLogger.info(state, LogCategory.ACTION, `[FLASHBACK] Casting ${obj.definition.name} via flashback.`);
                return obj as GameObject;
            }

            const hasGraveAbility = obj.zone === Zone.Graveyard && (obj.definition.abilities || []).some((a: string | AbilityDefinition) => {
                if (typeof a === 'string') return false;
                return a.type === AbilityType.Activated &&
                    ((a as ActivatedAbilityDefinition).activeZone === Zone.Graveyard);
            });

            if (hasGraveAbility) return obj as GameObject;

            if (permissionType) {
                if (bypassPermission) {
                    EngineLogger.debug(state, LogCategory.ACTION, `[RESOLVE-DEBUG] Found ${obj.definition.name} in ${obj.zone} (Bypassing permission check).`);
                    return obj as GameObject;
                }
                const hasPermission = PriorityProcessor.findPermissionEffect(state, playerId, permissionType, obj.id);
                if (hasPermission) return obj as GameObject;
                EngineLogger.debug(state, LogCategory.ACTION, `[RESOLVE-DEBUG] No ${permissionType} permission found for ${obj.definition.name} in ${obj.zone}. (bypass=${bypassPermission})`);
            } else {
                EngineLogger.debug(state, LogCategory.ACTION, `[RESOLVE-DEBUG] Found ${obj.definition.name} in ${obj.zone} but no permission type defined.`);
            }
        } else if (obj && obj.controllerId !== playerId) {
            EngineLogger.debug(state, LogCategory.ACTION, `[RESOLVE-DEBUG] Object ${cardInstanceId} found but wrong controller (controllerMatch=false).`);
        } else {
            EngineLogger.debug(state, LogCategory.ACTION, `[RESOLVE-DEBUG] Object ${cardInstanceId} not found.`);
        }

        // 3. Search for Prepared Creatures on Battlefield
        const isVirtual = cardInstanceId.startsWith(EnginePrefix.VirtualPrepared);
        const isCopy = cardInstanceId.startsWith(EnginePrefix.Copy);

        if (isVirtual || isCopy) {
            let realId = cardInstanceId;
            if (isVirtual) realId = cardInstanceId.replace(EnginePrefix.VirtualPrepared, '');
            if (isCopy) {
                const parts = cardInstanceId.split('_');
                if (parts.length >= 2) realId = parts[1];
            }

            const preparedObj = state.battlefield.find(o => o.id === realId && o.controllerId === playerId && o.isPrepared);
            if (preparedObj && (preparedObj.definition.preparedFace || preparedObj.definition.faces?.[1])) {
                const face = preparedObj.definition.preparedFace || preparedObj.definition.faces![1];
                const copyId = isCopy ? cardInstanceId : `${EnginePrefix.Copy}${preparedObj.id}_${Date.now()}`;

                if (state.dynamicCopies && state.dynamicCopies[copyId]) {
                    return state.dynamicCopies[copyId];
                }

                const copy: GameObject = {
                    ...preparedObj,
                    id: copyId,
                    definition: face,
                    zone: Zone.Exile,
                    isPreparedCopy: true,
                    sourceCreatureId: preparedObj.id,
                    effectiveStats: undefined,
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

        if (state.paradigmCopies && state.paradigmCopies[cardInstanceId]) {
            return state.paradigmCopies[cardInstanceId];
        }
        if (state.dynamicCopies && state.dynamicCopies[cardInstanceId]) {
            return state.dynamicCopies[cardInstanceId];
        }

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
