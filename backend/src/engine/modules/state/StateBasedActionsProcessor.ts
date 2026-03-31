import { GameState, Zone, PlayerId } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ActionProcessor } from '../actions/ActionProcessor';

/**
 * Rules Engine Module: State-Based Actions (Rule 704)
 * SBAs are game processes that happen whenever a player would receive priority.
 */
export class StateBasedActionsProcessor {
  
  /**
   * CR 704.3: Whenever a player would receive priority, the game checks for 
   * any of the listed conditions for state-based actions.
   */
  public static resolveSBAs(state: GameState, log: (msg: string) => void): boolean {
    let globalActionTaken = false;
    
    // Rule 704.3: If any SBAs are performed, the process is repeated until none are performed.
    while (this.performSBACHybridCycle(state, log)) {
        globalActionTaken = true;
    }

    return globalActionTaken;
  }

  private static performSBACHybridCycle(state: GameState, log: (msg: string) => void): boolean {
    let actionTaken = false;

    // 1. RULE 704.5a: Player loses if Life <= 0
    // (Implementation pending: needs PlayerState integration)

    // 2. Creature & Planeswalker checks (Rule 704.5f-i)
    const objects = [...state.battlefield];
    for (const obj of objects) {
      const stats = LayerProcessor.getEffectiveStats(obj, state);
      const objTypes = obj.definition.types.map(t => t.toLowerCase());

      // Rule 704.5f: 0 Toughness (ignores indestructible)
      if (objTypes.includes('creature') && stats.toughness <= 0) {
        log(`[SBA] ${obj.definition.name} has 0 toughness and dies.`);
        ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
        actionTaken = true;
        continue;
      }

      // Rule 704.5g: Lethal Damage
      const isLethal = obj.damageMarked >= stats.toughness || obj.deathtouchMarked;
      if (objTypes.includes('creature') && isLethal) {
        if (!stats.keywords.includes('Indestructible')) {
            log(`[SBA] ${obj.definition.name} destroyed by lethal damage.`);
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
            actionTaken = true;
            continue;
        }
      }

      // Rule 704.5i: Planeswalker Loyalty
      if (objTypes.includes('planeswalker')) {
         const loyalty = obj.counters['loyalty'] || 0;
         if (loyalty <= 0) {
            log(`[SBA] ${obj.definition.name} has 0 loyalty and is put into graveyard.`);
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
            actionTaken = true;
            continue;
         }
      }
    }

    // 3. Rule 704.5j: Legend Rule
    // "If a player controls two or more legendary permanents with the same name..."
    const legendaryPermanents = state.battlefield.filter(o => o.definition.supertypes.includes('Legendary'));
    const namesByController: Record<string, string[]> = {};
    
    for (const legend of legendaryPermanents) {
        const key = `${legend.controllerId}_${legend.definition.name}`;
        if (!namesByController[key]) {
            namesByController[key] = [legend.id];
        } else {
            // Player controls multiple. Must choose one to keep (simplified: keep the first).
            log(`[SBA] Legend Rule: ${legend.definition.name} redundant copy removed.`);
            ActionProcessor.moveCard(state, legend, Zone.Graveyard, legend.ownerId, log);
            actionTaken = true;
        }
    }

    // 4. Rule 704.5d: Token in a non-battlefield zone
    // "A token in a zone other than the battlefield ceases to exist."
    const nonBattlefieldZones = [Zone.Graveyard, Zone.Exile, Zone.Hand, Zone.Library];
    for (const zoneName of nonBattlefieldZones) {
        Object.values(state.players).forEach(player => {
            const list = zoneName === Zone.Graveyard ? player.graveyard : 
                         zoneName === Zone.Hand ? player.hand : player.library;
            
            if (list) {
                const tokens = list.filter(o => (o as any).isToken);
                if (tokens.length > 0) {
                    tokens.forEach(t => log(`[SBA] Token ${t.definition.name} ceased to exist in ${zoneName}.`));
                    if (zoneName === Zone.Graveyard) player.graveyard = player.graveyard.filter(o => !(o as any).isToken);
                    if (zoneName === Zone.Hand) player.hand = player.hand.filter(o => !(o as any).isToken);
                    actionTaken = true;
                }
            }
        });
    }

    return actionTaken;
  }

}
