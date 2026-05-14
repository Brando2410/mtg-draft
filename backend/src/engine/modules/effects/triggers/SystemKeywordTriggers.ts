import {
  AbilityType,
  ConditionType,
  CostType,
  DurationType,
  EffectType,
  GameEvent,
  GameState,
  Restriction,
  TargetMapping,
  TriggeredAbility,
  TriggeredAbilityDefinition,
  TriggerEvent,
  Zone,
  CounterType
} from "@shared/engine_types";
import { LogCategory } from "../../../utils/EngineLogger";
import { RuleUtils } from "../../../utils/RuleUtils";
import { oracle } from "../../../OracleLogicMap";
import { getProcessors } from "../../ProcessorRegistry";
import { LayerProcessor } from "../../state/LayerProcessor";

/**
 * Triggered Abilities Module: System Keywords
 * Handles hardcoded logic for keywords like Ward, Cascade, Storm, etc.
 */
export class SystemKeywordTriggers {
  public static processSystemKeywords(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    this.processProwess(state, event, matchingTriggers);
    this.processIncrement(state, event, matchingTriggers);
    this.processWard(state, event, matchingTriggers);
    this.processCascadeAndStorm(state, event, matchingTriggers);
    this.processRepartee(state, event, matchingTriggers);
    this.processParadigm(state, event, matchingTriggers);
    this.processLandfall(state, event, matchingTriggers);
    this.processOpus(state, event, matchingTriggers);
    this.processMiracle(state, event, matchingTriggers);
  }

  private static processProwess(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastNonCreature && event.playerId) {
      const { layer: LayerProcessor } = getProcessors(state);
      state.battlefield.forEach((obj) => {
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        if (
          RuleUtils.hasKeyword(obj, "Prowess") &&
          RuleUtils.getController(obj) === event.playerId
        ) {
          matchingTriggers.push({
            id: `prowess_system_${obj.id}_${Date.now()}`,
            sourceId: obj.id,
            controllerId: RuleUtils.getController(obj),
            eventMatch: TriggerEvent.CastNonCreature,
            effects: [
              {
                type: EffectType.ApplyContinuousEffect,
                duration: {
                  type: DurationType.UntilEndOfTurn,
                },
                powerModifier: 1,
                toughnessModifier: 1,
                layer: 7,
                targetMapping: TargetMapping.Self,
              },
            ],
            targets: [],
          });
        }
      });
    }
  }

  private static processIncrement(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastSpell && event.playerId) {
      const { layer: LayerProcessor, condition: ConditionProcessor } = getProcessors(state);
      state.battlefield.forEach((obj) => {
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        if (
          RuleUtils.hasKeyword(obj, "Increment") &&
          RuleUtils.getController(obj) === event.playerId
        ) {
          if (
            ConditionProcessor.matchesCondition(
              state,
              "SPENT_MANA_GT_POWER_OR_TOUGHNESS",
              {
                sourceId: obj.id,
                controllerId: RuleUtils.getController(obj),
                event,
                effects: [],
                targets: []
              },
            )
          ) {
            matchingTriggers.push({
              id: `increment_system_${obj.id}_${Date.now()}`,
              sourceId: obj.id,
              controllerId: RuleUtils.getController(obj),
              eventMatch: TriggerEvent.CastSpell,
              condition: "SPENT_MANA_GT_POWER_OR_TOUGHNESS",
              effects: [
                {
                  type: EffectType.AddCounters,
                  amount: 1,
                  counterType: CounterType.P1P1,
                  targetMapping: TargetMapping.Self,
                },
              ],
              targets: [],
            });
          }
        }
      });
    }
  }

  private static processWard(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const { logger } = getProcessors(state);
    const targetId = RuleUtils.getTargets(event)[0];
    if (event.type === TriggerEvent.BecomeTarget && targetId) {
      const { layer: LayerProcessor } = getProcessors(state);
      const targetObj = state.battlefield.find((o) => o.id === targetId);
      if (targetObj) {
        const stats = LayerProcessor.getEffectiveStats(targetObj, state);
        const wards = stats.keywords.filter((k: string) =>
          k.toLowerCase().startsWith("ward"),
        );
        const sourceControllerId = event.playerId;
        if (
          sourceControllerId &&
          sourceControllerId !== RuleUtils.getController(targetObj)
        ) {
          wards.forEach((wardStr: string) => {
            const match = wardStr.match(
              /Ward(?:\s+|—\s*|:\s*)(?:Pay\s+)?(.+)/i,
            );
            if (!match) return;
            const costStr = match[1].trim();
            const choiceCosts: any[] = [];
            let labelStr = costStr;

            if (costStr.toLowerCase().includes("life")) {
              const amount = parseInt(costStr.replace(/\D/g, "")) || 0;
              choiceCosts.push({ type: CostType.PayLife, value: String(amount) });
              labelStr = `Pay ${amount} life`;
            } else if (costStr.toLowerCase().includes("discard")) {
              const amount = parseInt(costStr.replace(/\D/g, "")) || 1;
              choiceCosts.push({ type: CostType.Discard, amount: amount });
              labelStr = `Discard ${amount} card${amount > 1 ? "s" : ""}`;
            } else if (costStr.includes("{") || !isNaN(parseInt(costStr))) {
              const manaVal = costStr.startsWith("{")
                ? costStr
                : `{${costStr}}`;
              choiceCosts.push({ type: CostType.Mana, value: manaVal });
              labelStr = `Pay ${manaVal}`;
            }

            logger.debug(state, LogCategory.TRIGGER, `[WARD] Ward triggering for ${targetObj.definition.name}. Cost: ${labelStr}`);
            matchingTriggers.push({
              id: `ward_gen_${targetObj.id}_${Date.now()}`,
              sourceId: targetObj.id,
              controllerId: targetObj.controllerId,
              eventMatch: TriggerEvent.BecomeTarget,
              activeZone: Zone.Battlefield,
              effects: [
                {
                  type: EffectType.Choice,
                  label: `Ward Trigger: ${labelStr} or spell/ability will be countered.`,
                  targetMapping: "EVENT_PLAYER",
                  choices: [
                    { label: labelStr, costs: choiceCosts, effects: [] },
                    {
                      label: "Don't Pay (Counter)",
                      effects: [
                        {
                          type: EffectType.CounterSpellOrAbility,
                          targetMapping: TargetMapping.TriggerEventSource,
                        },
                      ],
                    },
                  ],
                },
              ],
              targets: [],
            });
          });
        }
      }
    }
  }

  private static processCascadeAndStorm(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const card = event.payload?.object;
    if (event.type === TriggerEvent.CastSpell && card) {
      if (!RuleUtils.isGameObject(card)) return;
      const stats = LayerProcessor.getEffectiveStats(card, state);
      const { keywords } = stats;

      // Cascade
      const cascadeInstances = keywords.filter(
        (k: string) => k.toLowerCase() === "cascade",
      );
      cascadeInstances.forEach((_: any, i: number) => {
        matchingTriggers.push({
          id: `cascade_system_${card.id}_${Date.now()}_${i}`,
          sourceId: card.id,
          controllerId: event.playerId!,
          eventMatch: TriggerEvent.CastSpell,
          activeZone: Zone.Stack,
          effects: [
            {
              type: EffectType.RevealUntilCondition,
              restrictions: [
                Restriction.NonLand,
                Restriction.ManaValueLessThanSource,
              ],
              zone: Zone.Exile,
              remainderZone: Zone.Library,
              remainderPosition: "bottom",
              shuffleRemainder: true,
              isSpellCasting: true,
              isFreeCast: true,
              next: {
                type: EffectType.Choice,
                label: "Cast the revealed card?",
                choices: [
                  {
                    label: "Yes",
                    effects: [
                      {
                        type: EffectType.CastSpell,
                        targetMapping: TargetMapping.Target1,
                        isFreeCast: true,
                      },
                    ],
                  },
                  {
                    label: "No",
                    effects: [
                      {
                        type: EffectType.MoveToZone,
                        zone: Zone.Library,
                        position: "bottom",
                        targetMapping: TargetMapping.Target1,
                      },
                    ],
                  },
                ],
              },
            },
          ],
          targets: [],
        });
      });

      // Storm
      if (keywords.some((k: string) => k.toLowerCase() === "storm")) {
        const totalSpells = Object.values(
          state.turnState.spellsCastThisTurn,
        ).reduce((a, b) => a + (b as number), 0);
        const stormCount = totalSpells - 1;
        if (stormCount > 0) {
          for (let i = 0; i < stormCount; i++) {
            matchingTriggers.push({
              id: `storm_copy_${card.id}_${i}_${Date.now()}`,
              sourceId: card.id,
              controllerId: event.playerId!,
              eventMatch: TriggerEvent.CastSpell,
              activeZone: Zone.Stack,
              effects: [
                {
                  type: EffectType.CopySpellOnStack,
                  targetMapping: TargetMapping.TriggerEventSource,
                  chooseNewTargets: true,
                },
              ],
              targets: [],
            });
          }
        }
      }
    }
  }

  private static processParadigm(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const card = event.payload?.object;

    if (!RuleUtils.isGameObject(card)) return;
    const stats = LayerProcessor.getEffectiveStats(card, state);
    const { keywords } = stats;
    const hasParadigm = keywords.some((k: string) => k.toLowerCase() === "paradigm");

    if (!hasParadigm) return;

    if (event.type === TriggerEvent.CastSpell) {
      // 1. Ensure the spell exiles on resolution
      const stackObj = state.stack.find((s) => s.sourceId === card.id);
      if (stackObj) {
        stackObj.exileOnResolution = true;
      }
    } else if (event.type === TriggerEvent.ResolveSpell) {
      // 2. Register recurring trigger if it's the first time
      const spellName = card.definition.name;
      const playerId = event.playerId!;

      const existingTriggerId = `paradigm_${playerId}_${spellName}`;
      const alreadyRegistered = state.ruleRegistry.triggeredAbilities.some(
        (t) => t.id === existingTriggerId,
      );
      if (!alreadyRegistered) {
        state.ruleRegistry.triggeredAbilities.push({
          type: AbilityType.Triggered,
          eventMatch: TriggerEvent.PreCombatMainPhaseStart,
          condition: ConditionType.IsYourTurn,
          id: existingTriggerId,
          sourceId: card.id,
          controllerId: playerId,
          isGlobal: true, // Paradigm persists regardless of the card's zone
          effects: [
            {
              type: EffectType.Choice,
              label: `Paradigm: Cast ${spellName}?`,
              choices: [
                {
                  label: `Cast copy of ${spellName}`,
                  effects: [
                    {
                      type: EffectType.CastSpell,
                      isFreeCast: true,
                      isParadigmCopy: true,
                      value: spellName,
                    },
                  ],
                },
                { label: "Decline", effects: [] },
              ],
            },
          ],
          payload: { definition: card.definition },
          targets: [],
        });
      }
    }
  }

  private static processRepartee(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastInstantOrSorcery && event.playerId) {
      const processors = getProcessors(state);
      const castSourceId = RuleUtils.getSource(event);
      if (!castSourceId) return;
      const stackObj = processors.lki.getLki(state, castSourceId, Zone.Stack) || state.stack.find(s => s.id === castSourceId);
      const targets = RuleUtils.isStackObject(stackObj) ? stackObj.targets : (event.payload?.targetIds || []);

      if (
        targets.length > 0 &&
        targets.some((tid: string) => {
          const obj = RuleUtils.findObject(state, tid);
          return obj && RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield && RuleUtils.isCreature(obj);
        })
      ) {
        state.battlefield.forEach((obj) => {
          if (
            obj.controllerId === event.playerId &&
            obj.definition.keywords?.includes("Repartee")
          ) {
            const reparteeAbility = (obj.definition.abilities || [])
              .find((a: any): a is TriggeredAbilityDefinition =>
                typeof a !== "string" && (a.eventMatch === TriggerEvent.Repartee || a.name === "Repartee" || String(a.id || "").includes("repartee"))
              );

            if (reparteeAbility) {
              matchingTriggers.push({
                ...reparteeAbility,
                id: `repartee_gen_${obj.id}_${Date.now()}`,
                sourceId: obj.id,
                controllerId: obj.controllerId,
                targetIds: targets,
                abilityIndex: (obj.definition.abilities || []).findIndex(a => a === reparteeAbility),
                targets: []
              });
            }
          }
        });
      }
    }
  }

  private static processLandfall(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const obj = RuleUtils.getEventObject(event, state);
    if (
      event.type === TriggerEvent.EnterBattlefield &&
      obj && RuleUtils.isType(obj, "land")
    ) {
      state.battlefield.forEach((p) => {
        if (p.controllerId === obj.controllerId) {
          const landfallAbility = (p.definition.abilities || [])
            .find((a: any): a is TriggeredAbilityDefinition =>
              typeof a !== "string" && (a.eventMatch === TriggerEvent.Landfall || a.name === "Landfall")
            );
          if (landfallAbility) {
            matchingTriggers.push({
              ...landfallAbility,
              id: `landfall_${p.id}_${Date.now()}`,
              sourceId: p.id,
              controllerId: p.controllerId,
              targets: []
            });
          }
        }
      });
    }
  }

  private static processOpus(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastInstantOrSorcery && event.playerId) {
      state.battlefield.forEach((p) => {
        if (p.controllerId === event.playerId) {
          const opusAbility = (p.definition.abilities || [])
            .find((a: any): a is TriggeredAbilityDefinition => typeof a !== "string" && (a.eventMatch === TriggerEvent.Opus || a.name === "Opus"));
          if (opusAbility) {
            // Avoid adding duplicate trigger if collectMatchingTriggers already found it
            const alreadyAdded = matchingTriggers.some(
              (t) =>
                t.sourceId === p.id &&
                (t.name === "Opus" || t.oracleText?.includes("Opus")),
            );
            if (opusAbility && !alreadyAdded) {
              matchingTriggers.push({
                ...opusAbility,
                id: `opus_gen_${p.id}_${Date.now()}`,
                sourceId: p.id,
                controllerId: p.controllerId,
                targetIds: event.payload?.targetIds || [],
                abilityIndex: (p.definition.abilities || []).findIndex(a => a === opusAbility),
                payload: {
                  spent: event.payload?.spent || 0,
                },
                targets: []
              });
            }
          }
        }
      });
    }
  }

  private static processMiracle(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.MiracleReveal && event.playerId) {
      const card = event.payload?.object;
      if (!card || !RuleUtils.isGameObject(card)) return;

      const { logger } = getProcessors(state);
      logger.debug(state, LogCategory.TRIGGER, `[MIRACLE-LOG] Generating Miracle reveal trigger for ${card.definition.name} (Source: ${card.id}). ActiveZone: Hand`);

      matchingTriggers.push({
        id: `miracle_trigger_${card.id}_${Date.now()}`,
        name: `Miracle: ${card.definition.name}`,
        sourceId: card.id,
        controllerId: event.playerId,
        eventMatch: TriggerEvent.MiracleReveal,
        activeZone: Zone.Hand,
        effects: [
          {
            type: EffectType.Choice,
            label: `Cast ${card.definition.name} for its Miracle cost?`,
            choices: [
              {
                label: `Cast for Miracle cost`,
                effects: [
                  {
                    type: EffectType.CastSpell,
                    targetMapping: TargetMapping.Self,
                    isMiracleCast: true,
                  },
                ],
              },
              { label: "Decline", effects: [] },
            ],
          },
        ],
        targets: [],
      });
    }
  }
}
