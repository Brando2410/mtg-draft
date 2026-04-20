// ManaParser.ts
import { ManaRequirements } from './ManaTypes';

/**
 * Handle Mana Cost Parsing (Rule 107.4)
 */
export class ManaParser {

  public static parseManaCost(costStr: string): ManaRequirements {
    const colored: Record<string, number> = {};
    let generic = 0;
    let xCount = 0;
    
    // Rule 107.4: Mana symbols are enclosed in braces
    const matches = costStr.match(/\{([^}]+)\}/g) || [];
    if (matches.length === 0 && costStr.length === 1) {
        let symbol = costStr.toUpperCase().trim();
        if (['W', 'U', 'B', 'R', 'G', 'C'].includes(symbol)) {
            colored[symbol] = 1;
            return { colored, generic: 0, xCount: 0 };
        } else if (!isNaN(parseInt(symbol, 10))) {
            return { colored, generic: parseInt(symbol, 10), xCount: 0 };
        }
    }

    for (const m of matches) {
      let symbol = m.replace(/\{|\}/g, '').toUpperCase().trim();
      if (symbol === 'X') {
        xCount++;
      } else if (['W', 'U', 'B', 'R', 'G', 'C'].includes(symbol)) {
        colored[symbol] = (colored[symbol] || 0) + 1;
      } else if (symbol.includes('/')) {
        // Hybrid mana
        colored[symbol] = (colored[symbol] || 0) + 1;
      } else if (!isNaN(parseInt(symbol, 10))) {
        generic += parseInt(symbol, 10);
      }
    }
    
    return { colored, generic, xCount };
  }

  /**
   * Calculates the total Mana Value (MV) of a cost string (Rules 107.4, 202.3).
   * @param xValue The value chosen for X (only relevant for objects on the stack).
   */
  public static getManaValue(costStr: string, xValue: number = 0): number {
    if (!costStr) return 0;
    const { colored, generic, xCount } = this.parseManaCost(costStr);
    
    let coloredTotal = 0;
    for (const [symbol, count] of Object.entries(colored)) {
        if (symbol.startsWith('2/')) {
            // Rule 107.4b: Monocolored hybrid mana value is 2
            coloredTotal += (count * 2);
        } else {
            coloredTotal += count;
        }
    }

    // Rule 202.3e: X is the value chosen while on the stack, otherwise 0.
    return coloredTotal + generic + (xCount * xValue);
  }
}
