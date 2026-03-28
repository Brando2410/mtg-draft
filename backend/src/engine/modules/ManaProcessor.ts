import { PlayerState } from '@shared/engine_types';

/**
 * Handle Mana Pool, Cost Analysis, and Payments (Chapters 106 & 117)
 */
export class ManaProcessor {

  public static canPayManaCost(player: PlayerState, costStr: string): boolean {
    if (!costStr) return true;
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
    if (!costStr) return true;
    const requirements = this.parseManaCost(costStr);
    
    // 1. Calculate potential mana pool (Pool + untapped basic lands)
    const potential = { ...player.manaPool };
    let totalPotentialCount = 0;

    battlefield.forEach(obj => {
      if (obj.controllerId === player.id && !obj.isTapped && (obj.definition.type_line || '').toLowerCase().includes('land')) {
        const name = obj.definition.name.toLowerCase();
        if (name.includes('plains')) potential.W++;
        else if (name.includes('island')) potential.U++;
        else if (name.includes('swamp')) potential.B++;
        else if (name.includes('mountain')) potential.R++;
        else if (name.includes('forest')) potential.G++;
        else potential.C++; // Waste or utility land
      }
    });

    totalPotentialCount = Object.values(potential).reduce((a, b: number) => a + b, 0);

    // 2. Check colored requirements strictly
    for (const [color, requiredAmount] of Object.entries(requirements.colored)) {
      if (potential[color as keyof typeof potential] < (requiredAmount as number)) {
        return false; // Lacks specific color
      }
      // Subtract used colored mana from total potential for generic check
      totalPotentialCount -= (requiredAmount as number);
    }

    // 3. Check generic requirement against remaining mana
    return totalPotentialCount >= requirements.generic;
  }

  public static deductManaCost(player: PlayerState, costStr: string) {
    if (!costStr) return;
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
}
