import { AbilityCost, CostType, CounterType, CrewCost, DiscardCost, ExileCost, GameObject, GameObjectId, GameState, LifeCost, LoyaltyCost, ManaCost, PlayerId, RestrictionType, SacrificeCost, StackObject, TapSelectionCost, Zone } from '@shared/engine_types';
import { LogCategory } from '../../utils/EngineLogger';
import { RuleUtils } from '../../utils/RuleUtils';
import { getProcessors } from '../ProcessorRegistry';

/**
 * Rules Engine Module: Cost Processing (Rule 601.2h / 101.1)
 * Responsible for verifying if a cost can be paid and performing the payment.
 */
export class CostProcessor {

  /**
   * Returns true if all costs in the list are currently payable.
   * Checks for restrictions like "Cannot Tap" (Rule 101.1).
   */
  public static canPay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId, playerId: PlayerId, stackObject?: GameObject | StackObject): boolean {
    let source = this.findObject(state, sourceId);

    // Fallback for resolving objects in transition
    if (!source) {
      source = { id: sourceId, ownerId: playerId, controllerId: playerId, definition: { name: 'Resolving Object', types: [] }, zone: Zone.Stack, counters: {}, isTapped: false } as unknown as GameObject;
    }

    const validSource = source as GameObject;
    const excludeSourceFromMana = costs.some(c => 
      c.type === CostType.Tap || 
      c.type === CostType.SacrificeSelf || 
      (c.type === CostType.Sacrifice && (c as any).targetMapping === 'SELF') ||
      c.type === CostType.ExileSelf ||
      (c.type === CostType.Exile && (c as any).targetMapping === 'SELF')
    );

    for (const cost of costs) {
      if (!this.canPaySingle(state, cost, validSource, playerId, stackObject, excludeSourceFromMana)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Executes the payment for all costs.
   * Note: This assumes canPay has already been checked.
   */
  public static pay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId, playerId: PlayerId) {
    let source = this.findObject(state, sourceId);

    if (!source) {
      source = { id: sourceId, ownerId: playerId, controllerId: playerId, definition: { name: 'Resolving Object', types: [] }, zone: Zone.Stack, counters: {}, isTapped: false } as unknown as GameObject;
    }

    const validSource = source as GameObject;
    for (const cost of costs) {
      this.paySingle(state, cost, validSource, playerId);
    }
  }

  private static canPaySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId, stackObject?: GameObject | StackObject, excludeSourceFromMana = false): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    switch (cost.type) {
      case CostType.Tap:
        if (source.isTapped) return false;

        // Rule 302.6: Summoning Sickness applies to tap abilities of creatures
        if (RuleUtils.isCreature(source) && source.summoningSickness) {
          const { layer: LayerProcessor } = getProcessors(state);
          const stats = LayerProcessor.getEffectiveStats(source, state);
          if (!RuleUtils.hasHaste(source)) {
            return false;
          }
        }

        const hasRestriction = state.ruleRegistry.restrictions.some(r =>
          r.type === RestrictionType.CannotTap &&
          (r.targetId === source.id || (r.targetControllerId === source.controllerId && !r.targetId))
        );
        if (hasRestriction) return false;
        return true;

      case CostType.Mana:
        const effectiveMana = this.getEffectiveManaCost(state, cost, source, stackObject);
        const { mana: ManaProcessor } = getProcessors(state);
        return ManaProcessor.canPayWithTotal(state, player, state.battlefield, effectiveMana, source, excludeSourceFromMana);

      case CostType.Loyalty: {
        const loyaltyCost = cost as LoyaltyCost;
        const xValue = source.xValue ?? 0;
        const valStr = String(loyaltyCost.value);
        const val = (valStr === 'X' || valStr === '-X') ? -Math.abs(xValue) : parseInt(valStr);
        const current = (source.counters || {}).loyalty || 0;
        return val >= 0 || current >= Math.abs(val);
      }

      case CostType.Sacrifice: {
        const sacCost = cost as SacrificeCost;
        if (String(sacCost.amount) === 'ANY') return true;
        const neededSac = String(sacCost.amount) === 'ALL' ? state.battlefield.filter(c => String(c.controllerId) === String(playerId)).length : (Number(sacCost.amount) || 1);
        const { targeting: TargetingProcessor } = getProcessors(state);
        const validSacrifices = state.battlefield.filter(c =>
          String(c.controllerId) === String(playerId) &&
          (!sacCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, sacCost.restrictions, { controllerId: playerId, sourceId: source.id, effects: [], targets: [] }))
        );
        return validSacrifices.length >= neededSac;
      }

      case CostType.SacrificeSelf:
        return state.battlefield.some(c => c.id === source.id);

      case CostType.Discard: {
        const discCost = cost as DiscardCost;
        if (String(discCost.amount) === 'ANY') return true;
        const neededDisc = String(discCost.amount) === 'ALL' ? player.hand.length : (Number(discCost.amount) || 1);
        const { targeting: TargetingProcessor } = getProcessors(state);
        const validDiscards = player.hand.filter(c =>
          (!discCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, discCost.restrictions, { controllerId: playerId, sourceId: source.id, effects: [], targets: [] }))
        );
        return validDiscards.length >= neededDisc;
      }

      case CostType.PayLife: {
        const lifeCost = cost as LifeCost;
        const xValue = source.xValue ?? (stackObject?.xValue || 0);
        const lifeVal = lifeCost.value === 'X' ? xValue : (parseInt(lifeCost.value) || 0);
        return player.life >= lifeVal; // Rule 119.4: A player can't pay more life than they have.
      }

      case CostType.Exile:
      case CostType.ExileSelf: {
        const exileCost = cost as ExileCost;
        if (exileCost.targetMapping === 'SELF' || exileCost.type === CostType.ExileSelf) {
          return !!this.findObject(state, source.id);
        }
        if (String(exileCost.amount) === 'ANY') return true;

        const zones = exileCost.sourceZones || [Zone.Battlefield];
        const pool = zones.flatMap((z: Zone) => {
          if (z === Zone.Battlefield) return state.battlefield.filter(o => o.controllerId === playerId);
          if (z === Zone.Graveyard) return player.graveyard;
          if (z === Zone.Hand) return player.hand;
          if (z === Zone.Exile) return state.exile;
          return [];
        });
        const neededExile = String(exileCost.amount) === 'ALL' ? pool.length : (Number(exileCost.amount) || 1);
        const { targeting: TargetingProcessor } = getProcessors(state);
        const validExiles = pool.filter((c: GameObject) =>
          (!exileCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, exileCost.restrictions, { controllerId: playerId, sourceId: source.id, effects: [], targets: [] }))
        );
        return validExiles.length >= neededExile;
      }

      case CostType.Crew: {
        const crewCost = cost as CrewCost;
        const xValue = source.xValue ?? 0;
        const amountStr = String(crewCost.value || 0);
        const amount = amountStr === 'X' ? xValue : Number(amountStr);
        const candidates = state.battlefield.filter(o =>
          o.controllerId === playerId &&
          RuleUtils.isCreature(o) &&
          !o.isTapped
        );
        const { layer: LayerProcessor } = getProcessors(state);
        const totalPowerAvailable = candidates.reduce((sum, c) => sum + LayerProcessor.getEffectiveStats(c, state).power, 0);
        return totalPowerAvailable >= amount;
      }

      case CostType.TapSelection: {
        const tapCost = cost as TapSelectionCost;
        const amount = Number(tapCost.amount || 1);
        const candidates = state.battlefield.filter(o =>
          String(o.controllerId) === String(playerId) &&
          !o.isTapped &&
          (() => {
            const { targeting: TargetingProcessor } = getProcessors(state);
            return (!tapCost.restrictions || TargetingProcessor.matchesRestrictions(state, o, tapCost.restrictions, { controllerId: playerId, sourceId: source.id, effects: [], targets: [] }));
          })()
        );
        return candidates.length >= amount;
      }


      default:
        return false;
    }
  }

  private static paySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId) {
    const { logger } = getProcessors(state);
    const player = state.players[playerId];
    if (!player) return;

    switch (cost.type) {
      case CostType.Tap:
        source.isTapped = true;
        const { trigger: TriggerProcessor } = getProcessors(state);
        TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, payload: { targetIds: [source.id], sourceId: source.id, object: source } });
        break;

      case CostType.Mana:
        // Auto-tap logic is usually handled before calling pay() or inside playCard/activateAbility
        // If we reach here, we assume mana is in the pool or we deduct it directly
        const effectiveManaStr = this.getEffectiveManaCost(state, cost, source);
        const { mana: ManaProcessor } = getProcessors(state);
        ManaProcessor.deductManaCost(player, effectiveManaStr);
        break;

      case CostType.Loyalty: {
        const loyaltyCost = cost as LoyaltyCost;
        const xValue = source.xValue ?? 0;
        const valStr = String(loyaltyCost.value);
        const lVal = (valStr === 'X' || valStr === '-X') ? -Math.abs(xValue) : parseInt(valStr);
        const oldL = (source.counters || {}).loyalty || 0;
        source.counters = source.counters || {};
        source.counters.loyalty = oldL + lVal;
        logger.info(state, LogCategory.ACTION, `${source.definition.name} loyalty: ${oldL} -> ${source.counters.loyalty}`);
        const { trigger: TriggerProcessor } = getProcessors(state);
        TriggerProcessor.onEvent(state, { type: 'ON_ACTIVATE_LOYALTY', playerId, payload: { sourceId: source.id, targetIds: [source.id], object: source } });
        break;
      }

      case CostType.Sacrifice:
      case CostType.SacrificeSelf: {
        // CR 701.17: To sacrifice a permanent, move it to its owner's graveyard.
        const sacCost = cost as SacrificeCost;
        let toSac;
        if (sacCost.targetMapping === 'SELF' || sacCost.type === CostType.SacrificeSelf) {
          toSac = source;
          logger.info(state, LogCategory.ACTION, `[SACRIFICE] Identified source ${source.definition.name} as SELF sacrifice target.`);
        } else {
          // Check for pre-selected target from modal choice
          const chosenId = state.interaction.lastSelections[CostType.Sacrifice]?.[0];
          if (chosenId) {
            toSac = state.battlefield.find(c => String(c.id) === String(chosenId));
          } else {
            // Fallback for auto-order/automated effects (not recommended for complex costs)
            const { targeting: TargetingProcessor } = getProcessors(state);
            toSac = state.battlefield.find(c => String(c.controllerId) === String(playerId) && (!sacCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, sacCost.restrictions, { controllerId: playerId, sourceId: source.id, effects: [], targets: [] })));
          }
        }

        if (toSac) {
          logger.info(state, LogCategory.ACTION, `[SACRIFICE] Processor executing moveCard for ${toSac.definition.name}...`);
          const { trigger: TriggerProcessor, action: ActionProcessor } = getProcessors(state);
          TriggerProcessor.onEvent(state, {
            type: 'ON_SACRIFICE',
            playerId,
            payload: { sourceId: toSac.id, targetIds: [toSac.id], object: toSac }
          });
          ActionProcessor.moveCard(state, toSac, Zone.Graveyard, playerId);
          logger.info(state, LogCategory.ACTION, `${player.name} sacrificed ${toSac.definition.name} as a cost.`);
        } else {
          logger.info(state, LogCategory.ACTION, `[SACRIFICE] Error: No valid object found to sacrifice for cost.`);
        }
        delete state.interaction.lastSelections[CostType.Sacrifice];
        break;
      }

      case CostType.Discard: {
        const discCost = cost as DiscardCost;
        // CR 701.8: To discard a card, move it from hand to graveyard.
        const discardId = state.interaction.lastSelections[CostType.Discard]?.[0];
        const cardToDiscard = player.hand.find(c => c.id === discardId);
        if (cardToDiscard) {
          const { action: ActionProcessor } = getProcessors(state);
          // Pass isDiscard = true (7th param) to handle triggers and lastDiscardedIds automatically
          ActionProcessor.moveCard(state, cardToDiscard, Zone.Graveyard, playerId, "top", false, true);
          logger.info(state, LogCategory.ACTION, `${player.name} discarded ${cardToDiscard.definition.name} as a cost.`);
        }
        delete state.interaction.lastSelections[CostType.Discard];
        break;
      }

      case CostType.PayLife: {
        const lifeCost = cost as LifeCost;
        const xValue = source.xValue ?? 0;
        const lifeVal = lifeCost.value === 'X' ? xValue : (parseInt(lifeCost.value) || 0);
        player.life -= lifeVal;
        const { trigger: TriggerProcessor } = getProcessors(state);
        TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId, payload: { amount: lifeVal, targetIds: [playerId], sourceId: source.id } });
        logger.info(state, LogCategory.ACTION, `${player.name} pays ${lifeVal} life (${player.life + lifeVal} -> ${player.life})`);
        break;
      }

      case CostType.Exile:
      case CostType.ExileSelf: {
        const exileCost = cost as ExileCost;
        let exiles: GameObject[] = [];
        if (exileCost.targetMapping === 'SELF' || exileCost.type === CostType.ExileSelf) {
          exiles = [source];
        } else {
          const chosenIds = state.interaction.lastSelections[CostType.Exile] || [];
          chosenIds.forEach((id: string) => {
            const obj = this.findObject(state, id);
            if (obj) exiles.push(obj);
          });
        }

        exiles.forEach(obj => {
          const { action: ActionProcessor } = getProcessors(state);
          ActionProcessor.moveCard(state, obj, Zone.Exile, playerId);
          logger.info(state, LogCategory.ACTION, `${player.name} exiled ${obj.definition?.name || 'an object'} as a cost.`);
        });
        delete state.interaction.lastSelections[CostType.Exile];
        break;
      }

      case CostType.Crew: {
        const crewIds = state.interaction.lastSelections[CostType.Crew] || [];
        crewIds.forEach((cid: string) => {
          const c = state.battlefield.find(o => o.id === cid);
          if (c) {
            c.isTapped = true;
            const { trigger: TriggerProcessor } = getProcessors(state);
            TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, payload: { targetIds: [c.id], sourceId: c.id, object: c } });
          }
        });
        delete state.interaction.lastSelections[CostType.Crew];
        break;
      }

      case CostType.TapSelection: {
        const chosenIds = state.interaction.lastSelections[CostType.TapSelection] || [];
        logger.debug(state, LogCategory.ACTION, `[COST-DEBUG] Executing TapSelection for ${chosenIds.length} creatures. IDs: ${chosenIds.join(', ')}`);
        chosenIds.forEach((cid: string) => {
          const c = state.battlefield.find(o => o.id === cid);
          if (c) {
            c.isTapped = true;
            logger.info(state, LogCategory.ACTION, `${c.definition.name} tapped.`);
            const { trigger: TriggerProcessor } = getProcessors(state);
            TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, payload: { targetIds: [c.id], sourceId: c.id, object: c } });
          }
        });
        delete state.interaction.lastSelections[CostType.TapSelection];
        break;
      }

      default:
        return true;
    }
  }

  public static getEffectiveManaCost(state: GameState, cost: AbilityCost, source: GameObject, stackObject?: GameObject | StackObject): string {
    let costStr = "";

    switch (cost.type) {
      case CostType.Mana: {
        const manaCost = cost as ManaCost;
        costStr = manaCost.value;

        if (manaCost.costModifiers) {
          let reduction = 0;
          for (const mod of manaCost.costModifiers) {
            if (mod.type === 'REDUCE_GENERIC_PER_COUNTER') {
              reduction += (source.counters[mod.counterType as CounterType] || 0) * (mod.amount || 1);
            }
          }

          if (reduction > 0) {
            const { mana: ManaProcessor } = getProcessors(state);
            const parsed = ManaProcessor.parseManaCost(costStr);
            parsed.generic = Math.max(0, parsed.generic - reduction);

            // Reconstruct mana string
            let newCost = "";
            if (parsed.generic > 0) newCost += `{${parsed.generic}}`;
            Object.entries(parsed.colored).forEach(([symbol, amount]) => {
              for (let i = 0; i < (amount as number); i++) newCost += `{${symbol}}`;
            });
            costStr = newCost || "{0}";
          }
        }
        break;
      }
      case CostType.PayLife:
        costStr = (cost as LifeCost).value;
        break;
      case CostType.Loyalty:
        costStr = String((cost as LoyaltyCost).value);
        break;
      case CostType.Crew:
        costStr = String((cost as CrewCost).value || "");
        break;
      case CostType.TapSelection:
        costStr = String((cost as TapSelectionCost).amount || "");
        break;
      default:
        return "";
    }

    if (!costStr) return "";

    // Rule 107.3: Handle X cost substitution
    const xValue = source.xValue ?? (stackObject?.xValue || 0);
    if (costStr.includes('{X}')) {
      costStr = costStr.replace(/\{X\}/g, `{${xValue}}`);
    }

    return costStr;
  }

  private static findObject(state: GameState, id: GameObjectId): GameObject | undefined {
    const obj = RuleUtils.findObject(state, id);
    return (obj && 'isTapped' in obj) ? obj : undefined;
  }
}
