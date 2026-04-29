import { AbilityType, EffectType, EnginePrefix, GameObject, GameState, Keyword, Phase, PlayerId, TargetMapping, Zone } from '@shared/engine_types';
import { RestrictionValidator } from '../../core/RestrictionValidator';
import { PriorityProcessor } from '../../core/turn/PriorityProcessor';
import { CostProcessor } from '../../magic/CostProcessor';
import { ActionProcessor } from '../ActionProcessor';
import { TargetingProcessor } from '../targeting/TargetingProcessor';
import { getProcessors } from '../../ProcessorRegistry';



export class SpellValidator {

    public static resolveCardToPlay(state: GameState, playerId: PlayerId, cardInstanceId: string, log: (m: string) => void, bypassPermission = false): GameObject | null {
        const player = state.players[playerId];

        // 1. Search in Hand
        const cardInHand = player.hand.find((c: any) => c.id === cardInstanceId);
        if (cardInHand) return cardInHand;

        // 2. Search in Non-hand zones with Permission Check
        const obj = TargetingProcessor.findObjectInAnyZone(state, cardInstanceId);
        if (obj && obj.controllerId === playerId) {
            let permissionType: string | undefined;
            if (obj.zone === Zone.Graveyard) permissionType = EffectType.AllowCastFromGraveyard;
            else if (obj.zone === Zone.Exile) permissionType = EffectType.AllowPlayExiled;
            else if (obj.zone === Zone.Library) permissionType = EffectType.AllowPlayFromTop;

            const { layer: LayerProcessor } = getProcessors(state);
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            const hasFlashback = obj.zone === Zone.Graveyard && (stats.keywords?.includes(Keyword.Flashback) || obj.definition.keywords?.includes(Keyword.Flashback));

            if (hasFlashback) {
                (obj as any).isFlashbackCast = true;
                log(`[FLASHBACK] Casting ${obj.definition.name} via flashback.`);
                return obj;
            }

            const hasGraveAbility = obj.zone === Zone.Graveyard && obj.definition.abilities?.some((a: any) =>
                a.type === AbilityType.Activated &&
                (a.zone === Zone.Graveyard || a.activeZone === Zone.Graveyard)
            );

            if (hasGraveAbility) return obj;

            if (permissionType) {
                if (bypassPermission) {
                    log(`[RESOLVE-DEBUG] Found ${obj.definition.name} in ${obj.zone} (Bypassing permission check).`);
                    return obj;
                }
                const hasPermission = PriorityProcessor.findPermissionEffect(state, playerId, permissionType, obj.id);
                if (hasPermission) return obj;
                log(`[RESOLVE-DEBUG] No ${permissionType} permission found for ${obj.definition.name} in ${obj.zone}. (bypass=${bypassPermission})`);
            } else {
                log(`[RESOLVE-DEBUG] Found ${obj.definition.name} in ${obj.zone} but no permission type defined.`);
            }
        } else {
            log(`[RESOLVE-DEBUG] Object ${cardInstanceId} not found or wrong controller (objFound=${!!obj}, controllerMatch=${obj?.controllerId === playerId}).`);
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

                const copy = {
                    ...preparedObj,
                    id: copyId,
                    definition: face,
                    zone: Zone.Exile,
                    isPreparedCopy: true,
                    sourceCreatureId: preparedObj.id
                } as any;

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

    public static validateCardTiming(state: GameState, playerId: PlayerId, cardToPlay: GameObject, isInstantOrFlash: boolean, bypassPriority: boolean, log: (m: string) => void): boolean {
        if (!RestrictionValidator.canCastSpells(state, playerId, cardToPlay)) {
            log(`Illegal Action: Casting ${cardToPlay.definition.name} is currently restricted.`);
            return false;
        }

        if (!isInstantOrFlash && !bypassPriority) {
            const activeId = String(state.activePlayerId).trim();
            const callerId = String(playerId).trim();
            if (activeId !== callerId || (state.currentPhase !== Phase.PreCombatMain && state.currentPhase !== Phase.PostCombatMain) || state.stack.length > 0) {
                log(`Illegal Play: Cannot cast sorcery speed spell/land right now.`);
                return false;
            }
        }
        return true;
    }

    public static handleLandPlay(state: GameState, playerId: PlayerId, cardToPlay: GameObject, engine: any, log: (m: string) => void): boolean {
        const player = state.players[playerId];
        let maxLands = 1;
        state.ruleRegistry.continuousEffects.forEach(effect => {
            if ((effect as any).type === 'AdditionalLandPlays' && effect.targetMapping === 'CONTROLLER' && effect.controllerId === playerId) {
                maxLands += ((effect as any).amount as number) || 0;
            }
        });

        const currentLandsPlayed = state.turnState.landsPlayedThisTurn[playerId] || 0;

        if (currentLandsPlayed >= maxLands) {
            log(`Illegal Play: Already reached land play limit of ${maxLands} this turn.`);
            return false;
        }

        ActionProcessor.moveCard(state, cardToPlay, Zone.Battlefield, playerId, log);

        state.turnState.landsPlayedThisTurn[playerId] = currentLandsPlayed + 1;
        player.hasPlayedLandThisTurn = true;
        engine.checkStateBasedActions();
        return true;
    }


    public static validateAbilityActivation(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, abilityIndex: number, log: (m: string) => void): boolean {
        const activeZone = ability.activeZone || Zone.Battlefield;
        if (activeZone !== Zone.Any && activeZone !== (obj.zone as any)) {
            log(`Illegal Activation: ${obj.definition.name}'s ability cannot be activated from ${obj.zone}.`);
            return false;
        }

        if (!RestrictionValidator.canActivateAbility(state, playerId, ability, obj)) {
            log(`Illegal Activation: Ability activation is currently restricted.`);
            return false;
        }

        if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) {
            log(`Illegal Activation: Cannot pay costs for ${obj.definition.name}'s ability.`);
            return false;
        }

        if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) {
            log(`Illegal Activation: Activation requirements for ${obj.definition.name} are not met.`);
            return false;
        }

        if (ability.limitPerTurn) {
            const usedCount = state.turnState.triggeredAbilitiesUsedThisTurn[`ability_${obj.id}_${abilityIndex}`] || 0;
            if (usedCount >= ability.limitPerTurn) {
                log(`Illegal Activation: This ability has already been used ${usedCount} times this turn.`);
                return false;
            }
        }
        return true;
    }


    public static validateAbilitySpeed(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, cardLogic: any, log: (m: string) => void): boolean {
        const isPlaneswalker = obj.definition.types.includes('Planeswalker');
        const isSorceryOnly = ability.activatedOnlyAsSorcery || (ability as any).isSorcerySpeed;

        if (isPlaneswalker || isSorceryOnly) {
            const activeId = String(state.activePlayerId).trim();
            const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
            const stackEmpty = state.stack.length === 0;
            const isSorcerySpeed = String(playerId) === activeId && isMainPhase && stackEmpty;
            const canActivateAnyTime = (cardLogic?.abilities || []).some((a: any) => a.type === 'Static' && String(a.id).includes('any_turn')) ||
                state.ruleRegistry.continuousEffects.some(e =>
                    e.type === EffectType.AllowOutOfTurnActivation &&
                    (e.targetIds?.includes(obj.id) || (e.targetMapping === TargetMapping.Self && e.sourceId === obj.id))
                );

            if (!canActivateAnyTime && !isSorcerySpeed) {
                log(`Illegal Activation: This ability can only be activated at sorcery speed.`);
                return false;
            }

            if (isPlaneswalker && obj.abilitiesUsedThisTurn > 0) {
                log(`Illegal Activation: This permanent's activated abilities have already been used this turn.`);
                return false;
            }
        }
        return true;
    }
}
