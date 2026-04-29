import { AbilityCost, CardType, CostType, CrewCost, DiscardCost, ExileCost, GameObject, GameObjectId, GameState, LifeCost, LoyaltyCost, ManaCost, PlayerId, RestrictionType, SacrificeCost, StackObject, TapSelectionCost, Zone } from '@shared/engine_types';

import { ActionProcessor } from '../actions/ActionProcessor';
import { TargetingProcessor } from '../actions/targeting/TargetingProcessor';
import { TriggerProcessor } from '../effects/triggers/TriggerProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from './ManaProcessor';

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
    for (const cost of costs) {
      if (!this.canPaySingle(state, cost, validSource, playerId, stackObject)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Executes the payment for all costs.
   * Note: This assumes canPay has already been checked.
   */
  public static pay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId, playerId: PlayerId, log: (m: string) => void) {
    let source = this.findObject(state, sourceId);

    if (!source) {
      source = { id: sourceId, ownerId: playerId, controllerId: playerId, definition: { name: 'Resolving Object', types: [] }, zone: Zone.Stack, counters: {}, isTapped: false } as unknown as GameObject;
    }

    const validSource = source as GameObject;
    for (const cost of costs) {
      this.paySingle(state, cost, validSource, playerId, log);
    }
  }

  private static canPaySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId, stackObject?: GameObject | StackObject): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    switch (cost.type) {
      case CostType.Tap:
        if (source.isTapped) return false;

        // Rule 302.6: Summoning Sickness applies to tap abilities of creatures
        const isCreature = (source.typeMask || 0) & CardType.Creature;
        if (isCreature && source.summoningSickness) {
          const stats = LayerProcessor.getEffectiveStats(source, state);
          if (!stats.keywords.includes('Haste')) {
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
        return ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveMana);

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
        const neededSac = (sacCost.amount !== undefined) ? sacCost.amount : 1;
        const validSacrifices = state.battlefield.filter(c =>
          String(c.controllerId) === String(playerId) &&
          (!sacCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, sacCost.restrictions, { controllerId: playerId, sourceId: source.id }))
        );
        return validSacrifices.length >= neededSac;
      }

      case CostType.SacrificeSelf:
        return state.battlefield.some(c => c.id === source.id);

      case CostType.Discard: {
        const discCost = cost as DiscardCost;
        const neededDisc = discCost.amount || 1;
        const validDiscards = player.hand.filter(c =>
          (!discCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, discCost.restrictions, { controllerId: playerId, sourceId: source.id }))
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
        const zones = exileCost.sourceZones || [Zone.Battlefield];
        const pool = zones.flatMap((z: Zone) => {
          if (z === Zone.Battlefield) return state.battlefield.filter(o => o.controllerId === playerId);
          if (z === Zone.Graveyard) return player.graveyard;
          if (z === Zone.Hand) return player.hand;
          if (z === Zone.Exile) return state.exile;
          return [];
        });
        const neededExile = exileCost.amount || 1;
        const validExiles = pool.filter((c: GameObject) =>
          (!exileCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, exileCost.restrictions, { controllerId: playerId, sourceId: source.id }))
        );
        return validExiles.length >= neededExile;
      }

      case CostType.Crew: {
        const crewCost = cost as CrewCost;
        const xValue = source.xValue ?? 0;
        const amountStr = String(crewCost.amount || crewCost.value || 0);
        const amount = amountStr === 'X' ? xValue : Number(amountStr);
        const candidates = state.battlefield.filter(o =>
          o.controllerId === playerId &&
          o.definition.types.some(t => t.toLowerCase() === 'creature') &&
          !o.isTapped
        );
        const totalPowerAvailable = candidates.reduce((sum, c) => sum + LayerProcessor.getEffectiveStats(c, state).power, 0);
        return totalPowerAvailable >= amount;
      }

      case CostType.TapSelection: {
        const tapCost = cost as TapSelectionCost;
        const amount = Number(tapCost.value || tapCost.amount || 1);
        const candidates = state.battlefield.filter(o =>
          String(o.controllerId) === String(playerId) &&
          !o.isTapped &&
          (!tapCost.restrictions || TargetingProcessor.matchesRestrictions(state, o, tapCost.restrictions, { controllerId: playerId, sourceId: source.id }))
        );
        // console.log(`[DEBUG] TapSelection canPay: amount=${amount}, candidates=${candidates.length}, sourceId=${source.id}`);
        return candidates.length >= amount;
      }


      default:
        return false;
    }
  }

  private static paySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId, log: (m: string) => void) {
    const player = state.players[playerId];
    if (!player) return;

    switch (cost.type) {
      case CostType.Tap:
        source.isTapped = true;
        TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, targetId: source.id, data: { object: source } }, log);
        break;

      case CostType.Mana:
        // Auto-tap logic is usually handled before calling pay() or inside playCard/activateAbility
        // If we reach here, we assume mana is in the pool or we deduct it directly
        const effectiveManaStr = this.getEffectiveManaCost(state, cost, source);
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
        log(`${source.definition.name} loyalty: ${oldL} -> ${source.counters.loyalty}`);

        TriggerProcessor.onEvent(state, { type: 'ON_ACTIVATE_LOYALTY', playerId, sourceId: source.id, data: { object: source } }, log);
        break;
      }

      case CostType.Sacrifice:
      case CostType.SacrificeSelf: {
        // CR 701.17: To sacrifice a permanent, move it to its owner's graveyard.
        const sacCost = cost as SacrificeCost;
        let toSac;
        if (sacCost.targetMapping === 'SELF' || sacCost.type === CostType.SacrificeSelf) {
          toSac = source;
          log(`[SACRIFICE] Identified source ${source.definition.name} as SELF sacrifice target.`);
        } else {
          // Check for pre-selected target from modal choice
          const chosenId = state.interaction.lastChosenSacrificeId;
          if (chosenId) {
            toSac = state.battlefield.find(c => String(c.id) === String(chosenId));
          } else {
            // Fallback for auto-order/automated effects (not recommended for complex costs)
            toSac = state.battlefield.find(c => String(c.controllerId) === String(playerId) && (!sacCost.restrictions || TargetingProcessor.matchesRestrictions(state, c, sacCost.restrictions, { controllerId: playerId, sourceId: source.id })));
          }
        }

        if (toSac) {
          log(`[SACRIFICE] Processor executing moveCard for ${toSac.definition.name}...`);
          TriggerProcessor.onEvent(state, {
            type: 'ON_SACRIFICE',
            playerId,
            sourceId: toSac.id,
            data: { object: toSac }
          }, log);
          ActionProcessor.moveCard(state, toSac, Zone.Graveyard, playerId, log);
          log(`${player.name} sacrificed ${toSac.definition.name} as a cost.`);
        } else {
          log(`[SACRIFICE] Error: No valid object found to sacrifice for cost.`);
        }
        delete state.interaction.lastChosenSacrificeId;
        break;
      }

      case CostType.Discard: {
        const discCost = cost as DiscardCost;
        // CR 701.8: To discard a card, move it from hand to graveyard.
        // If it's a cost, we typically expect a pre-selected cardId in state.lastChosenDiscardId
        // or we need to trigger a choice if it's not present.
        const discardId = state.interaction.lastChosenDiscardId;
        const cardToDiscard = player.hand.find(c => c.id === discardId);
        if (cardToDiscard) {
          TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId, data: { card: cardToDiscard, sourceId: source.id } }, log);
          ActionProcessor.moveCard(state, cardToDiscard, Zone.Graveyard, playerId, log);
          log(`${player.name} discarded ${cardToDiscard.definition.name} as a cost.`);
        }
        delete state.interaction.lastChosenDiscardId;
        break;
      }

      case CostType.PayLife: {
        const lifeCost = cost as LifeCost;
        const xValue = source.xValue ?? 0;
        const lifeVal = lifeCost.value === 'X' ? xValue : (parseInt(lifeCost.value) || 0);
        player.life -= lifeVal;
        TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId, amount: lifeVal }, log);
        log(`${player.name} pays ${lifeVal} life (${player.life + lifeVal} -> ${player.life})`);
        break;
      }

      case CostType.Exile:
      case CostType.ExileSelf: {
        const exileCost = cost as ExileCost;
        let exiles: GameObject[] = [];
        if (exileCost.targetMapping === 'SELF' || exileCost.type === CostType.ExileSelf) {
          exiles = [source];
        } else {
          const chosenIds = state.interaction.lastChosenExileIds || [];
          chosenIds.forEach((id: string) => {
            const obj = this.findObject(state, id);
            if (obj) exiles.push(obj);
          });
        }

        exiles.forEach(obj => {
          ActionProcessor.moveCard(state, obj, Zone.Exile, playerId, log);
          log(`${player.name} exiled ${obj.definition?.name || 'an object'} as a cost.`);
        });
        delete state.interaction.lastChosenExileIds;
        break;
      }

      case CostType.Crew: {
        const crewIds = state.interaction.lastChosenCrewIds || [];
        crewIds.forEach((cid: string) => {
          const c = state.battlefield.find(o => o.id === cid);
          if (c) {
            c.isTapped = true;
            TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, targetId: c.id, data: { object: c } }, log);
          }
        });
        delete state.interaction.lastChosenCrewIds;
        break;
      }

      case CostType.TapSelection: {
        const chosenIds = state.interaction.lastChosenTapSelectionIds || [];
        log(`[COST-DEBUG] Executing TapSelection for ${chosenIds.length} creatures. IDs: ${chosenIds.join(', ')}`);
        chosenIds.forEach((cid: string) => {
          const c = state.battlefield.find(o => o.id === cid);
          if (c) {
            c.isTapped = true;
            log(`${c.definition.name} tapped.`);
            TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, targetId: c.id, data: { object: c } }, log);
          }
        });
        delete state.interaction.lastChosenTapSelectionIds;
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
              reduction += (source.counters[mod.counterType] || 0) * (mod.amount || 1);
            }
          }

          if (reduction > 0) {
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
        costStr = String((cost as CrewCost).value || (cost as CrewCost).amount || "");
        break;
      case CostType.TapSelection:
        costStr = String((cost as TapSelectionCost).value || (cost as TapSelectionCost).amount || "");
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
    if (!id) return undefined;

    // FAST PATH: Leverage the O(1) cache if it exists and is fresh
    if (state._objectCache && state._objectCache.version === state.stateVersion) {
      return state._objectCache.get(id);
    }

    // Fallback to legacy linear search (O(N))
    return TargetingProcessor.findObjectInAnyZone(state, id) || undefined;
  }
}
