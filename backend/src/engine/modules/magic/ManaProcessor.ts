import { PlayerState, GameState } from '@shared/engine_types';

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
    }
  }

  public static canPayManaCost(player: PlayerState, costStr: string): boolean {
    if (!costStr || player.manaCheat) return true;
    const requirements = this.parseManaCost(costStr);
    
    // Check colored mana first (including hybrids)
    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
        const options = symbol.split('/');
        // For simplicity, we check if the total available of all options is enough.
        // This is a heuristic but works for most cases.
        const totalAvailable = options.reduce((sum, opt) => {
          if (opt === 'P') return sum; // Skip Phyrexians for pool check
          return sum + (player.manaPool[opt as keyof typeof player.manaPool] || 0);
        }, 0);
        if (totalAvailable < amount) return false;
      } else {
        if ((player.manaPool[symbol as keyof typeof player.manaPool] || 0) < amount) return false;
      }
    }

    // Check generic/colorless remainder
    const totalFloating = Object.values(player.manaPool).reduce((a, b: any) => a + b, 0);
    const totalRequired = this.getManaValue(costStr);
    
    return totalFloating >= totalRequired;
  }

  /**
   * Fast estimation for auto-pass logic.
   */
  public static canPayWithTotal(player: PlayerState, battlefield: any[], costStr: string): boolean {
    if (!costStr || player.manaCheat) return true;
    const requirements = this.parseManaCost(costStr);
    
    const potential = { ...player.manaPool };
    battlefield.forEach(obj => {
      if (obj.controllerId === player.id && !obj.isTapped) {
        const types = (obj.definition.types || obj.definition.typeLine || obj.definition.type_line || "").toString().toLowerCase();
        const oracleText = (obj.definition.oracleText || obj.definition.oracle_text || "").toString().toLowerCase();
        
        if (types.includes('land')) {
          const name = obj.definition.name.toLowerCase();
          if (name.includes('plains')) { potential.W++; }
          else if (name.includes('island')) { potential.U++; }
          else if (name.includes('swamp')) { potential.B++; }
          else if (name.includes('mountain')) { potential.R++; }
          else if (name.includes('forest')) { potential.G++; }
          else if (oracleText.includes('add {w}')) { potential.W++; }
          else if (oracleText.includes('add {u}')) { potential.U++; }
          else if (oracleText.includes('add {b}')) { potential.B++; }
          else if (oracleText.includes('add {r}')) { potential.R++; }
          else if (oracleText.includes('add {g}')) { potential.G++; }
          else { potential.C++; } 
        }
      }
    });

    let totalPotentialCount = Object.values(potential).reduce((a, b: number) => a + b, 0);

    for (const [symbol, requiredAmount] of Object.entries(requirements.colored)) {
      const valPerSymbol = this.getManaValue(`{${symbol}}`);
      if (symbol.includes('/')) {
        const options = symbol.split('/');
        const totalAvailable = options.reduce((sum, opt) => sum + ((potential as any)[opt] || 0), 0);
        if (totalAvailable < (requiredAmount as number)) return false;
      } else {
        if (((potential as any)[symbol] || 0) < (requiredAmount as number)) return false;
      }
      totalPotentialCount -= (requiredAmount as number) * valPerSymbol;
    }

    return totalPotentialCount >= requirements.generic;
  }

  public static deductManaCost(player: PlayerState, costStr: string) {
    if (!costStr || player.manaCheat) return;
    const requirements = this.parseManaCost(costStr);

    // Deduct colored/hybrid mana first
    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
        let left = amount;
        const options = symbol.split('/');
        // Greedy deduction: prefer options that are currently in the pool
        for (const opt of options) {
          if (opt === 'P') continue; // Life payment not handled here
          const spendable = Math.min(left, player.manaPool[opt as keyof typeof player.manaPool] || 0);
          player.manaPool[opt as keyof typeof player.manaPool] -= spendable;
          left -= spendable;
          if (left <= 0) break;
        }
      } else {
        player.manaPool[symbol as keyof typeof player.manaPool] -= amount;
      }
    }

    let genericLeft = requirements.generic;
    const priority: (keyof typeof player.manaPool)[] = ['C', 'W', 'U', 'B', 'R', 'G'];
    for (const color of priority) {
      const spendable = Math.min(genericLeft, player.manaPool[color]);
      player.manaPool[color] -= spendable;
      genericLeft -= spendable;
      if (genericLeft <= 0) break;
    }
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


  public static autoTapLandsForCost(state: any, playerId: string, costStr: string, log: (m: string) => void, tapForManaCallback: (p: string, c: string) => void) {
    const player = state.players[playerId];
    if (!player) return;
    const requirements = this.parseManaCost(costStr);
    
    const requirementsArray: (keyof typeof player.manaPool)[] = [];
    Object.entries(requirements.colored).forEach(([c, amt]) => {
       for(let i=0; i<amt; i++) requirementsArray.push(c as any);
    });
    for(let i=0; i<requirements.generic; i++) requirementsArray.push('C');

    for (const req of requirementsArray) {
       if (req === 'C') continue; 

       const poolVal = player.manaPool[req as keyof typeof player.manaPool] || 0;
       
       if (poolVal > 0) continue; 
       
       const landToTap = state.battlefield.find((obj: any) => {
          const types = (obj.definition.types || obj.definition.typeLine || obj.definition.type_line || "").toString().toLowerCase();
          if (obj.controllerId !== playerId || obj.isTapped || !types.includes('land')) return false;
          const name = obj.definition.name.toLowerCase();
          if (req === 'W' && name.includes('plains')) return true;
          if (req === 'U' && name.includes('island')) return true;
          if (req === 'B' && name.includes('swamp')) return true;
          if (req === 'R' && name.includes('mountain')) return true;
          if (req === 'G' && name.includes('forest')) return true;
          return false;
       });

       if (landToTap) tapForManaCallback(playerId, landToTap.id);
    }

    let genericNeeded = requirements.generic;
    const floatPoolVal = Object.values(player.manaPool).reduce((a, b: any) => a + b, 0);

    for (let i = 0; i < genericNeeded; i++) {
        const landToTap = state.battlefield.find((obj: any) => {
           const types = (obj.definition.types || obj.definition.typeLine || obj.definition.type_line || "").toString().toLowerCase();
           return obj.controllerId === playerId && !obj.isTapped && types.includes('land');
        });
        if (landToTap) tapForManaCallback(playerId, landToTap.id);
    }
  }
}

