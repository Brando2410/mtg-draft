import { GameState, GameObject, PlayerId, GameObjectId, AbilityCost, RestrictionType, Zone } from '@shared/engine_types';
import { ManaProcessor } from './ManaProcessor';
import { ActionProcessor } from '../actions/ActionProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { TargetingProcessor } from '../actions/TargetingProcessor';
import { TriggerProcessor } from '../effects/TriggerProcessor';

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
    const source = this.findObject(state, sourceId);
    if (!source) return false;

    for (const cost of costs) {
      if (!this.canPaySingle(state, cost, source, playerId)) {
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
    const source = this.findObject(state, sourceId);
    if (!source) return;

    for (const cost of costs) {
      this.paySingle(state, cost, source, playerId, log);
    }
  }

  private static canPaySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    switch (cost.type) {
      case 'Tap':
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

      case 'Mana':
        const effectiveMana = this.getEffectiveManaCost(state, cost, source);
        return ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveMana);

      case 'Loyalty':
        const val = parseInt(cost.value);
        const current = source.counters.loyalty || 0;
        return val >= 0 || current >= Math.abs(val);

      case 'Sacrifice':
        if (cost.targetMapping === 'SELF') {
           return state.battlefield.some(c => c.id === source.id);
        }
        if (cost.restrictions) {
           return state.battlefield.some(c => c.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, c, cost.restrictions!, playerId, source.id));
        }
        return state.battlefield.some(c => c.controllerId === playerId);

      case 'Discard':
        return player.hand.some(c => !cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, playerId, source.id));

      case 'PayLife':
        return player.life > (parseInt(cost.value) || 0);

      case 'Exile':
        if (cost.targetMapping === 'SELF') {
           return state.battlefield.some(c => c.id === source.id);
        }
        const zones = cost.sourceZones || (cost.sourceZone ? [cost.sourceZone] : [Zone.Battlefield]);
        const pool = zones.flatMap(z => {
            if (z === Zone.Battlefield) return state.battlefield.filter(o => o.controllerId === playerId);
            if (z === Zone.Graveyard) return player.graveyard;
            if (z === Zone.Hand) return player.hand;
            if (z === Zone.Exile) return state.exile; // Rare but possible
            return [];
        });
        return pool.some(c => !cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions, playerId, source.id));

      case 'Crew': {
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

      default:
        return false;
    }
  }

  private static paySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId, log: (m: string) => void) {
    const player = state.players[playerId];
    if (!player) return;

    switch (cost.type) {
      case 'Tap':
        source.isTapped = true;
        TriggerProcessor.onEvent(state, { type: 'ON_TAP', playerId, targetId: source.id, data: { object: source } }, log);
        break;

      case 'Mana':
        // Auto-tap logic is usually handled before calling pay() or inside playCard/activateAbility
        // If we reach here, we assume mana is in the pool or we deduct it directly
        const effectiveManaStr = this.getEffectiveManaCost(state, cost, source);
        ManaProcessor.deductManaCost(player, effectiveManaStr);
        break;

      case 'Loyalty':
        const lVal = parseInt(cost.value);
        const oldL = source.counters.loyalty || 0;
        source.counters.loyalty = oldL + lVal;
        log(`${source.definition.name} loyalty: ${oldL} -> ${source.counters.loyalty}`);
        break;

      case 'Sacrifice':
        // CR 701.17: To sacrifice a permanent, move it to its owner's graveyard.
        let toSac;
        if (cost.targetMapping === 'SELF') {
            toSac = source;
            log(`[SACRIFICE] Identified source ${source.definition.name} as SELF sacrifice target.`);
        } else {
            // Check for pre-selected target from modal choice
            const chosenId = (state as any).lastChosenSacrificeId;
            if (chosenId) {
                toSac = state.battlefield.find(c => c.id === chosenId);
            } else {
                // Fallback for auto-order/automated effects (not recommended for complex costs)
                toSac = state.battlefield.find(c => c.controllerId === playerId && (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions!, playerId, source.id)));
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

      case 'Discard':
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

       case 'PayLife':
         const lifeVal = parseInt(cost.value) || 0;
         player.life -= lifeVal;
         TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId, amount: lifeVal }, log);
         log(`${player.name} pays ${lifeVal} life (${player.life + lifeVal} -> ${player.life})`);
         break;

       case 'Exile':
         let exiles: GameObject[] = [];
         if (cost.targetMapping === 'SELF') {
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

       case 'Crew': {
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
       default:
        return true;
    }
  }

  public static getEffectiveManaCost(state: GameState, cost: AbilityCost, source: GameObject, stackObject?: any): string {
    if (cost.type !== 'Mana') return cost.value;

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
                reduction += (source.counters[mod.counterType] || 0);
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
    return state.battlefield.find(o => o.id === id) || 
           state.exile.find(o => o.id === id) ||
           state.stack.find(o => o.id === id)?.card ||
           Object.values(state.players).flatMap(p => [...p.hand, ...p.graveyard, ...p.library]).find(o => o.id === id);
  }
}
