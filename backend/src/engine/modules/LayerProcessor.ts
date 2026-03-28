import { GameObject } from '@shared/engine_types';

/**
 * Rules Engine Module: Continuous Effects Architecture (Chapter 6)
 */
export class LayerProcessor {
  
  /**
   * CR 613.4: Interaction of Continuous Effects within Layer 7 (Power/Toughness)
   * This is the single source of truth for an object's current combat stats.
   */
  public static getEffectivePower(obj: GameObject): number {
    // Layer 7a: Base Power (from definition)
    const base = parseInt(obj.definition.power || '0') || 0;
    
    // Layer 7c: Effects that modify P/T (e.g., Counters)
    const fromCounters = (obj.counters?.['+1/+1'] || 0) - (obj.counters?.['-1/-1'] || 0);
    
    // Layer 7e: Effects that switch P/T (not implemented yet)
    
    return Math.max(0, base + fromCounters);
  }

  /**
   * CR 613.4: Layer 7 for Toughness
   */
  public static getEffectiveToughness(obj: GameObject): number {
    const base = parseInt(obj.definition.toughness || '0') || 0;
    const fromCounters = (obj.counters?.['+1/+1'] || 0) - (obj.counters?.['-1/-1'] || 0);
    
    return Math.max(0, base + fromCounters);
  }

  /**
   * CR 613.1f: Layer 6 - Ability-adding effects, ability-removing effects
   * Combines static keywords with dynamic ones gained during the game.
   */
  public static getEffectiveKeywords(obj: GameObject): string[] {
    // Merge base keywords with dynamic ones (e.g., from an Aura or Equipment)
    const allKeywords = new Set([...obj.definition.keywords, ...obj.keywords]);
    return Array.from(allKeywords);
  }

  /**
   * Convenience check for specific keywords (Flying, Trample, etc.)
   */
  public static hasKeyword(obj: GameObject, keyword: string): boolean {
    return this.getEffectiveKeywords(obj).includes(keyword);
  }
}
