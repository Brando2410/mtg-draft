import { GameState, PlayerId, Phase, Step, Zone, AbilityType } from '@shared/engine_types';
import { ManaProcessor } from '../magic/ManaProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { SpellProcessor } from '../actions/SpellProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { ConditionProcessor } from '../core/ConditionProcessor';
import { EffectType } from '@shared/engine_types';
import { m21 } from '../../data/m21';

/**
 * Priority Handling (Rule 117)
 */
export interface PriorityCallbacks {
  log: (m: string) => void;
  getPlayerName: (id: PlayerId) => string;
  resolveTopOrAdvanceStep: () => void;
  confirmAttackers: (pId: string) => void;
  confirmBlockers: (pId: string) => void;
  checkStateBasedActions: () => void;
}

export class PriorityProcessor {

  /**
   * CR 117.4: Timing and Priority
   * Handles the passing of priority and automatic resolution of the stack.
   */
  public static passPriority(
    state: GameState, 
    playerId: PlayerId, 
    callbacks: PriorityCallbacks,
    isAuto = false
  ) {
    // 1. Intercept for special actions
    if (state.pendingAction?.playerId === playerId) {
      if (state.pendingAction.type === 'DECLARE_ATTACKERS') {
        callbacks.confirmAttackers(playerId);
        return;
      }
      if (state.pendingAction.type === 'DECLARE_BLOCKERS') {
        callbacks.confirmBlockers(playerId);
        return;
      }
    }

    if (String(state.priorityPlayerId) !== String(playerId)) {
      console.log(`[PRIORITY-PROC] passPriority IGNORED: current priority is ${state.priorityPlayerId}, but ${playerId} tried to pass.`);
      return;
    }
    
    // CR 117.1: A player must resolve pending mandatory actions before passing
    if (state.pendingAction && String(state.pendingAction.playerId) === String(playerId)) {
      console.log(`[PRIORITY-PROC] passPriority BLOCKED: ${playerId} has pending ${state.pendingAction.type}.`);
      callbacks.log(`Invalid Action: Player must resolve pending ${state.pendingAction.type} first.`);
      return;
    }

    const player = state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      if (!isAuto) callbacks.log(`${callbacks.getPlayerName(playerId)} must finish discarding first.`);
      return;
    }

    state.consecutivePasses++;
    
    const prefix = isAuto ? '[Auto-Pass] ' : '[Manual-Pass] ';
    callbacks.log(`${prefix}${callbacks.getPlayerName(playerId)} passed. (${state.consecutivePasses}/${state.playerOrder.length} passes)`);

    if (state.consecutivePasses >= state.playerOrder.length) {
      callbacks.resolveTopOrAdvanceStep();
    } else {
      this.givePriorityToNextPlayer(state, callbacks);
    }
  }

  public static givePriorityToNextPlayer(
    state: GameState, 
    callbacks: PriorityCallbacks
  ) {
    if (!state.priorityPlayerId) return;
    const currentIndex = state.playerOrder.indexOf(state.priorityPlayerId);
    const nextIndex = (currentIndex + 1) % state.playerOrder.length;
    
    callbacks.checkStateBasedActions();
    
    state.priorityPlayerId = state.playerOrder[nextIndex];
    callbacks.log(`[PRIORITY] Shifted to ${callbacks.getPlayerName(state.priorityPlayerId)}.`);
    
    this.checkAutoPass(state, state.priorityPlayerId, callbacks);
  }

  public static resetPriorityToActivePlayer(
    state: GameState, 
    callbacks: PriorityCallbacks
  ) {
    state.consecutivePasses = 0;
    callbacks.checkStateBasedActions();
    
    // Only set priority to active player if an SBA or trigger didn't just set up a mandatory action.
    if (!state.pendingAction) {
      state.priorityPlayerId = state.activePlayerId;
    }
    
    if (state.priorityPlayerId) {
       this.checkAutoPass(state, state.priorityPlayerId, callbacks);
    }
  }

  public static checkAutoPass(
    state: GameState, 
    playerId: PlayerId, 
    callbacks: PriorityCallbacks
  ) {
    if (!state.priorityPlayerId || String(state.priorityPlayerId) !== String(playerId)) return;

    const player = state.players[playerId];
    const canAct = this.canPlayerTakeAnyAction(state, playerId);

    if (player && !player.fullControl && !canAct) {
      callbacks.log(`[Auto-Pass] ${callbacks.getPlayerName(playerId)} skipped: no legal actions found.`);
      console.log(`[ENGINE] Auto-Pass triggered for ${playerId}`);
      this.passPriority(state, playerId, callbacks, true);
    } else if (player && canAct) {
      console.log(`[ENGINE] Priority held by ${playerId} (Actions available)`);
    }
  }


  /**
   * Rule 117.1: A player can take action IF: 
   * 1. It's their Main Phase + Stack is empty (Sorcery speed)
   * 2. They have an Instant/Flash card in hand (Instant speed)
   * 3. They have activated abilities or lands (Manual check for now)
   */
  public static canPlayerTakeAnyAction(state: GameState, playerId: string): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    // Rule 117.1: If player has a pending mandatory action, they MUST act.
    if (state.pendingAction && String(state.pendingAction.playerId) === String(playerId)) {
        return true; 
    }
    if (player.pendingDiscardCount > 0) return true;

    // Remove the restrictive pendingAction check that freezes priority inappropriately.
    // if (state.pendingAction) return false;

    const stackEmpty = state.stack.length === 0;

    // Auto-pass Upkeep and Draw steps if the stack is empty (Full Control will still catch them upstream)
    if (state.currentPhase === Phase.Beginning && (state.currentStep === Step.Upkeep || state.currentStep === Step.Draw) && stackEmpty) {
        return false;
    }

    // Check hand for castable spells - IGNORING priority check for engine validation
    const hasCastable = player.hand.some(card => {
        const canPlay = this.canObjectBePlayed(state, playerId, card.id, false);
        return canPlay;
    });
    if (hasCastable) return true;

    // Chapter 3 Check: Battlefield Activated Abilities - IGNORING priority check
    const hasBattlefieldAction = state.battlefield.some(obj => {
      if (obj.controllerId !== playerId) return false;
      const logic = m21[obj.definition.name];
      if (!logic || !logic.abilities) return false;

      return logic.abilities.some((_, index) => this.canAbilityBeActivated(state, playerId, obj.id, index, false));
    });

    return hasBattlefieldAction;
  }

  /**
   * Helper to check if a specific object can be played/activated.
   * Used for highlighting in the UI.
   * @param checkPriority If true, returns false if player doesn't have priority. Use false for engine availability checks.
   */
  public static canObjectBePlayed(state: GameState, playerId: string, objId: string, checkPriority = true): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    const { TargetingProcessor } = require('../actions/TargetingProcessor');

    // Check hand
    let cardToPlay = player.hand.find(o => o.id === objId);
    
    // Check top of library (Radha, Snoop, etc.)
    if (!cardToPlay && player.library.length > 0 && player.library[player.library.length - 1].id === objId) {
        const topCard = player.library[player.library.length - 1];
        const hasAllowEffect = this.findPermissionEffect(state, playerId, EffectType.AllowPlayFromTop, topCard.id);
        if (hasAllowEffect) {
            cardToPlay = topCard;
        }
    }

    // Check graveyard (Demonic Embrace, Flashback, etc.)
    if (!cardToPlay) {
        const graveCard = player.graveyard.find(c => c.id === objId);
        if (graveCard) {
            const hasAllowEffect = this.findPermissionEffect(state, playerId, EffectType.AllowCastFromGraveyard, graveCard.id);
            if (hasAllowEffect) cardToPlay = graveCard;
        }
    }

    // Check exile (Idol of Endurance, Ugin's +2, etc.)
    if (!cardToPlay) {
        const exileCard = state.exile.find(c => c.id === objId);
        if (exileCard && exileCard.controllerId === playerId) {
            const hasAllowEffect = this.findPermissionEffect(state, playerId, EffectType.AllowPlayExiled, exileCard.id);
            if (hasAllowEffect) cardToPlay = exileCard;
        }
    }

    if (cardToPlay) {
       if (state.pendingAction) return false;
       
       const hasPriority = state.priorityPlayerId === playerId;
       if (checkPriority && !hasPriority) return false;

       const typeLine = (cardToPlay.definition.type_line || '').toLowerCase();
       const isInstantOrFlash = typeLine.includes('instant') || 
                                (cardToPlay.definition.oracleText || '').includes('Flash') ||
                                (cardToPlay.definition.keywords || []).includes('Flash');
       const isLand = typeLine.includes('land');
       const stackEmpty = state.stack.length === 0;
       const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;
       const isYourTurn = state.activePlayerId === playerId;

        let canPlay = false;
        const { totalMana: effectiveCost, additionalCosts } = SpellProcessor.getEffectiveCosts(state, cardToPlay);

        if (isLand) {
            canPlay = isYourTurn && isMain && stackEmpty && !player.hasPlayedLandThisTurn;
        } else if (isInstantOrFlash) {
            canPlay = ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost);
        } else {
            canPlay = isYourTurn && isMain && stackEmpty && ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost);
        }

        // --- CHECK ADDITIONAL COSTS ---
        if (canPlay && additionalCosts.length > 0) {
            const canPayAllExtras = additionalCosts.every(cost => {
                if (cost.type === 'Sacrifice') {
                    const candidates = state.battlefield.filter(o => 
                        o.controllerId === playerId && 
                        TargetingProcessor.matchesRestrictions(state, o, cost.restrictions || [], playerId, cardToPlay!.id)
                    );
                    return candidates.length > 0;
                }
                return true;
            });
            if (!canPayAllExtras) canPlay = false;
        }

        if (canPlay) {
            const logic = m21[cardToPlay.definition.name];
            const targetDefinition = (logic as any)?.targetDefinition || logic?.abilities?.find(a => a.type === 'Spell')?.targetDefinition;
            if (targetDefinition && !targetDefinition.optional) {
                if (!TargetingProcessor.hasLegalTargets(state, cardToPlay!.id, targetDefinition, playerId)) {
                    canPlay = false;
                }
            }
        }

       return canPlay;
    }

    // Check battlefield (for activating abilities)
    const objOnField = state.battlefield.find(o => o.id === objId);
    if (objOnField && objOnField.controllerId === playerId) {
        const logic = m21[objOnField.definition.name];
        if (!logic || !logic.abilities) return false;

        return logic.abilities.some((_, index) => this.canAbilityBeActivated(state, playerId, objId, index, checkPriority));
    }

    return false;
  }

  /**
   * Centralized logic for ability activation checks.
   */
  public static canAbilityBeActivated(state: GameState, playerId: string, objId: string, abilityIndex: number, checkPriority = true): boolean {
    const player = state.players[playerId];
    const obj = state.battlefield.find(o => o.id === objId);
    if (!player || !obj) return false;

    if (state.pendingAction) return false;
    
    if (checkPriority && state.priorityPlayerId !== playerId) return false;

    const cardLogic = m21[obj.definition.name];
    let abilities = [...(cardLogic?.abilities || [])];

    // --- SUPPORT FOR GRANTED ABILITIES (Conspicuous Snoop, etc.) ---
    const gainTopEffect = state.ruleRegistry.continuousEffects.find(e => 
        e.type === EffectType.GainAbilitiesOfTopCard && 
        (e.targetIds?.includes(objId) || (e.targetMapping === 'SELF' && e.sourceId === objId)) &&
        ConditionProcessor.matchesCondition(state, e.condition, e.sourceId, e.controllerId)
    );

    if (gainTopEffect) {
        const topCard = player.library[player.library.length - 1];
        if (topCard) {
            const topLogic = m21[topCard.definition.name];
            if (topLogic?.abilities) {
                // Snoop specifically gains ONLY activated abilities.
                const granted = topLogic.abilities.filter(a => a.type === AbilityType.Activated);
                abilities = [...abilities, ...granted];
            }
        }
    }

    if (!abilities[abilityIndex]) return false;
    const ability = abilities[abilityIndex];
    if (ability.type !== AbilityType.Activated) return false;

    // Requirement Check (Rule 602.5b)
    if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) {
        console.log(`Illegal Activation: Activation requirements for ${obj.definition.name} are not met.`);
        return false;
    }

    // Skip purely mana-producing abilities for auto-pass
    if (!checkPriority && ability.isManaAbility) return false;

    // Restriction Check: Faith's Fetters / Arrest effects
    const isRestricted = state.ruleRegistry.restrictions.some(r => 
        r.targetId === objId && r.type === 'CannotActivateNonManaAbilities'
    );
    if (isRestricted && !ability.isManaAbility) {
        console.log(`Illegal Activation: ${obj.definition.name}'s non-mana abilities are restricted.`);
        return false;
    }

    // Timing Check (Rule 606.3: Planeswalkers)
    const isPlaneswalker = obj.definition.types.includes('Planeswalker');
    if (isPlaneswalker) {
       const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));
       const isSorcerySpeed = state.activePlayerId === playerId && (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain) && state.stack.length === 0;

       if (!canActivateAnyTime && !isSorcerySpeed) return false;
       if (obj.abilitiesUsedThisTurn > 0) return false;
    }

    // Cost Check
    if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) return false;

    // Requirement Check (Rule 602.5b)
    if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) return false;

    // Target Check
    if (ability.targetDefinition && !ability.targetDefinition.optional) {
        const { TargetingProcessor } = require('../actions/TargetingProcessor');
        if (!TargetingProcessor.hasLegalTargets(state, obj.id, ability.targetDefinition, playerId)) {
            return false;
        }
    }

    return true;
  }

  /**
   * Helper to find an active permission effect in the registry.
   */
  public static findPermissionEffect(state: GameState, playerId: string, effectType: string, targetId: string): any {
    const { TargetingProcessor } = require('../actions/TargetingProcessor');
    const { LayerProcessor } = require('../state/LayerProcessor');

    return state.ruleRegistry.continuousEffects.find(e => {
        // 1. Basic Type/Owner check
        const eType = e.type as string;
        const matchesType = eType === effectType || (effectType === EffectType.AllowPlayExiled && (e as any).canPlayExiled);
        if (!matchesType || e.controllerId !== playerId) return false;

        // 2. Active Zone check (Source must be in an active zone for the ability)
        const source = TargetingProcessor.findObjectInAnyZone(state, e.sourceId);
        if (!source || !e.activeZones?.includes(source.zone)) return false;

        // 3. Condition check
        if (!ConditionProcessor.matchesCondition(state, e.condition, e.sourceId, e.controllerId)) return false;

        // 4. Target check (Is this card the target of the permission?)
        if (!LayerProcessor.isTarget(state, e, targetId)) return false;

        return true;
    });
  }
}
