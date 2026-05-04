import {
  AbilityDefinition,
  AbilityType,
  ActionResult,
  BaseEntity,
  CounterType,
  DurationType,
  EffectType,
  GameObject,
  GameState,
  Keyword,
  PendingAction,
  PlayerId,
  StackObject,
  TriggerEvent,
  Zone
} from "@shared/engine_types";
import { Mutation, MutationType } from "@shared/types/mutations";
import { RegistryProcessor } from "../core/RegistryProcessor";
import { TriggerProcessor } from "../effects/triggers/TriggerProcessor";
import { LogCategory } from "../../utils/EngineLogger";
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from "../ProcessorRegistry";
import { oracle } from "../../OracleLogicMap";
import { LifeDamageHandler } from "../effects/handlers/life/LifeDamageHandler";


/**
 * Physical Actions Handling (Rule 400/103)
 */
export class ActionProcessor {
  /**
   * CR 400.1 / 400.7: An object that moves from one zone to another
   * becomes a new object with no memory of or relation to its previous existence.
   */
  /**
   * Generates a PendingAction and sets a mutation checkpoint for the undo system.
   */
  public static prepareAction(state: GameState, action: PendingAction): PendingAction {
    state.pendingAction = action;
    if (!state.mutationStack) state.mutationStack = [];
    if (!state.pendingAction.data) state.pendingAction.data = { label: 'Action' };
    state.pendingAction.data.mutationCheckpoint = state.mutationStack.length;
    return state.pendingAction;
  }

  /**
   * Applies a mutation to the stack for the Command-based Undo system.
   */
  public static applyMutation(state: GameState, mutation: Mutation): void {
    if (!state.mutationStack) state.mutationStack = [];
    state.mutationStack.push(mutation);
  }

  public static updateEntityCache(state: GameState, entity: string | BaseEntity, remove: boolean = false) {
    if (!state._entityMap) state._entityMap = {};
    const id = typeof entity === 'string' ? entity : entity.id;
    if (remove) {
      delete state._entityMap[id];
    } else if (typeof entity !== 'string') {
      state._entityMap[id] = entity;
    }
  }

  /**
   * Reverts game state to the last checkpoint recorded in the current pendingAction.
   */
  public static undoToLastCheckpoint(state: GameState): boolean {
    const { logger } = getProcessors(state);
    if (!state.pendingAction || !state.pendingAction.data || state.pendingAction.data.mutationCheckpoint === undefined) {
      logger.info(state, LogCategory.ACTION, "[UNDO] No valid checkpoint found.");
      return false;
    }

    if (!state.mutationStack) return false;

    const checkpoint = state.pendingAction.data.mutationCheckpoint;
    while (state.mutationStack.length > checkpoint) {
      const mutation = state.mutationStack.pop();
      if (mutation) {
        // Apply the undo payload (Implementation for each type would go here or in a dedicated un-mutator)
        // For now, this pops the stack so the engine "forgets" these actions happened
        logger.info(state, LogCategory.ACTION, `[UNDO] Reverting mutation: ${mutation.type}`);
      }
    }

    state.pendingAction = undefined;
    return true;
  }

  /**
   * moveCard: Physical transportation of objects between game zones.
   * @returns ActionResult detailing the outcome and destination.
   */
  public static moveCard(
    state: GameState,
    card: GameObject,
    to: Zone,
    targetPlayerId: PlayerId,
    libraryPosition: number | "top" | "bottom" = "top",
    isDraw: boolean = false,
    isDiscard: boolean = false,
  ): ActionResult {
    const { logger, lki: LkiProcessor, trigger: TrP } = getProcessors(state);
    const fromZone = card.zone;

    // Rule 400.3: Objects move to their OWNER'S hand/graveyard/library, not the controller's.
    const destinationPlayerId =
      to === Zone.Hand || to === Zone.Graveyard || to === Zone.Library
        ? card.ownerId
        : targetPlayerId;
    const effectiveTargetId = (targetPlayerId || card.controllerId) as PlayerId;

    if (isDiscard) {
      if (!state.turnState.lastDiscardedIds) state.turnState.lastDiscardedIds = [];
      state.turnState.lastDiscardedIds.push(card.id);
      logger.debug(state, LogCategory.ACTION, `[DISCARD-DEBUG] Added ${card.id} to lastDiscardedIds. New length: ${state.turnState.lastDiscardedIds.length}`);
    }

    // CR 701.8: To discard a card, move it from hand to graveyard.
    if (isDiscard) {
      TriggerProcessor.onEvent(
        state,
        {
          type: TriggerEvent.Discard,
          playerId: card.ownerId,
          payload: {
            object: card,
            fromZone: fromZone,
            toZone: to,
            targetIds: [card.id],
          },
        },
      );
    }

    const ReplacementProcessor = getProcessors(state).replacement;
    const replacementResult = ReplacementProcessor.handleMovementReplacement(
      state,
      card,
      to,
      { fromZone, isDraw, isDiscard, targetPlayerId: effectiveTargetId! },
    );

    if (replacementResult.actionResult) return replacementResult.actionResult;
    to = replacementResult.destination;

    // Rule 110.2: A permanent's controller is the player under whose control it entered.
    // Rule 108.4: A card's owner doesn't change, but its controller can.
    card.controllerId = effectiveTargetId!;

    // CR 603.10: "Leaves-the-battlefield" events MUST look back in time.
    // Trigger them while we still have the Battlefield state (counters, registered abilities).
    if (fromZone === Zone.Battlefield && to !== Zone.Battlefield) {
      this.handleLeavingBattlefield(state, card, to);
    }

    // 1. Rule 400.7: Remove from the current zone
    logger.info(state, LogCategory.ACTION, `[MOVE] ${card.definition.name} (${card.id}) from ${fromZone} to ${to} (isDraw: ${isDraw})...`);

    // Save LKI snapshot before object changes/wipes (Rule 608.2h)
    const processors = getProcessors(state);
    processors.lki.saveSnapshot(state, card, fromZone);

    this.removeFromCurrentZone(state, card);

    // 2. Rule 400.7: Reset characteristics and update zone
    card.zone = to;
    const isToken = RuleUtils.isToken(card);

    // Clear reveal status on ANY zone change (Rule 400.7)
    card.isRevealed = false;

    // Rule 400.7: Objects leaving the battlefield lose memory of their state
    if (to !== Zone.Battlefield) {
      this.resetObjectState(state, card, fromZone, to);
    }

    // 3. Rule 711.8: MDFC Face Handling
    if (
      (to === Zone.Battlefield || to === Zone.Stack) &&
      card.selectedFaceDefinition
    ) {
      if (!card.originalDefinition) {
        card.originalDefinition = card.definition;
      }
      card.definition = card.selectedFaceDefinition;
    }

    // 4. Rule 400.1: Add to the new zone
    this.updateEntityCache(state, card);
    logger.debug(state, LogCategory.ACTION, `[MOVE-DEBUG] Adding ${card.definition.name} to ${to} for player ${effectiveTargetId}`);
    this.addToTargetZone(
      state,
      card,
      to,
      effectiveTargetId,
      isToken,
      fromZone,
      libraryPosition,
    );

    // CR 121: Drawing a card
    if (isDraw && fromZone === Zone.Library && to === Zone.Hand) {
      state.turnState.cardsDrawnThisTurn[effectiveTargetId!] =
        (state.turnState.cardsDrawnThisTurn[effectiveTargetId!] || 0) + 1;
      state.turnState.lastCardsDrawnAmount = 1;
      TriggerProcessor.onEvent(
        state,
        { type: TriggerEvent.Draw, playerId: effectiveTargetId!, payload: { object: card, targetIds: [card.id] } },
      );

      // Jolrael support: Emit ON_SECOND_DRAW
      if (state.turnState.cardsDrawnThisTurn[effectiveTargetId] === 2) {
        TriggerProcessor.onEvent(
          state,
          {
            type: TriggerEvent.SecondDraw,
            playerId: effectiveTargetId,
            payload: { object: card, targetIds: [card.id] },
          },
        );
      }
    }

    // SOS: Owlin Historian support
    if (fromZone === Zone.Graveyard && to !== Zone.Graveyard) {
      state.turnState.cardLeftGraveyardThisTurn[card.ownerId] = true;
      TriggerProcessor.onEvent(
        state,
        {
          type: TriggerEvent.LeaveGraveyard,
          playerId: card.ownerId,
          payload: { object: card, fromZone, toZone: to, targetIds: [card.id] },
        },
      );
    }

    if (to === Zone.Exile) {
      state.turnState.cardsExiledThisTurn[card.ownerId] = true;
    }

    ActionProcessor.applyMutation(state, {
      type: MutationType.MOVE_CARD,
      sourceId: card.id,
      payload: { fromZone, toZone: to, controllerId: effectiveTargetId },
      undoPayload: { fromZone: to, toZone: fromZone, controllerId: card.controllerId },
      timestamp: Date.now()
    });

    return {
      success: true,
      affectedIds: [card.id],
      actualAmount: 1,
      metadata: { from: fromZone, to },
    };
  }

  private static handleLeavingBattlefield(
    state: GameState,
    card: GameObject,
    to: Zone,
  ) {
    const types = card.definition.types.map((t) => (t as string).toLowerCase());

    // CR 603.10: "Leaves-the-battlefield" events MUST look back in time.
    // We capture a snapshot of the card (especially counters) to support triggers like Modular, Scolding Administrator, etc.
    const snapshot = RuleUtils.createSnapshot(card);

    // Rule 603.10a: "Dies" triggers (specifically for creatures moving to graveyard)
    if (to === Zone.Graveyard && RuleUtils.isCreature(card)) {
      state.turnState.creaturesDiedThisTurn.push(snapshot);
      TriggerProcessor.onEvent(
        state,
        {
          type: TriggerEvent.Death,
          playerId: card.controllerId,
          payload: {
            object: snapshot,
            sourceId: card.id,
            targetIds: [card.id],
            toZone: to,
          },
        }
      );
    }

    // General Leave trigger
    TriggerProcessor.onEvent(
      state,
      {
        type: TriggerEvent.LeaveBattlefield,
        playerId: card.controllerId,
        payload: {
          object: snapshot,
          sourceId: card.id,
          targetIds: [card.id],
          toZone: to,
          fromZone: Zone.Battlefield,
        },
      }
    );
  }

  public static removeFromCurrentZone(state: GameState, card: { id: string, zone: Zone }) {
    if (!state) {
      console.error('[ActionProcessor] removeFromCurrentZone: state is undefined!');
      return;
    }
    RegistryProcessor.unregisterAbilities(state, card.id);
    const cid = card.id;
    this.updateEntityCache(state, cid, true);

    state.battlefield = state.battlefield.filter((c) => c.id !== cid);

    // Rule 113.7a: Abilities on the stack exist independently of their source.
    // We only remove the object from the stack if it IS the card (e.g. a Spell being countered/moved).
    state.stack = state.stack.filter((s) => {
      if (s.id === cid || s.sourceObject?.id === cid) {
        this.updateEntityCache(state, s, true);
        return false;
      }
      return true;
    });
    state.exile = state.exile.filter((c) => c.id !== cid);

    for (const pid in state.players) {
      const p = state.players[pid as PlayerId];
      p.hand = p.hand.filter((c) => c.id !== cid);
      const isFromGrave = p.graveyard.some((c) => c.id === cid);
      p.graveyard = p.graveyard.filter((c) => c.id !== cid);
      if (isFromGrave) {
        state.turnState.cardLeftGraveyardThisTurn[pid as PlayerId] = true;
      }
      p.library = p.library.filter((c) => c.id !== cid);
    }
    if (!state.limbo) state.limbo = [];
    state.limbo = state.limbo.filter((c) => c.id !== cid);
  }

  private static addToTargetZone(
    state: GameState,
    card: GameObject,
    to: Zone,
    targetPlayerId: PlayerId,
    isToken: boolean,
    from: Zone,
    libraryPosition: number | "top" | "bottom" = "top",
  ) {
    const { logger } = getProcessors(state);
    if (to === Zone.Battlefield) {
      state.battlefield.push(card);
      // Rule 110.2: Always sync controllerId when entering battlefield
      card.controllerId = targetPlayerId;

      // CR 302.6: Creature enters the battlefield with summoning sickness
      card.summoningSickness = !RuleUtils.hasKeyword(card, Keyword.Haste);

      let entersTapped = card.definition.entersTapped || false;
      if (card.definition.entersTappedCondition) {
        const ConditionProcessor = getProcessors(state).condition;
        if (
          ConditionProcessor.matchesCondition(
            state,
            card.definition.entersTappedCondition,
            {
              sourceId: card.id,
              controllerId: targetPlayerId,
              event: { xValue: card.xValue } as any,
              stackObject: card as unknown as StackObject,
            },
          )
        ) {
          entersTapped = true;
        }
      }
      if (entersTapped) {
        card.isTapped = true;
      }
      card.isPrepared = card.definition.entersPrepared || false;
      card.isRevealed = false; // Always clear when entering public zone
      RegistryProcessor.registerAbilities(state, card);

      this.handleEnteringBattlefield(state, card, from);
    } else if (to === Zone.Stack) {
      // Rule 405: The Stack
      // Note: High-level processors (SpellProcessor) handle pushing the complex StackObject.
      // We just ensure abilities are registered for the card in this zone.
      card.controllerId = targetPlayerId;
      RegistryProcessor.registerAbilities(state, card);
    } else if (to === Zone.Exile) {
      state.exile.push(card);
      card.controllerId = targetPlayerId;
      RegistryProcessor.registerAbilities(state, card);
    } else {
      const player = state.players[targetPlayerId];
      if (!player) return;

      card.controllerId = targetPlayerId;

      if (to === Zone.Hand && !isToken) player.hand.push(card);
      else if (to === Zone.Library && !isToken) {
        if (typeof libraryPosition === "number") {
          // Rule 400.1: Add at specific index from top (0-indexed)
          player.library.splice(libraryPosition, 0, card);
        } else if (libraryPosition === "bottom") {
          player.library.unshift(card);
        } else {
          player.library.push(card);
        }
      } else if (to === Zone.Graveyard) {
        player.graveyard.push(card);
        this.handleEnteringGraveyard(state, card, from);
      }

      if (to === Zone.None) {
        if (!state.limbo) state.limbo = [];
        state.limbo.push(card);
      }

      RegistryProcessor.registerAbilities(state, card);
    }
  }

  private static resetObjectState(
    state: GameState,
    card: GameObject,
    from: Zone,
    to: Zone,
  ) {
    if (from === Zone.Battlefield) {
      RegistryProcessor.unregisterAbilities(state, card.id);
      if (to === Zone.Hand) {
        state.turnState.permanentReturnedToHandThisTurn = true;
        state.turnState.playersWithPermanentReturnedThisTurn[card.ownerId] = true;
      }
    }

    // Rule 400.7: Object changes zones -> becomes a new object
    // 1. Clear floating continuous effects tied to this object
    const { logger } = getProcessors(state);
    state.ruleRegistry.continuousEffects = (state.ruleRegistry.continuousEffects || []).filter((eff) => {
      const isSource = eff.sourceId === card.id;
      const isTarget = eff.targetIds?.includes(card.id);
      const isFloating = eff.id?.startsWith("floating_");
      const dType = (eff.duration?.type || "").toString().toUpperCase();
      const isTemporary = eff.duration && dType !== DurationType.Static;

      // Rule 400.7: Object changes zones -> becomes a new object
      // If this object was explicitly targeted by a temporary effect (like Giant Growth or Last Gasp), 
      // the effect MUST be removed because the object is now "new".
      // Note: We do NOT remove effects just because their SOURCE moved (Rule 611.2a).
      if (isTarget && isTemporary) {
        return false;
      }

      // If it's a multi-target effect and this object is just one of the targets, 
      // remove this object from the target list but keep the effect for others.
      if (isTarget && eff.targetIds) {
        eff.targetIds = eff.targetIds.filter(id => id !== card.id);
      }

      // Rule 611.2a: Floating effects from OTHER sources (e.g. an anthem from a sorcery that resolved)
      // stick to the objects they found at resolution. Since this is a "new" object, 
      // it is no longer one of those objects.
      return true;
    });

    // 2. Reset dynamic engine properties
    card.isTapped = false;
    card.damageMarked = 0;
    card.deathtouchMarked = false;
    card.isAttacking = false;
    card.isBlocking = false;
    card.summoningSickness = false;
    card.isPhasedOut = false;
    card.isRevealed = false; // Rule 400.7: Clear revealed status on zone change
    card.isGoaded = false;
    card.counters = {};
    card.attachedTo = undefined;
    card.effectiveStats = undefined;
    card.modifierSnapshot = null;

    // Rule 711.4a: MDFC reverts to front face in non-battlefield/stack zones
    if (to !== Zone.Battlefield && to !== Zone.Stack) {
      if (card.originalDefinition) {
        card.definition = card.originalDefinition;
        card.originalDefinition = undefined;
      }
      if (card.selectedFaceDefinition) {
        card.selectedFaceDefinition = undefined;
      }
    }
    card.faceDown = false;

    // Rule 107.3: The value of X is preserved as long as the object is on the stack or battlefield.
    // If it moves to Hand, Graveyard, Library, or Exile, it must be reset.
    if (to !== Zone.Stack && to !== Zone.Battlefield) {
      card.xValue = undefined;
    }

    // Rule 400.7: Objects leaving the battlefield/stack lose their identity
    if (to !== Zone.Battlefield && to !== Zone.Stack) {
      delete (card as any).isFreeCast;
      delete (card as any).isSpellCasting;
    }

    // 3. Wipe calculated stats (they will be recalculated for the new zone)
    card.effectiveStats = undefined;
    card.modifierSnapshot = null;
  }

  private static handleEnteringBattlefield(
    state: GameState,
    card: GameObject,
    fromZone: Zone,
  ) {
    const { logger } = getProcessors(state);
    // Replacement-style entry counters for X costs (Rule 122.6)
    if (card.xValue && card.definition.entersWithXCounters) {
      card.counters["+1/+1"] = (card.counters["+1/+1"] || 0) + card.xValue;
      logger.info(state, LogCategory.ACTION, `[X-COST] ${card.definition.name} enters with ${card.xValue} +1/+1 counters.`);
    }

    // Generic 'Enters with counters' support (Rule 614.1c)
    const staticAbilities = (card.definition.abilities || []).filter(
      (a) => typeof a !== "string" && a.type === AbilityType.Static,
    ) as AbilityDefinition[];
    staticAbilities.forEach((a) => {
      a.effects?.forEach((e) => {
        if (
          e.type === EffectType.EntersWithCounters
        ) {
          const type = e.counterType || "P1P1";
          let amount = 0;
          if (e.amount === "CONVERGE_AMOUNT") {
            amount = card.convergeAmount || 0;
          } else if (e.amount === "THREE_MINUS_X") {
            amount = Math.max(0, 3 - (card.xValue || 0));
          } else if (e.amount === "X") {
            amount = card.xValue || 0;
          } else {
            amount = typeof e.amount === "number" ? e.amount : 0;
          }

          if (amount > 0) {
            const counterKey = type === "P1P1" ? "+1/+1" : type;
            card.counters[counterKey as CounterType] = (card.counters[counterKey as CounterType] || 0) + amount;
            logger.info(state, LogCategory.ACTION, `[ETB-COUNTERS] ${card.definition.name} enters with ${amount} ${counterKey} counters.`);
          }
        }
      });
    });

    // Rule 603.6a: Enters-the-battlefield triggers
    TriggerProcessor.onEvent(
      state,
      {
        type: TriggerEvent.EnterBattlefield,
        playerId: card.controllerId,
        payload: {
          object: card,
          sourceId: card.id,
          targetIds: [card.id],
          fromZone,
          toZone: Zone.Battlefield,
        },
      }
    );

    // Rule 306.5b: Planeswalkers enter with loyalty counters
    if (RuleUtils.isPlaneswalker(card)) {
      const def = card.definition;
      let loyaltyValue = def.loyalty;

      // Fallback to Oracle if missing
      if (loyaltyValue === undefined || loyaltyValue === null) {
        const logic = oracle.getCard(card.definition.name);
        if (logic) {
          loyaltyValue = logic.loyalty;
        }
      }

      if (!loyaltyValue && (card.definition.types as any).includes('Planeswalker')) {
        loyaltyValue = 0;
      }
      const startingLoyalty = parseInt(String(loyaltyValue || "0"), 10);
      card.counters[CounterType.Loyalty] = startingLoyalty;
      logger.info(state, LogCategory.ACTION, `[ETB] ${card.definition.name} enters with ${startingLoyalty} loyalty.`);
    }
  }

  private static handleEnteringGraveyard(
    state: GameState,
    card: GameObject,
    from: Zone,
  ) {
    this.resetObjectState(state, card, from, Zone.Graveyard);
  }

  /* --- Turn Actions (Rule 500) --- */

  /**
   * CR 502.2: The Untap Step
   * The active player untaps all permanents they control.
   */
  public static untapAll(
    state: GameState,
    playerId: PlayerId,
  ) {
    const { logger } = getProcessors(state);
    let count = 0;

    // CR 702.26a: All phased-out permanents that player controlled... phase in.
    state.battlefield.forEach((obj) => {
      if (obj.controllerId === playerId && obj.isPhasedOut) {
        obj.isPhasedOut = false;
        logger.info(state, LogCategory.ACTION, `${obj.definition.name} phased in.`);
      }
    });

    state.battlefield.forEach((obj) => {
      if (obj.controllerId === playerId) {
        // Rule 502.1: Check for restrictions that prevent untapping
        const LayerProcessor = getProcessors(state).layer;
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        if (
          RuleUtils.hasKeyword(obj, "CannotUntap") ||
          obj.cannotUntapThisTurn
        ) {
          logger.info(state, LogCategory.ACTION, `${obj.definition.name} does not untap.`);
          return;
        }

        if (
          obj.isTapped ||
          (obj.counters && obj.counters["stun"] && obj.counters["stun"] > 0)
        ) {
          if (obj.counters && obj.counters["stun"] && obj.counters["stun"] > 0) {
            obj.counters["stun"]--;
            logger.info(state, LogCategory.ACTION, `${obj.definition.name} removed a stun counter and remains tapped.`);
            return;
          }
          obj.isTapped = false;
          count++;
        }
        // CR 302.6: Summoning sickness wears off at the beginning of the controller's turn
        obj.summoningSickness = false;
      }
    });

    if (count > 0) logger.info(state, LogCategory.ACTION, `${count} permanents untapped.`);
  }

  public static winGame(state: GameState, playerId: PlayerId) {
    const { logger } = getProcessors(state);
    const player = state.players[playerId];
    if (player) {
      player.hasWon = true;
      logger.info(state, LogCategory.ACTION, `${player.name} wins the game!`);
      Object.values(state.players).forEach(p => {
        if (p.id !== playerId) {
          p.hasLost = true;
        }
      });
    }
  }

  public static shuffleLibrary(state: GameState, playerId: PlayerId) {
    const { logger } = getProcessors(state);
    const player = state.players[playerId];
    if (player) {
      this.shuffle(player.library);
      logger.info(state, LogCategory.ACTION, `${player.name} shuffles their library.`);
    }
  }

  public static shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  public static gainLife(state: GameState, playerId: PlayerId, amount: number) {
    LifeDamageHandler.handleGainLife(
      state,
      { type: EffectType.GainLife, amount } as any,
      { targets: [playerId], sourceId: "system", controllerId: playerId, effects: [] } as any
    );
  }

  public static loseLife(state: GameState, playerId: PlayerId, amount: number) {
    LifeDamageHandler.handleLoseLife(
      state,
      { type: EffectType.LoseLife, amount } as any,
      { targets: [playerId], sourceId: "system", controllerId: playerId, effects: [] } as any
    );
  }
}
