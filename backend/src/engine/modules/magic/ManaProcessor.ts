import { PlayerState, GameState, GameObject } from '@shared/engine_types';

/**
 * Handle Mana Pool, Cost Analysis, and Payments (Chapters 106 & 117)
 */
export class ManaProcessor {

  /**
   * CR 106.4: Mana pools empty at the end of each step and phase.
   */
  public static emptyAllManaPools(state: GameState) {
    for (const player of Object.values(state.players) as PlayerState[]) {
      player.manaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
      player.restrictedMana = [];
    }
  }

  public static canPayManaCost(player: PlayerState, costStr: string, state?: GameState, payingFor?: GameObject): boolean {
    if (!costStr || player.manaCheat) return true;
    
    // Support for Chromatic Orrery / Spend as Any Color
    const canSpendAsAnyColor = state?.ruleRegistry.continuousEffects.some(e => e.type === 'AllowSpendManaAsAnyColor' && e.controllerId === player.id);
    const pool = this.getUsableMana(player, payingFor);

    if (canSpendAsAnyColor) {
        const totalFloating = Object.values(pool).reduce((a, b: any) => a + b, 0);
        const totalRequired = this.getManaValue(costStr);
        return totalFloating >= totalRequired;
    }

    const requirements = this.parseManaCost(costStr);
    
    // Check colored mana first (including hybrids)
    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
        const options = symbol.split('/');
        const totalAvailable = options.reduce((sum, opt) => {
          if (opt === 'P') return sum;
          return sum + (pool[opt as keyof typeof pool] || 0);
        }, 0);
        if (totalAvailable < amount) return false;
      } else {
        if ((pool[symbol as keyof typeof pool] || 0) < amount) return false;
      }
    }

    const totalFloating = Object.values(pool).reduce((a, b: any) => a + b, 0);
    const totalRequired = this.getManaValue(costStr);
    
    return totalFloating >= totalRequired;
  }

  public static canPayWithTotal(player: PlayerState, battlefield: any[], costStr: string, payingFor?: GameObject): boolean {
    if (!costStr || player.manaCheat) return true;
    const requirements = this.parseManaCost(costStr);
    
    // 1. Prepare available sources
    const pool = this.getUsableMana(player, payingFor);
    const untappedLands: any[] = [];

    const { oracle } = require('./../../OracleLogicMap');
    battlefield.forEach(obj => {
      if (obj.controllerId === player.id && !obj.isTapped) {
        const logic = oracle.getCard(obj.definition.name);
        if (!logic) return;

        const manaAbilities = (logic.abilities || []).filter((a: any) => a.isManaAbility);
        if (manaAbilities.length === 0) return;

        const colors = new Set<string>();
        manaAbilities.forEach((a: any) => {
           const effect = (a.effects || []).find((e: any) => e.type === 'AddMana');
           if (effect) {
               const manaStr = effect.value || '{C}';
               const reqs = this.parseManaCost(manaStr.startsWith('{') ? manaStr : `{${manaStr}}`);
               Object.keys(reqs.colored).forEach(c => colors.add(c));
               if (reqs.generic > 0) colors.add('C');
           }
        });
        untappedLands.push({ id: obj.id, colors: Array.from(colors) });
      }
    });

    // 2. Greedy validation for colored costs
    const coloredReqs: string[] = [];
    Object.entries(requirements.colored).forEach(([symbol, amount]) => {
        for (let i = 0; i < (amount as number); i++) coloredReqs.push(symbol);
    });

    const usedLands = new Set<string>();
    for (const req of coloredReqs) {
        // a. Try pool first
        if (req.includes('/')) {
            const options = req.split('/');
            const found = options.find(opt => (pool as any)[opt] > 0);
            if (found) { (pool as any)[found]--; continue; }
        } else if ((pool as any)[req] > 0) {
            (pool as any)[req]--;
            continue;
        }

        // b. Try lands
        const options = req.includes('/') ? req.split('/') : [req];
        const possibleLands = untappedLands
            .filter(l => !usedLands.has(l.id) && l.colors.some((c: string) => options.includes(c)))
            .sort((a, b) => a.colors.length - b.colors.length);

        if (possibleLands.length > 0) {
            usedLands.add(possibleLands[0].id);
        } else {
            return false;
        }
    }

    // 3. Final generic check
    const remainingPool = Object.values(pool).reduce((a, b: number) => a + b, 0);
    const remainingLands = untappedLands.length - usedLands.size;
    
    return (remainingPool + remainingLands) >= requirements.generic;
  }

  public static getUsableMana(player: PlayerState, payingFor?: GameObject) {
    const combined = { ...player.manaPool };
    if (player.restrictedMana && player.restrictedMana.length > 0) {
        player.restrictedMana.forEach(m => {
            let matches = true;
            if (m.restrictions && m.restrictions.length > 0) {
                if (!payingFor) {
                    matches = false;
                } else {
                    const typeLine = (payingFor.definition.type_line || '').toLowerCase();
                    const oracleText = (payingFor.definition.oracleText || '').toLowerCase();
                    matches = m.restrictions.every(r => {
                        const lowR = r.toLowerCase();
                        // Handle common STX restrictions like "Instant", "Sorcery"
                        return typeLine.includes(lowR) || oracleText.includes(lowR);
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

  public static deductManaCost(player: PlayerState, costStr: string, state?: GameState, payingFor?: GameObject): string[] {
    if (!costStr || player.manaCheat) return [];

    const colorsSpent = new Set<string>();
    const requirements = this.parseManaCost(costStr);
    const canSpendAsAnyColor = state?.ruleRegistry.continuousEffects.some(e => e.type === 'AllowSpendManaAsAnyColor' && e.controllerId === player.id);

    // Helper to spend mana from pool OR restricted mana
    const spend = (color: string, amount: number) => {
        if (amount <= 0) return;
        if (color !== 'C') colorsSpent.add(color);
        
        let left = amount;
        // Prioritize restricted mana (CR 601.2g equivalent for software: use most specific resource first)
        if (player.restrictedMana) {
            for (const rm of player.restrictedMana) {
                if (left <= 0) break;
                if (rm.color === color && rm.amount > 0) {
                    // Check if this restricted mana is actually usable for this card
                    let matches = true;
                    if (rm.restrictions && rm.restrictions.length > 0) {
                        if (!payingFor) {
                            matches = false;
                        } else {
                    const typeLine = (payingFor.definition.type_line || '').toLowerCase();
                    const types = (payingFor.definition.types || []).map(t => t.toLowerCase());
                    matches = rm.restrictions.every(r => {
                        const lowR = r.toLowerCase();
                        return typeLine.includes(lowR) || types.includes(lowR);
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
        let genericLeft = this.getManaValue(costStr);
        const priority: (keyof typeof player.manaPool)[] = ['W', 'U', 'B', 'R', 'G', 'C']; // Prioritize colors for Converge
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
    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
        let left = amount;
        const options = symbol.split('/');
        const pool = this.getUsableMana(player, payingFor);
        for (const opt of options) {
          if (opt === 'P') continue;
          const spendable = Math.min(left, pool[opt as keyof typeof pool] || 0);
          spend(opt, spendable);
          left -= spendable;
          if (left <= 0) break;
        }
      } else {
        spend(symbol, amount);
      }
    }

    let genericLeft = requirements.generic;
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
    const requirements = this.parseManaCost(costStr);

    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
         // Default refund to first option
         const first = symbol.split('/')[0];
         if (first !== 'P') (player.manaPool as any)[first] += amount;
      } else {
        player.manaPool[symbol as keyof typeof player.manaPool] += amount;
      }
    }
    player.manaPool['C'] += requirements.generic;
  }


  public static parseManaCost(costStr: string): { colored: Record<string, number>, generic: number } {
    const colored: Record<string, number> = {};
    let generic = 0;
    
    // Rule 107.4: Mana symbols are enclosed in braces
    const matches = costStr.match(/\{([^}]+)\}/g) || [];
    for (const m of matches) {
      let symbol = m.replace(/\{|\}/g, '').toUpperCase();
      if (['W', 'U', 'B', 'R', 'G', 'C'].includes(symbol)) {
        colored[symbol] = (colored[symbol] || 0) + 1;
      } else if (symbol.includes('/')) {
        // Hybrid mana
        colored[symbol] = (colored[symbol] || 0) + 1;
      } else if (!isNaN(parseInt(symbol, 10))) {
        generic += parseInt(symbol, 10);
      }
    }
    
    return { colored, generic };
  }

  public static getManaValue(costStr: string): number {
    if (!costStr) return 0;
    const { colored, generic } = this.parseManaCost(costStr);
    
    let coloredTotal = 0;
    for (const [symbol, count] of Object.entries(colored)) {
        if (symbol.startsWith('2/')) {
            // Rule 107.4b: Monocolored hybrid mana value is 2
            coloredTotal += (count * 2);
        } else {
            coloredTotal += count;
        }
    }
    return coloredTotal + generic;
  }


  public static autoTapLandsForCost(state: any, playerId: string, costStr: string, log: (m: string) => void, tapForManaCallback: (p: string, c: string) => void, payingFor?: GameObject) {
    const player = state.players[playerId];
    if (!player) return;
    const requirements = this.parseManaCost(costStr);
    
    // 1. Create a local tracking pool (including applicable restricted mana)
    const localPool = this.getUsableMana(player, payingFor);

    // 2. Handle colored requirements (greedy approach)
    const coloredReqs: string[] = [];
    Object.entries(requirements.colored).forEach(([c, amt]) => {
       for(let i=0; i<amt; i++) coloredReqs.push(c);
    });

    for (const req of coloredReqs) {
       // Satisfy from pool if possible
       if (req.includes('/')) {
           const options = req.split('/');
           const found = options.find(opt => (localPool as any)[opt] > 0);
           if (found) {
               (localPool as any)[found]--;
               continue; 
           }
       } else if ((localPool as any)[req] > 0) {
           (localPool as any)[req]--;
           continue; 
       }
       
       // Otherwise, tap a land that provides this color
       const options = req.includes('/') ? req.split('/') : [req];
       const landToTap = state.battlefield.find((obj: any) => {
           if (obj.controllerId !== playerId || obj.isTapped) return false;
           
           const { oracle } = require('./../../OracleLogicMap');
           const logic = oracle.getCard(obj.definition.name);
           if (!logic) return false;

           const manaAbilities = (logic.abilities || []).filter((a: any) => a.isManaAbility);
           return manaAbilities.some((a: any) => {
               const effect = a.effects.find((e: any) => e.type === 'AddMana');
               if (!effect) return false;
               const val = effect.value || '{C}';
               return options.some(opt => val.includes(opt));
           });
        });

        if (landToTap) {
            tapForManaCallback(playerId, landToTap.id);
            // Optimization: We don't need to manually update localPool here if the callback 
            // synchronously updates player.manaPool, but for safety in this loop's logic 
            // (in case we tap a dual land), we just assume it satisfied the requirement.
        }
    }

    // 3. Handle generic mana
    let genericNeeded = requirements.generic;
    
    // Satisfy from remaining pool first
    const poolTotal = Object.values(localPool).reduce((a: number, b: any) => a + b, 0);
    const genericFromPool = Math.min(genericNeeded, poolTotal);
    genericNeeded -= genericFromPool;

    // Tap for the rest
    for (let i = 0; i < genericNeeded; i++) {
        const landToTap = state.battlefield.find((obj: any) => {
           const types = (obj.definition.types || obj.definition.typeLine || obj.definition.type_line || "").toString().toLowerCase();
           return obj.controllerId === playerId && !obj.isTapped && types.includes('land');
        });
        if (landToTap) {
            tapForManaCallback(playerId, landToTap.id);
        }
    }
  }
}

