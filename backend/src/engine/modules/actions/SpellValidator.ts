import { ActionType, AbilityCost, GameObject, GameState, PlayerId, Zone, EffectType, TargetMapping, AbilityType, Phase, CostType } from '@shared/engine_types';
import { PriorityProcessor } from '../core/PriorityProcessor';
import { TargetingProcessor } from './TargetingProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { oracle } from '../../OracleLogicMap';
import { RestrictionProcessor } from './RestrictionProcessor';
import { ChoiceGenerator } from '../effects/ChoiceGenerator';
import { ActionProcessor } from './ActionProcessor';
import { TriggerProcessor } from '../effects/TriggerProcessor';
import { ConditionProcessor } from '../core/ConditionProcessor';
import { EffectProcessor } from '../effects/EffectProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';

/**
 * SpellValidator - Pure rules validation for spell casting and ability activation.
 *
 * Responsibilities:
 *   - Resolving which card object is being played (hand, graveyard, exile, library).
 *   - Evaluating timing restrictions (sorcery speed, priority checks).
 *   - Validating ability activation prerequisites (zone, costs, limits, speed).
 *   - Processing land plays as a special action (Rule 305).
 *
 * Design: Every method is a pure static function that reads GameState and returns
 * a boolean pass/fail or a resolved object. No side-effects on pendingAction or UI.
 */
export class SpellValidator {
    /**
     * Resolves the actual GameObject to play from a client-provided card instance ID.
     *
     * Search priority (CR 400.1):
     *   1. Player's hand (most common case).
     *   2. Non-hand zones (graveyard, exile, library) with permission check via
     *      continuous effects (AllowCastFromGraveyard, AllowPlayExiled, AllowPlayFromTop).
     *   3. Flashback keyword override (Rule 702.34) bypasses permission checks.
     *   4. Prepared creatures on the battlefield (SOS mechanic, virtual face casting).
     *   5. Paradigm virtual copies (special engine construct).
     *
     * @returns The resolved GameObject, or null if the card cannot be found/played.
     */
    public static resolveCardToPlay(state: GameState, playerId: PlayerId, cardInstanceId: string, log: (m: string) => void, bypassPermission = false): GameObject | null {
        const player = state.players[playerId];
        const { PriorityProcessor } = require('./../core/PriorityProcessor');
        const { TargetingProcessor } = require('./TargetingProcessor');

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

            const { LayerProcessor } = require('./../state/LayerProcessor');
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            const hasFlashback = obj.zone === Zone.Graveyard && (stats.keywords?.includes('Flashback') || obj.definition.keywords?.includes('Flashback'));

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
                if (bypassPermission) return obj;
                const hasPermission = PriorityProcessor.findPermissionEffect(state, playerId, permissionType, obj.id);
                if (hasPermission) return obj;
                log(`[DEBUG] No ${permissionType} permission found for ${obj.definition.name} in ${obj.zone}.`);
            }
        }

        // 3. Search for Prepared Creatures on Battlefield
        const isVirtual = cardInstanceId.startsWith('virtual_prepared_');
        const isCopy = cardInstanceId.startsWith('copy_');

        if (isVirtual || isCopy) {
            let realId = cardInstanceId;
            if (isVirtual) realId = cardInstanceId.replace('virtual_prepared_', '');
            if (isCopy) {
                const parts = cardInstanceId.split('_');
                if (parts.length >= 2) realId = parts[1];
            }

            const preparedObj = state.battlefield.find(o => o.id === realId && o.controllerId === playerId && o.isPrepared);
            if (preparedObj && (preparedObj.definition.preparedFace || preparedObj.definition.faces?.[1])) {
                const face = preparedObj.definition.preparedFace || preparedObj.definition.faces![1];
                return {
                    ...preparedObj,
                    id: isCopy ? cardInstanceId : `copy_${preparedObj.id}_${Date.now()}`,
                    definition: face,
                    zone: Zone.Battlefield,
                    isPreparedCopy: true,
                    sourceCreatureId: preparedObj.id
                } as any;
            }
        }

        // 4. Search for Paradigm Virtual Copies
        if ((state as any).paradigmCopies && (state as any).paradigmCopies[cardInstanceId]) {
            return (state as any).paradigmCopies[cardInstanceId];
        }

        return null;
    }

    /**
     * Validates whether the current game state allows this card to be cast.
     *
     * Checks two layers:
     *   1. RestrictionProcessor.isCastAllowed (Rule 101.2 - "Cannot" wins).
     *   2. Sorcery-speed timing: active player, main phase, empty stack (Rules 305/307).
     *
     * Instant-speed spells and Flash bypass the timing check entirely.
     *
     * @returns true if the cast is legal at this moment, false otherwise.
     */
    public static validateCardTiming(state: GameState, playerId: PlayerId, cardToPlay: GameObject, isInstantOrFlash: boolean, bypassTargeting: boolean, log: (m: string) => void): boolean {
        const { RestrictionProcessor } = require('./RestrictionProcessor');

        // Rule 101.2: "Cannot" wins
        if (!RestrictionProcessor.isCastAllowed(state, playerId, cardToPlay)) {
            log(`Illegal Action: Casting ${cardToPlay.definition.name} is currently restricted.`);
            return false;
        }

        // Rule 305/307: Timing
        if (!isInstantOrFlash && !bypassTargeting) {
            const activeId = String(state.activePlayerId).trim();
            const callerId = String(playerId).trim();
            if (activeId !== callerId || (state.currentPhase !== Phase.PreCombatMain && state.currentPhase !== Phase.PostCombatMain) || state.stack.length > 0) {
                log(`Illegal Play: Cannot cast sorcery speed spell/land right now.`);
                return false;
            }
        }
        return true;
    }

    /**
     * Processes a land play as a Special Action (Rule 305).
     *
     * Lands are NOT spells - they bypass the stack entirely. This method:
     *   1. Calculates the maximum land plays per turn (default 1, modified by
     *      AdditionalLandPlays continuous effects like Azusa).
     *   2. Checks if the player has remaining land drops.
     *   3. Moves the card directly to the battlefield.
     *   4. Triggers state-based actions after the land enters.
     *
     * @returns true if the land was successfully played, false if the limit was reached.
     */
    public static handleLandPlay(state: GameState, playerId: PlayerId, cardToPlay: GameObject, engine: any, log: (m: string) => void): boolean {
        const player = state.players[playerId];
        let maxLands = 1;
        // Support for cards like Azusa that add additional land plays
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

        // Rule 305: Playing a land is a special action, not a spell.
        const { ActionProcessor } = require('./ActionProcessor');
        ActionProcessor.moveCard(state, cardToPlay, Zone.Battlefield, playerId, log);

        state.turnState.landsPlayedThisTurn[playerId] = currentLandsPlayed + 1;
        player.hasPlayedLandThisTurn = true;
        log(`Played Land: ${cardToPlay.definition.name} (${currentLandsPlayed + 1}/${maxLands})`);
        engine.checkStateBasedActions();
        return true;
    }

    /**
     * Validates the prerequisites for activating an ability (Rule 602.2).
     *
     * Checks:
     *   - Zone legality: the object must be in the ability's activeZone (default: Battlefield).
     *   - Cost payability: CostProcessor.canPay verifies mana, tap, sacrifice costs.
     *   - Trigger conditions: function-based activation requirements (e.g., "only if you control 3+ creatures").
     *   - Per-turn limits: tracked via turnState.triggeredAbilitiesUsedThisTurn.
     *
     * @returns true if all activation prerequisites are met.
     */
    public static validateAbilityActivation(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, abilityIndex: number, log: (m: string) => void): boolean {
        const { Zone } = require('@shared/engine_types');
        const activeZone = ability.activeZone || Zone.Battlefield;
        if (activeZone !== Zone.Any && activeZone !== (obj.zone as any)) {
            log(`Illegal Activation: ${obj.definition.name}'s ability cannot be activated from ${obj.zone}.`);
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

    /**
     * Checks sorcery-speed restrictions for Planeswalker loyalties and abilities
     * marked with activatedOnlyAsSorcery / isSorcerySpeed (Rule 606.3).
     *
     * Planeswalker loyalty abilities are limited to once per turn and require
     * sorcery-speed timing unless an AllowOutOfTurnActivation continuous effect
     * is active (e.g., Teferi, Master of Time).
     *
     * @returns true if the ability can be activated at the current speed.
     */
    public static validateAbilitySpeed(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, cardLogic: any, log: (m: string) => void): boolean {
        const { Phase, EffectType, TargetMapping } = require('@shared/engine_types');
        const isPlaneswalker = obj.definition.types.includes('Planeswalker');
        const isSorceryOnly = ability.activatedOnlyAsSorcery || (ability as any).isSorcerySpeed;

        if (isPlaneswalker || isSorceryOnly) {
            const activeId = String(state.activePlayerId).trim();
            const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
            const stackEmpty = state.stack.length === 0;
            const isSorcerySpeed = String(playerId) === activeId && isMainPhase && stackEmpty;
            const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && String(a.id).includes('any_turn')) ||
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
