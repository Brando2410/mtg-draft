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
    
    // Rule 107.4: Mana symbols are usually enclosed in braces, but we support raw strings for engine flexibility
    const matches = costStr.match(/\{([^}]+)\}/g);
    
    if (!matches) {
        // Handle raw strings like "R", "RR", "ANY", "1", "2"
        const upper = costStr.toUpperCase().trim();
        if (upper === 'ANY') {
            colored['ANY'] = 1;
        } else if (['W', 'U', 'B', 'R', 'G', 'C'].includes(upper)) {
            colored[upper] = 1;
        } else if (!isNaN(parseInt(upper, 10)) && /^\d+$/.test(upper)) {
            generic = parseInt(upper, 10);
        } else {
            // Try to parse as a sequence of symbols: "RR" -> {R: 2}
            const symbols = upper.split('');
            let allValid = true;
            const tempColored: Record<string, number> = {};
            for (const s of symbols) {
                if (['W', 'U', 'B', 'R', 'G', 'C'].includes(s)) {
                    tempColored[s] = (tempColored[s] || 0) + 1;
                } else {
                    allValid = false;
                    break;
                }
            }
            if (allValid && symbols.length > 0) {
                Object.assign(colored, tempColored);
            }
        }
        return { colored, generic, xCount: 0 };
    }

    for (const m of matches) {
      let symbol = m.replace(/\{|\}/g, '').toUpperCase().trim();
      if (symbol === 'X') {
        xCount++;
      } else if (symbol === 'ANY') {
        // Special case for 'any color' mana symbols (like Treasure tokens)
        colored['ANY'] = (colored['ANY'] || 0) + 1;
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
