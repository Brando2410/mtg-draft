import { AbilityCost, CostType, GameObject, GameObjectId, GameState, PlayerId, RestrictionType, Zone } from '@shared/engine_types';

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
  public static canPay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId, playerId: PlayerId): boolean {
    let source = this.findObject(state, sourceId);
    
    // Fallback for resolving objects in transition
    if (!source) {
        source = { id: sourceId, ownerId: playerId, controllerId: playerId, definition: { name: 'Resolving Object' }, zone: Zone.Stack } as any;
    }

    const validSource = source as GameObject;
    for (const cost of costs) {
      if (!this.canPaySingle(state, cost, validSource, playerId)) {
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
        source = { id: sourceId, ownerId: playerId, controllerId: playerId, definition: { name: 'Resolving Object' }, zone: Zone.Stack } as any;
    }

    const validSource = source as GameObject;
    for (const cost of costs) {
      this.paySingle(state, cost, validSource, playerId, log);
    }
  }

  private static canPaySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    switch (cost.type) {
      case CostType.Tap:
        if (source.isTapped) return false;

        
        // Rule 302.6: Summoning Sickness applies to tap abilities of creatures
        if (source.definition.types.includes('Creature') && source.summoningSickness) {
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
        const effectiveMana = this.getEffectiveManaCost(state, cost, source);
        return ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveMana);

      case CostType.Loyalty: {
        const xValue = (source as any).xValue !== undefined ? (source as any).xValue : 0;
        const valStr = String(cost.value);
        const val = (valStr === 'X' || valStr === '-X') ? -Math.abs(xValue) : parseInt(valStr);
        const current = source.counters.loyalty || 0;
        return val >= 0 || current >= Math.abs(val);
      }

      case CostType.Sacrifice:
        if (cost.targetMapping === 'SELF') {
           return state.battlefield.some(c => c.id === source.id);
        }
        const neededSac = cost.amount || 1;
        const validSacrifices = state.battlefield.filter(c => 
            c.controllerId === playerId && 
            (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, { controllerId: playerId, sourceId: source.id }))
        );
        return validSacrifices.length >= neededSac;

      case CostType.SacrificeSelf:
        return state.battlefield.some(c => c.id === source.id);

      case CostType.Discard:
        const neededDisc = cost.amount || 1;
        const validDiscards = player.hand.filter(c => 
            (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, { controllerId: playerId, sourceId: source.id }))
        );
        return validDiscards.length >= neededDisc;

      case CostType.PayLife:
        return player.life > (parseInt(cost.value) || 0);

      case CostType.Exile:
      case CostType.ExileSelf:
        if (cost.targetMapping === 'SELF' || cost.type === CostType.ExileSelf) {
           return !!this.findObject(state, source.id);
        }
        const zones = cost.sourceZones || (cost.sourceZone ? [cost.sourceZone] : [Zone.Battlefield]);
        const pool = zones.flatMap((z: Zone) => {
            if (z === Zone.Battlefield) return state.battlefield.filter(o => o.controllerId === playerId);
            if (z === Zone.Graveyard) return player.graveyard;
            if (z === Zone.Hand) return player.hand;
            if (z === Zone.Exile) return state.exile; 
            return [];
        });
        const neededExile = cost.amount || 1;
        const validExiles = pool.filter((c: GameObject) => 
            (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, { controllerId: playerId, sourceId: source.id }))
        );
        return validExiles.length >= neededExile;

      case CostType.Crew: {
        const xValue = (source as any).xValue !== undefined ? (source as any).xValue : 0;
        const amountStr = String(cost.amount || cost.value || 0);
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
        const amount = Number(cost.value || cost.amount || 1);
        const candidates = state.battlefield.filter(o => 
            String(o.controllerId) === String(playerId) && 
            !o.isTapped &&
            (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, o, cost.restrictions, { controllerId: playerId, sourceId: source.id }))
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
        const xValue = (source as any).xValue !== undefined ? (source as any).xValue : 0;
        const valStr = String(cost.value);
        const lVal = (valStr === 'X' || valStr === '-X') ? -Math.abs(xValue) : parseInt(valStr);
        const oldL = source.counters.loyalty || 0;
        source.counters.loyalty = oldL + lVal;
        log(`${source.definition.name} loyalty: ${oldL} -> ${source.counters.loyalty}`);
        
        const { TriggerProcessor } = require('./../effects/triggers/TriggerProcessor');
        TriggerProcessor.onEvent(state, { type: 'ON_ACTIVATE_LOYALTY', playerId, sourceId: source.id, data: { object: source } }, log);
        break;
      }

      case CostType.Sacrifice:
      case CostType.SacrificeSelf:
        // CR 701.17: To sacrifice a permanent, move it to its owner's graveyard.
        let toSac;
        if (cost.targetMapping === 'SELF' || cost.type === CostType.SacrificeSelf) {
            toSac = source;
            log(`[SACRIFICE] Identified source ${source.definition.name} as SELF sacrifice target.`);
        } else {
            // Check for pre-selected target from modal choice
            const chosenId = (state as any).lastChosenSacrificeId;
            if (chosenId) {
                toSac = state.battlefield.find(c => c.id === chosenId);
            } else {
                // Fallback for auto-order/automated effects (not recommended for complex costs)
                toSac = state.battlefield.find(c => c.controllerId === playerId && (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions!, { controllerId: playerId, sourceId: source.id })));
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
        delete (state as any).lastChosenSacrificeId;
        break;

      case CostType.Discard:
        // CR 701.8: To discard a card, move it from hand to graveyard.
        // If it's a cost, we typically expect a pre-selected cardId in state.lastChosenDiscardId
        // or we need to trigger a choice if it's not present.
        const discardId = (state as any).lastChosenDiscardId;
        const cardToDiscard = player.hand.find(c => c.id === discardId); 
        if (cardToDiscard) {
            TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId, data: { card: cardToDiscard, sourceId: source.id } }, log);
            ActionProcessor.moveCard(state, cardToDiscard, Zone.Graveyard, playerId, log);
            log(`${player.name} discarded ${cardToDiscard.definition.name} as a cost.`);
        }
        delete (state as any).lastChosenDiscardId;
        break;

       case CostType.PayLife:
         const lifeVal = parseInt(cost.value) || 0;
         player.life -= lifeVal;
         TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId, amount: lifeVal }, log);
         log(`${player.name} pays ${lifeVal} life (${player.life + lifeVal} -> ${player.life})`);
         break;

       case CostType.Exile:
       case CostType.ExileSelf:
         let exiles: GameObject[] = [];
         if (cost.targetMapping === 'SELF' || cost.type === CostType.ExileSelf) {
             exiles = [source];
         } else {
             const chosenIds = (state as any).lastChosenExileIds || ((state as any).lastChosenExileId ? [(state as any).lastChosenExileId] : []);
             chosenIds.forEach((id: string) => {
                 const obj = this.findObject(state, id);
                 if (obj) exiles.push(obj);
             });
         }
         
         exiles.forEach(obj => {
             ActionProcessor.moveCard(state, obj, Zone.Exile, playerId, log);
             log(`${player.name} exiled ${obj.definition?.name || 'an object'} as a cost.`);
         });
         delete (state as any).lastChosenExileId;
         delete (state as any).lastChosenExileIds;
         break;

       case CostType.Crew: {
         const crewIds = (state as any).lastChosenCrewIds || [];
         crewIds.forEach((cid: string) => {
             const c = state.battlefield.find(o => o.id === cid);
             if (c) {
                 c.isTapped = true;
                 TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, targetId: c.id, data: { object: c } }, log);
             }
         });
         delete (state as any).lastChosenCrewIds;
         break;
       }

       case CostType.TapSelection: {
         const chosenIds = (state as any).lastChosenTapSelectionIds || [];
         chosenIds.forEach((cid: string) => {
             const c = state.battlefield.find(o => o.id === cid);
             if (c) {
                 c.isTapped = true;
                 TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, targetId: c.id, data: { object: c } }, log);
             }
         });
         delete (state as any).lastChosenTapSelectionIds;
         break;
       }

       default:
        return true;
    }
  }

  public static getEffectiveManaCost(state: GameState, cost: AbilityCost, source: GameObject, stackObject?: any): string {
    if (cost.type !== CostType.Mana) return cost.value;


    let costStr = cost.value;
    
    // Rule 107.3: Handle X cost substitution
    const xValue = (source as any).xValue !== undefined ? (source as any).xValue : (stackObject?.xValue || 0);
    if (costStr.includes('{X}')) {
        costStr = costStr.replace(/\{X\}/g, `{${xValue}}`);
    }

    if (cost.costModifiers) {
        let reduction = 0;
        for (const mod of cost.costModifiers) {
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
    return costStr;
  }

  private static findObject(state: GameState, id: GameObjectId): GameObject | undefined {
    if (!id) return undefined;

    // 1. Battlefield
    let found = state.battlefield.find(o => o.id === id);
    if (found) return found;

    // 2. Stack (Checking instance ID, source ID, and card ID)
    const stackEntry = state.stack.find(o => o.id === id || o.sourceId === id || o.card?.id === id);
    if (stackEntry?.card) return stackEntry.card;

    // 3. Player Zones
    for (const pid in state.players) {
        const p = state.players[pid as PlayerId];
        found = p.hand.find(o => o.id === id) || 
                p.graveyard.find(o => o.id === id) || 
                p.library.find(o => o.id === id);
        if (found) return found;
    }

    // 4. Exile
    found = state.exile.find(o => o.id === id);
    if (found) return found;

    return undefined;
  }
}

