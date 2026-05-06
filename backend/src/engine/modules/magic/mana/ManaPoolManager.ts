// ManaPoolManager.ts
import { GameObject, GameState, PlayerState } from '@shared/engine_types';
import { ManaParser } from './ManaParser';
import { ManaPoolRecord } from './ManaTypes';
import { RuleUtils } from '../../../utils/RuleUtils';

export class ManaPoolManager {

  /**
   * CR 106.4: Mana pools empty at the end of each step and phase.
   */
  public static emptyAllManaPools(state: GameState) {
    for (const player of Object.values(state.players) as PlayerState[]) {
      player.manaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
      player.restrictedMana = [];
    }
  }

  /**
   * Combines floating mana and applicable restricted mana into a virtual pool for calculations.
   */
  public static getUsableMana(player: PlayerState, payingFor?: GameObject): ManaPoolRecord {
    const combined = { ...player.manaPool };
    if (player.restrictedMana && player.restrictedMana.length > 0) {
      player.restrictedMana.forEach((m: any) => {
        let matches = true;
        if (m.restrictions && m.restrictions.length > 0) {
          if (!payingFor) {
            matches = false;
          } else {
            const oracleText = (payingFor.definition.oracleText || '').toLowerCase();
            matches = m.restrictions.every((r: string) => {
              const lowR = r.toLowerCase();
              // Handle common STX restrictions
              if (lowR === 'instant_or_sorcery') {
                return RuleUtils.isType(payingFor, 'instant') || RuleUtils.isType(payingFor, 'sorcery');
              }
              return RuleUtils.isType(payingFor, lowR) || RuleUtils.hasSubtype(payingFor, lowR) || oracleText.includes(lowR);
            });
          }
        }
        if (matches) {
          (combined as any)[m.color] += m.amount;
        }
      });
    }
    return combined;
  }

  /**
   * Finalizes the deduction of mana from a player's pool.
   */
  public static deductManaCost(player: PlayerState, costStr: string, state?: GameState, payingFor?: GameObject): string[] {
    if (!costStr || player.manaCheat) return [];

    const colorsSpent = new Set<string>();
    const requirements = ManaParser.parseManaCost(costStr);
    
    // Support for Chromatic Orrery / Spend as Any Color
    const canSpendAsAnyColor = state?.ruleRegistry.continuousEffects.some(e => 
        (e.type === 'AllowSpendManaAsAnyColor' || e.spendAnyMana) && 
        e.controllerId === player.id &&
        (!e.targetIds || !payingFor || e.targetIds.includes(payingFor.id))
    );

    const spend = (color: string, amount: number) => {
      if (amount <= 0) return;
      if (color !== 'C') colorsSpent.add(color);
      
      let left = amount;
      // Prioritize restricted mana (specific resources first)
      if (player.restrictedMana) {
        for (const rm of player.restrictedMana) {
          if (left <= 0) break;
          if (rm.color === color && rm.amount > 0) {
            let matches = true;
            if (rm.restrictions && rm.restrictions.length > 0) {
              if (!payingFor) {
                matches = false;
              } else {
                matches = rm.restrictions.every((r: string) => {
                  const lowR = r.toLowerCase();
                  if (lowR === 'instant_or_sorcery') {
                    return RuleUtils.isType(payingFor, 'instant') || RuleUtils.isType(payingFor, 'sorcery');
                  }
                  return RuleUtils.isType(payingFor, lowR) || RuleUtils.hasSubtype(payingFor, lowR);
                });
              }
            }
            if (matches) {
              const take = Math.min(left, rm.amount);
              rm.amount -= take;
              left -= take;
            }
          }
        }
        player.restrictedMana = player.restrictedMana.filter(m => m.amount > 0);
      }

      if (left > 0) {
        player.manaPool[color as keyof typeof player.manaPool] -= left;
      }
    };

    if (canSpendAsAnyColor) {
      let genericLeft = ManaParser.getManaValue(costStr);
      const priority: (keyof typeof player.manaPool)[] = ['C', 'W', 'U', 'B', 'R', 'G'];
      for (const color of priority) {
        if (genericLeft <= 0) break;
        const pool = this.getUsableMana(player, payingFor);
        const spendable = Math.min(genericLeft, pool[color]);
        spend(color, spendable);
        genericLeft -= spendable;
      }
      return Array.from(colorsSpent);
    }

    // Deduct colored/hybrid mana first
    let extraGenericFromHybrids = 0;
    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
        let left = amount;
        const options = symbol.split('/');
        
        // 1. Try to pay with colors first
        for (const opt of options) {
          if (opt === 'P' || !isNaN(parseInt(opt))) continue;
          const pool = this.getUsableMana(player, payingFor);
          const spendable = Math.min(left, pool[opt as keyof typeof pool] || 0);
          spend(opt, spendable);
          left -= spendable;
          if (left <= 0) break;
        }

        // 2. Add remaining to generic debt if monocolored hybrid
        if (left > 0) {
          const numericOpt = options.find(opt => !isNaN(parseInt(opt)));
          if (numericOpt) {
            extraGenericFromHybrids += (left * parseInt(numericOpt));
          }
        }
      } else {
        spend(symbol, amount);
      }
    }

    let genericLeft = requirements.generic + extraGenericFromHybrids;
    const priority: (keyof typeof player.manaPool)[] = ['C', 'W', 'U', 'B', 'R', 'G'];
    for (const color of priority) {
      if (genericLeft <= 0) break;
      const pool = this.getUsableMana(player, payingFor);
      const spendable = Math.min(genericLeft, pool[color]);
      spend(color, spendable);
      genericLeft -= spendable;
    }
    return Array.from(colorsSpent);
  }

  public static refundManaCost(player: PlayerState, costStr: string) {
    if (!costStr || player.manaCheat) return;
    const requirements = ManaParser.parseManaCost(costStr);

    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
         const first = symbol.split('/')[0];
         if (first !== 'P') (player.manaPool as any)[first] += amount;
      } else {
        player.manaPool[symbol as keyof typeof player.manaPool] += amount;
      }
    }
    player.manaPool['C'] += requirements.generic;
  }
}
