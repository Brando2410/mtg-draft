import { PlayerState } from '@shared/engine_types';

/**
 * Handle Mana Pool, Cost Analysis, and Payments (Chapters 106 & 117)
 */
export class ManaProcessor {

  public static canPayManaCost(player: PlayerState, costStr: string): boolean {
    if (!costStr || player.manaCheat) return true;
    const requirements = this.parseManaCost(costStr);
    
    // Check colored mana first (Rule 117.1)
    for (const [color, amount] of Object.entries(requirements.colored)) {
      if ((player.manaPool[color as keyof typeof player.manaPool] || 0) < amount) return false;
    }

    // Check generic/colorless remainder (Rule 107.4)
    const totalFloating = Object.values(player.manaPool).reduce((a, b) => a + b, 0);
    const totalRequired = Object.values(requirements.colored).reduce((a, b) => a + b, 0) + requirements.generic;
    
    return totalFloating >= totalRequired;
  }

  /**
   * Fast estimation for auto-pass logic.
   * Checks if total available mana (Pool + untapped lands) can pay for the cost.
   * Assumes colored requirements can be met if total amount is high enough (approximation).
   */
  public static canPayWithTotal(player: PlayerState, battlefield: any[], costStr: string): boolean {
    if (!costStr || player.manaCheat) return true;
    const requirements = this.parseManaCost(costStr);
    
    // 1. Calculate potential mana pool (Pool + untapped basic lands)
    const potential = { ...player.manaPool };
    let totalPotentialCount = 0;

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

    totalPotentialCount = Object.values(potential).reduce((a, b: number) => a + b, 0);

    // 2. Check colored requirements strictly
    for (const [color, requiredAmount] of Object.entries(requirements.colored)) {
      if ((potential[color as keyof typeof potential] || 0) < (requiredAmount as number)) {
        return false; 
      }
      totalPotentialCount -= (requiredAmount as number);
    }

    // 3. Check generic requirement against remaining mana
    return totalPotentialCount >= requirements.generic;
  }

  public static deductManaCost(player: PlayerState, costStr: string) {
    if (!costStr || player.manaCheat) return;
    const requirements = this.parseManaCost(costStr);

    // Rule 117.3c: Colored mana is spent first
    for (const [color, amount] of Object.entries(requirements.colored)) {
      player.manaPool[color as keyof typeof player.manaPool] -= amount;
    }

    // Rule 117.4: Generic costs can be satisfied by any type
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

    // Refund colored mana
    for (const [color, amount] of Object.entries(requirements.colored)) {
      player.manaPool[color as keyof typeof player.manaPool] += amount;
    }

    // Refund generic mana as colorless by default
    player.manaPool['C'] += requirements.generic;
  }


  public static parseManaCost(costStr: string): { colored: Record<string, number>, generic: number } {
    const colored: Record<string, number> = {};
    let generic = 0;
    
    // Rule 107.4: Mana symbols are enclosed in braces
    const matches = costStr.match(/\{([^}]+)\}/g) || [];
    for (const m of matches) {
      const symbol = m.replace(/\{|\}/g, '');
      if (['W', 'U', 'B', 'R', 'G', 'C'].includes(symbol)) {
        colored[symbol] = (colored[symbol] || 0) + 1;
      } else if (!isNaN(parseInt(symbol, 10))) {
        generic += parseInt(symbol, 10);
      }
    }
    
    return { colored, generic };
  }

  /**
   * Rule 202.3: The mana value of an object is the total amount of mana in its mana cost, regardless of color.
   */
  public static getManaValue(costStr: string): number {
    if (!costStr) return 0;
    const { colored, generic } = this.parseManaCost(costStr);
    const coloredTotal = Object.values(colored).reduce((a, b) => a + b, 0);
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

