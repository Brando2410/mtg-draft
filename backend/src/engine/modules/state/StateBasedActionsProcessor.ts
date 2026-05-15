import { ActionType, CounterType, GameObject, GameState, Zone } from "@shared/engine_types";
import { LogCategory } from "../../utils/EngineLogger";
import { getProcessors } from "../ProcessorRegistry";
import { ActionProcessor } from "../actions/ActionProcessor";
import { TargetingProcessor } from "../actions/targeting/TargetingProcessor";
import { RuleUtils } from "../../utils/RuleUtils";
import { LayerProcessor } from "../state/LayerProcessor";

/**
 * Rules Engine Module: State-Based Actions (Rule 704)
 * SBAs are game processes that happen whenever a player would receive priority.
 */
export class StateBasedActionsProcessor {
  /**
   * CR 704.3: Whenever a player would receive priority, the game checks for
   * any of the listed conditions for state-based actions.
   */
  public static resolveSBAs(
    state: GameState,
  ): boolean {
    let globalActionTaken = false;

    // Rule 704.3: If any SBAs are performed, the process is repeated until none are performed.
    while (this.performSBACHybridCycle(state)) {
      globalActionTaken = true;
    }

    return globalActionTaken;
  }

  private static performSBACHybridCycle(
    state: GameState,
  ): boolean {
    const { logger } = getProcessors(state);
    let actionTaken = false;

    // 1. RULE 704.5a: Player loses if Life <= 0
    for (const p of Object.values(state.players)) {
      if ((p.life <= 0 || p.hasLostDueToEmptyLibrary) && !p.hasLost) {
        logger.info(state, LogCategory.ACTION, 
          `[SBA] ${p.name} loses the game (Life: ${p.life}, EmptyLibrary: ${p.hasLostDueToEmptyLibrary}).`,
        );
        p.hasLost = true;
        actionTaken = true;
      }
    }

    // 2. Creature & Planeswalker checks (Rule 704.5f-i)
    const objects = [...state.battlefield];
    for (const obj of objects) {
      const stats = LayerProcessor.getEffectiveStats(obj, state);
      
      // 2. Creature checks (Rule 704.5f-g)
      if (RuleUtils.isCreature(obj)) {

        // Rule 704.5f: 0 Toughness (ignores indestructible)
        if (stats.toughness <= 0) {
          logger.info(state, LogCategory.ACTION, `[SBA] ${obj.definition.name} has 0 toughness and dies.`);
          ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId);
          actionTaken = true;
          continue;
        }

        // Rule 704.5g: Lethal Damage
        const isLethal = obj.damageMarked >= stats.toughness || obj.deathtouchMarked;
        if (isLethal) {
          if (!RuleUtils.hasIndestructible(obj)) {
            logger.info(state, LogCategory.ACTION, `[SBA] ${obj.definition.name} destroyed by lethal damage.`);
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId);
            actionTaken = true;
            continue;
          }
        }
      }

      // Rule 704.5i: Planeswalker Loyalty
      if (RuleUtils.isPlaneswalker(obj)) {
        const loyalty = obj.counters["loyalty"] || 0;
        if (loyalty <= 0) {
          logger.info(state, LogCategory.ACTION, 
            `[SBA] ${obj.definition.name} has 0 loyalty and is put into graveyard.`,
          );
          ActionProcessor.moveCard(
            state,
            obj,
            Zone.Graveyard,
            obj.ownerId,
          );
          actionTaken = true;
          continue;
        }
      }
    }

    // Rule 704.5j: Legend Rule
    // "If a player controls two or more legendary permanents with the same name..."
    const legendaryPermanents = state.battlefield.filter((o) => RuleUtils.hasSupertype(o, "legendary"));
    const groups: Record<string, GameObject[]> = {};

    for (const legend of legendaryPermanents) {
      const key = `${legend.controllerId}_${legend.definition.name.toLowerCase()}`;
      if (!groups[key]) {
        groups[key] = [legend];
      } else {
        groups[key].push(legend);
      }
    }

    for (const key in groups) {
      if (groups[key].length > 1) {
        const controllerId = groups[key][0].controllerId;
        const name = groups[key][0].definition.name;

        // If we don't have a pending action already, create one
        if (!state.pendingAction) {
          logger.info(state, LogCategory.ACTION, `[SBA] Legend Rule: ${name} clash. Choose one to keep.`);
          ActionProcessor.prepareAction(state, {
            type: ActionType.LegendRule,
            playerId: controllerId,
            sourceId: "system",
            data: {
              label: `Legend Rule: Choose which ${name} to KEEP`,
              choices: groups[key].map((obj, idx) => ({
                label: obj.definition.name,
                value: obj.id,
                selectable: true,
                cardData: obj
              })),
              involvedIds: groups[key].map(o => o.id),
              isContextual: true
            }
          });
          return true; // Action taken, need to resolve choice first
        }
      }
    }

    // 4. Rule 704.5d: Token in a non-battlefield zone
    // "A token in a zone other than the battlefield ceases to exist."
    const nonBattlefieldZones = [
      Zone.Graveyard,
      Zone.Exile,
      Zone.Hand,
      Zone.Library,
    ];

    // Global zones
    const exileTokens = state.exile.filter((o) => o.isToken || o.id.startsWith("token_"));
    if (exileTokens.length > 0) {
      exileTokens.forEach((t) =>
        logger.info(state, LogCategory.ACTION, `[SBA] Token ${t.definition.name} ceased to exist in Exile.`),
      );
      state.exile = state.exile.filter((o) => !(o.isToken || o.id.startsWith("token_")));
      actionTaken = true;
    }

    // Player zones
    for (const zoneName of nonBattlefieldZones) {
      if (zoneName === Zone.Exile) continue; // Handled above

      Object.values(state.players).forEach((player) => {
        let list: GameObject[] = [];
        if (zoneName === Zone.Graveyard) list = player.graveyard;
        else if (zoneName === Zone.Hand) list = player.hand;
        else if (zoneName === Zone.Library) list = player.library;

        if (list.length > 0) {
          const tokens = list.filter((o) => o.isToken || o.id.startsWith("token_"));
          if (tokens.length > 0) {
            tokens.forEach((t) =>
              logger.info(state, LogCategory.ACTION, 
                `[SBA] Token ${t.definition.name} ceased to exist in ${zoneName}.`,
              ),
            );
            if (zoneName === Zone.Graveyard)
              player.graveyard = player.graveyard.filter(
                (o) => !(o.isToken || o.id.startsWith("token_")),
              );
            if (zoneName === Zone.Hand)
              player.hand = player.hand.filter((o) => !(o.isToken || o.id.startsWith("token_")));
            if (zoneName === Zone.Library)
              player.library = player.library.filter(
                (o) => !(o.isToken || o.id.startsWith("token_")),
              );
            actionTaken = true;
          }
        }
      });
    }

    // 5. Rule 704.5r: Counter Cancellation (+1/+1 and -1/-1)
    for (const obj of state.battlefield) {
      const plus = obj.counters[CounterType.P1P1 as CounterType] || 0;
      const minus = obj.counters[CounterType.M1M1 as CounterType] || 0;
      if (plus > 0 && minus > 0) {
        const amount = Math.min(plus, minus);
        obj.counters[CounterType.P1P1 as CounterType] = plus - amount;
        obj.counters[CounterType.M1M1 as CounterType] = minus - amount;
        logger.info(state, LogCategory.ACTION, 
          `[SBA] ${obj.definition.name}: ${amount} +1/+1 and -1/-1 counters cancelled each other out.`,
        );
        actionTaken = true;
      }
    }

    // 6. Rule 704.5q: Sagas
    const sagas = state.battlefield.filter((o) => RuleUtils.hasSubtype(o, "Saga"));
    for (const saga of sagas) {
      const lore = saga.counters["lore"] || 0;
      // We assume CardDefinition has a standard structure for sagas or we check oracle
      const chapters = (saga.definition as any).chapters || []; 
      if (lore >= chapters.length && chapters.length > 0) {
        // CR 704.5q: Sacrifice if it's not the source of a triggered ability on the stack.
        const isOnStack = state.stack.some((s) => s.sourceId === saga.id);
        if (!isOnStack) {
          logger.info(state, LogCategory.ACTION, 
            `[SBA] Saga ${saga.definition.name} reached final chapter and is sacrificed.`,
          );
          ActionProcessor.moveCard(
            state,
            saga,
            Zone.Graveyard,
            saga.ownerId,
          );
          actionTaken = true;
        }
      }
    }

    // 7. Rule 704.5n & 704.5p: Aura/Equipment detachment (Protection "E" in DEBT)
    const attachments = state.battlefield.filter((o) => RuleUtils.hasSubtype(o, "aura") || RuleUtils.hasSubtype(o, "equipment"));

    for (const attach of attachments) {
      const targetId = attach.attachedTo;
      const isAura = RuleUtils.hasSubtype(attach, "aura");

      if (!targetId) {
        if (isAura) {
          logger.info(state, LogCategory.ACTION, 
            `[SBA] Aura ${attach.definition.name} is not attached to anything and is put into graveyard.`,
          );
          ActionProcessor.moveCard(
            state,
            attach,
            Zone.Graveyard,
            attach.ownerId,
          );
          actionTaken = true;
        }
        continue;
      }

      // Check if the target is still legal
      const targetDefinitions = attach.definition.auraRestrictions || attach.definition.targetDefinitions || [{
        type: 'creature',
      }];
      if (
        !TargetingProcessor.isLegalTarget(
          state,
          {
            sourceId: attach.id,
            controllerId: attach.controllerId,
            targetDefinitions,
            effects: [],
            targets: []
          },
          targetId,
        )
      ) {
        if (isAura) {
          logger.info(state, LogCategory.ACTION, 
            `[SBA] Aura ${attach.definition.name} is attached to an illegal target and is put into graveyard.`,
          );
          ActionProcessor.moveCard(
            state,
            attach,
            Zone.Graveyard,
            attach.ownerId,
          );
          actionTaken = true;
        } else {
          logger.info(state, LogCategory.ACTION, 
            `[SBA] Equipment ${attach.definition.name} detached from illegal target.`,
          );
          attach.attachedTo = undefined;
          actionTaken = true;
        }
      }
    }

    return actionTaken;
  }
}
