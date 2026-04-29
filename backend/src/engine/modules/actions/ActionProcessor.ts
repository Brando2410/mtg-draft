import {
  AbilityDefinition,
  AbilityType,
  ActionResult,
  DurationType,
  EffectType,
  GameObject,
  GameState,
  PlayerId,
  PendingAction,
  StackObject,
  Zone,
  TriggerEvent,
  Keyword,
  CounterType
} from "@shared/engine_types";
import { Mutation, MutationType } from "@shared/types/mutations";
import { RegistryProcessor } from "../core/RegistryProcessor";
import { TriggerProcessor } from "../effects/triggers/TriggerProcessor";

import type { ReplacementProcessor as ReplacementProcessorType } from "../effects/replacements/ReplacementProcessor";
import type { LayerProcessor as LayerProcessorType } from "../state/LayerProcessor";

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

  /**
   * Reverts game state to the last checkpoint recorded in the current pendingAction.
   */
  public static undoToLastCheckpoint(state: GameState, log?: (m: string) => void): boolean {
    if (!state.pendingAction || !state.pendingAction.data || state.pendingAction.data.mutationCheckpoint === undefined) {
      if (log) log("[UNDO] No valid checkpoint found.");
      return false;
    }

    if (!state.mutationStack) return false;

    const checkpoint = state.pendingAction.data.mutationCheckpoint;
    while (state.mutationStack.length > checkpoint) {
      const mutation = state.mutationStack.pop();
      if (mutation) {
        // Apply the undo payload (Implementation for each type would go here or in a dedicated un-mutator)
        // For now, this pops the stack so the engine "forgets" these actions happened
        if (log) log(`[UNDO] Reverting mutation: ${mutation.type}`);
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
    log?: (m: string) => void,
    libraryPosition: number | "top" | "bottom" = "top",
    isDraw: boolean = false,
    isDiscard: boolean = false,
  ): ActionResult {
    const fromZone = card.zone;

    // Rule 400.3: Objects move to their OWNER'S hand/graveyard/library, not the controller's.
    const destinationPlayerId =
      to === Zone.Hand || to === Zone.Graveyard || to === Zone.Library
        ? card.ownerId
        : targetPlayerId;
    const effectiveTargetId = destinationPlayerId;

    // CR 701.8: To discard a card, move it from hand to graveyard.
    if (
      (isDiscard || (fromZone === Zone.Hand && to === Zone.Graveyard)) &&
      !isDraw
    ) {
      TriggerProcessor.onEvent(
        state,
        {
          type: TriggerEvent.Discard,
          playerId: card.ownerId,
          payload: {
            card,
            object: card,
            fromZone: Zone.Hand,
            toZone: Zone.Graveyard,
          },
        },
        log || (() => { }),
      );
      if (!state.turnState.lastDiscardedIds)
        state.turnState.lastDiscardedIds = [];
      state.turnState.lastDiscardedIds.push(card.id);
      console.log(`[DISCARD-DEBUG] Card ${card.definition.name} (${card.id}) added to lastDiscardedIds. Current count: ${state.turnState.lastDiscardedIds.length}`);
    }

    const ReplacementProcessor = require("../effects/replacements/ReplacementProcessor").ReplacementProcessor as typeof ReplacementProcessorType;
    const replacementResult = ReplacementProcessor.handleMovementReplacement(
      state,
      card,
      to,
      { fromZone, isDraw, isDiscard, targetPlayerId: effectiveTargetId },
      log || (() => { })
    );

    if (replacementResult.actionResult) return replacementResult.actionResult;
    to = replacementResult.destination;

    // Rule 110.2: A permanent's controller is the player under whose control it entered.
    // Rule 108.4: A card's owner doesn't change, but its controller can.
    card.controllerId = effectiveTargetId;

    // CR 603.10: "Leaves-the-battlefield" events MUST look back in time.
    // Trigger them while we still have the Battlefield state (counters, registered abilities).
    if (fromZone === Zone.Battlefield && to !== Zone.Battlefield) {
      this.handleLeavingBattlefield(state, card, to, log);
    }

    // 1. Rule 400.7: Remove from the current zone
    if (log)
      log(
        `[MOVE] ${card.definition.name} (${card.id}) from ${fromZone} to ${to} (isDraw: ${isDraw})...`,
      );

    // Track original zone if moving to stack (Rule 400.7 memoization)
    if (to === Zone.Stack && fromZone !== Zone.Stack) {
      card.lastNonStackZone = fromZone;
    }

    this.removeFromCurrentZone(state, card);

    // 2. Rule 400.7: Reset characteristics and update zone
    card.zone = to;
    const isToken = card.isToken || card.id.startsWith("token_");

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
    if (log)
      log(
        `[MOVE-DEBUG] Adding ${card.definition.name} to ${to} for player ${effectiveTargetId}`,
      );
    this.addToTargetZone(
      state,
      card,
      to,
      effectiveTargetId,
      isToken,
      fromZone,
      log,
      libraryPosition,
    );

    // CR 121: Drawing a card
    if (isDraw && fromZone === Zone.Library && to === Zone.Hand) {
      state.turnState.cardsDrawnThisTurn[effectiveTargetId] =
        (state.turnState.cardsDrawnThisTurn[effectiveTargetId] || 0) + 1;
      state.turnState.lastCardsDrawnAmount = 1;
      TriggerProcessor.onEvent(
        state,
        { type: TriggerEvent.Draw, playerId: effectiveTargetId, data: { card } },
        log || (() => { }),
      );

      // Jolrael support: Emit ON_SECOND_DRAW
      if (state.turnState.cardsDrawnThisTurn[effectiveTargetId] === 2) {
        TriggerProcessor.onEvent(
          state,
          {
            type: TriggerEvent.SecondDraw,
            playerId: effectiveTargetId,
            data: { card },
          },
          log || (() => { }),
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
          payload: { card, object: card, fromZone, toZone: to },
        },
        log || (() => { }),
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
    log?: (m: string) => void,
  ) {
    const types = card.definition.types.map((t) => (t as string).toLowerCase());

    // CR 603.10: "Leaves-the-battlefield" events MUST look back in time.
    // We capture a snapshot of the card (especially counters) to support triggers like Modular, Scolding Administrator, etc.
    const snapshot: GameObject = {
      ...card,
      definition: { ...card.definition },
      counters: { ...card.counters },
    };

    // Rule 603.10a: "Dies" triggers (specifically for creatures moving to graveyard)
    if (to === Zone.Graveyard && types.includes("creature")) {
      state.turnState.creaturesDiedThisTurn.push(snapshot);
      TriggerProcessor.onEvent(
        state,
        {
          type: TriggerEvent.Death,
          playerId: card.controllerId,
          payload: {
            object: snapshot,
            card: snapshot,
            sourceId: card.id,
            targetId: card.id,
            toZone: to,
          },
        },
        log || (() => { }),
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
          toZone: to,
          fromZone: Zone.Battlefield,
        },
      },
      log || (() => { }),
    );
  }

  public static removeFromCurrentZone(state: GameState, card: { id: string, zone: Zone }) {
    if (!state) {
      console.error('[ActionProcessor] removeFromCurrentZone: state is undefined!');
      return;
    }
    RegistryProcessor.unregisterAbilities(state, card.id);
    const cid = card.id;

    state.battlefield = state.battlefield.filter((c) => c.id !== cid);

    // Rule 113.7a: Abilities on the stack exist independently of their source.
    // We only remove the object from the stack if it IS the card (e.g. a Spell being countered/moved).
    state.stack = state.stack.filter((s) => s.id !== cid && s.card?.id !== cid);
    state.exile = state.exile.filter((c) => c.id !== cid);

    for (const pid in state.players) {
      const p = state.players[pid as PlayerId];
      p.hand = p.hand.filter((c) => c.id !== cid);
      const isFromGrave = p.graveyard.some((c) => c.id === cid);
      p.graveyard = p.graveyard.filter((c) => c.id !== cid);
      if (isFromGrave) {
        state.turnState.cardLeftGraveyardThisTurn[pid as PlayerId] = true;
        TriggerProcessor.onEvent(
          state,
          { type: TriggerEvent.LeaveGraveyard, targetId: cid, sourceId: cid },
          () => { },
        );
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
    log?: (m: string) => void,
    libraryPosition: number | "top" | "bottom" = "top",
  ) {
    if (to === Zone.Battlefield) {
      state.battlefield.push(card);
      // Rule 110.2: Always sync controllerId when entering battlefield
      card.controllerId = targetPlayerId;

      // CR 302.6: Creature enters the battlefield with summoning sickness
      const hasHasteInDefinition = (card.definition.keywords || []).some(
        (k) => k === Keyword.Haste,
      );
      const hasHasteOnCard = (card.keywords || []).some(
        (k) => k === Keyword.Haste,
      );
      card.summoningSickness = !hasHasteInDefinition && !hasHasteOnCard;

      let entersTapped = card.definition.entersTapped || false;
      if (card.definition.entersTappedCondition) {
        const { ConditionProcessor } = require("./../core/logic/ConditionProcessor");
        if (
          ConditionProcessor.matchesCondition(
            state,
            card.definition.entersTappedCondition,
            {
              sourceId: card.id,
              controllerId: targetPlayerId,
              event: { xValue: card.xValue } as unknown as TriggerEvent,
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

      this.handleEnteringBattlefield(state, card, from, log);
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
        this.handleEnteringGraveyard(state, card, from, log);
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
    state.ruleRegistry.continuousEffects =
      state.ruleRegistry.continuousEffects.filter((eff) => {
        // Rule 611.2a: Floating effects (UntilEndOfTurn, UntilEndOfCombat) do NOT depend on the source card staying in the zone.
        // We only clear effects that are tied to the presence of the object (Static) or reach their natural expiry.
        if (eff.sourceId === card.id) {
          const dType = (eff.duration?.type || "").toString().toUpperCase();

          const isPersistent =
            eff.id?.startsWith("floating_") ||
            dType === 'UNTILYOURNEXTTURN' ||
            dType === 'UNTILENDOFYOURNEXTTURN' ||
            dType === 'UNTIL_YOUR_NEXT_TURN' ||
            dType === 'UNTIL_END_OF_YOUR_NEXT_TURN' ||
            dType === 'UNTILENDOFTURN' ||
            dType === 'UNTILENDOFCOMBAT' ||
            dType === 'UNTIL_END_OF_TURN' ||
            dType === 'UNTIL_END_OF_COMBAT' ||
            dType === 'PERMANENT';

          if (isPersistent) {
            return true; // Keep floating/persistent effects!
          }
          // Default: Remove non-floating effects sourced from this object if it leaves the zone (e.g. STATIC)
          return false;
        }

        // Remove this object from target lists
        if (eff.targetIds && eff.targetIds.includes(card.id)) {
          eff.targetIds = eff.targetIds.filter((id) => id !== card.id);
        }
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
    card.counters = {};
    card.attachedTo = undefined;
    card.isGoaded = false;

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
    // BUT we preserve lastNonStackZone if moving TO the Battlefield from Stack
    // to allow ETB triggers to know where the spell was cast from.
    if (to !== Zone.Battlefield && to !== Zone.Stack) {
      delete card.lastNonStackZone;
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
    log?: (m: string) => void,
  ) {
    // Replacement-style entry counters for X costs (Rule 122.6)
    if (card.xValue && card.definition.entersWithXCounters) {
      card.counters["+1/+1"] = (card.counters["+1/+1"] || 0) + card.xValue;
      if (log)
        log(
          `[X-COST] ${card.definition.name} enters with ${card.xValue} +1/+1 counters.`,
        );
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
            card.counters[counterKey] =
              (card.counters[counterKey] || 0) + amount;
            if (log)
              log(
                `[ETB-COUNTERS] ${card.definition.name} enters with ${amount} ${counterKey} counters.`,
              );
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
          fromZone,
          toZone: Zone.Battlefield,
        },
      },
      log || (() => { }),
    );

    // Rule 306.5b: Planeswalkers enter with loyalty counters
    if (
      card.definition.types.some((t) => {
        return t === "Planeswalker" || t === "planeswalker";
      })
    ) {
      const def = card.definition;
      let loyaltyValue = def.loyalty;

      // Fallback to Oracle if missing
      if (loyaltyValue === undefined || loyaltyValue === null) {
        const { oracle } = require("../../OracleLogicMap");
        const logic = oracle.getCard(card.definition.name);
        if (logic) {
          loyaltyValue = logic.loyalty;
        }
      }

      const startingLoyalty = parseInt(String(loyaltyValue || "0"), 10);

      if (log) {
        log(
          `[DEBUG-LOYALTY] ${card.definition.name} - Found loyalty: ${loyaltyValue} (Source: ${def.loyalty ? "Definition" : "Oracle Fallback"})`,
        );
        log(`[DEBUG-DEF] Keys: ${Object.keys(def).join(", ")}`);
      }

      card.counters[CounterType.Loyalty] = startingLoyalty;
      if (log)
        log(
          `[ETB] ${card.definition.name} enters with ${startingLoyalty} loyalty.`,
        );
    }
  }

  private static handleEnteringGraveyard(
    state: GameState,
    card: GameObject,
    from: Zone,
    log?: (m: string) => void,
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
    log?: (m: string) => void,
  ) {
    let count = 0;

    // CR 702.26a: All phased-out permanents that player controlled... phase in.
    state.battlefield.forEach((obj) => {
      if (obj.controllerId === playerId && obj.isPhasedOut) {
        obj.isPhasedOut = false;
        if (log) log(`${obj.definition.name} phased in.`);
      }
    });

    state.battlefield.forEach((obj) => {
      if (obj.controllerId === playerId) {
        // Rule 502.1: Check for restrictions that prevent untapping
        const LayerProcessor = require("../state/LayerProcessor").LayerProcessor as typeof LayerProcessorType;
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        if (
          stats.keywords.includes("CannotUntap") ||
          obj.cannotUntapThisTurn
        ) {
          if (log) log(`${obj.definition.name} does not untap.`);
          return;
        }

        if (
          obj.isTapped ||
          (obj.counters["stun"] && obj.counters["stun"] > 0)
        ) {
          if (obj.counters["stun"] && obj.counters["stun"] > 0) {
            obj.counters["stun"]--;
            if (log)
              log(
                `${obj.definition.name} removed a stun counter and remains tapped.`,
              );
            return;
          }
          obj.isTapped = false;
          count++;
        }
        // CR 302.6: Summoning sickness wears off at the beginning of the controller's turn
        obj.summoningSickness = false;
      }
    });

    if (log && count > 0) log(`${count} permanents untapped.`);
  }

  public static winGame(state: GameState, playerId: PlayerId, log?: (m: string) => void) {
    const player = state.players[playerId];
    if (player) {
      player.hasWon = true;
      if (log) log(`${player.name} wins the game!`);
      Object.values(state.players).forEach(p => {
        if (p.id !== playerId) {
          p.hasLost = true;
        }
      });
    }
  }

  public static shuffleLibrary(state: GameState, playerId: PlayerId, log?: (m: string) => void) {
    const player = state.players[playerId];
    if (player) {
      this.shuffle(player.library);
      if (log) log(`${player.name} shuffles their library.`);
    }
  }

  public static shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
