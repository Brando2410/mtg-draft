import { GameObject, GameState, ContinuousEffect } from '@shared/engine_types';

/**
 * Rules Engine Module: Continuous Effects Architecture (Chapter 6)
 * This is the "Pipeline" that calculates effective stats based on the "Whiteboard" (Registry).
 */
export class LayerProcessor {
  
  /**
   * CR 613: Interaction of Continuous Effects
   * Returns a copy of the object's stats after applying all relevant layers.
   */
  public static getEffectiveStats(obj: GameObject, state: GameState) {
    // 1. Pre-filter and Sort Effects (CR 613.7)
    const effects = state.ruleRegistry.continuousEffects
      .filter(e => {
        // Special case: Global or Floating effects (e.g. from resolved spells)
        if (e.sourceId === 'global' || e.sourceId === 'floating') return true;

        // Standard case: Source must be in an active zone
        const source = state.battlefield.find(o => o.id === e.sourceId) || 
                       state.exile.find(o => o.id === e.sourceId);
        
        if (!source) return false;
        return e.activeZones.includes(source.zone);
      })
      .sort((a, b) => (a.layer - b.layer) || (a.timestamp - b.timestamp));

    // 2. LAYER 1: Copiable Values (Rule 707)
    let currentDefinition = { ...obj.definition };
    
    // LAYER 2: Control (CR 613.1b)
    // Handled in separate method getEffectiveController to avoid P/T circularity
    
    const copyEffects = effects.filter(e => e.layer === 1);
    for (const effect of copyEffects) {
        if (this.isTarget(state, effect, obj.id) && effect.copyFromId) {
            const sourceObj = state.battlefield.find(o => o.id === effect.copyFromId);
            if (sourceObj) {
                currentDefinition = { ...sourceObj.definition };
            }
        }
    }

    // 3. Initialize working stats
    let power = parseInt(currentDefinition.power || '0') || 0;
    let toughness = parseInt(currentDefinition.toughness || '0') || 0;
    let keywords = new Set([...(currentDefinition.keywords || []), ...(obj.keywords || [])]);

    // 4. APPLY REMAINING LAYERS (2-7)
    for (const effect of effects) {
      if (effect.layer === 1) continue; 
      if (!this.isTarget(state, effect, obj.id)) continue;

      // Layer 6: Ability Adding/Removing
      if (effect.layer === 6) {
        if (effect.removeAllAbilities) {
            keywords.clear(); 
        }
        effect.abilitiesToAdd?.forEach(k => keywords.add(k));
        effect.abilitiesToRemove?.forEach(k => keywords.delete(k));
      }

      // Layer 7: Power/Toughness
      if (effect.layer === 7) {
        if (effect.powerSet !== undefined) power = effect.powerSet;
        if (effect.toughnessSet !== undefined) toughness = effect.toughnessSet;
        if (effect.powerModifier) power += effect.powerModifier;
        if (effect.toughnessModifier) toughness += effect.toughnessModifier;
      }
    }

    // Layer 7d: Counters (Rule 613.4c)
    const plus1 = (obj.counters?.['+1/+1'] || 0) + (obj.counters?.['1/1'] || 0);
    const minus1 = (obj.counters?.['-1/-1'] || 0) + (obj.counters?.['-1/-1_counter'] || 0);
    
    const counterBonus = plus1 - minus1;
    power += counterBonus;
    toughness += counterBonus;

    return {
      power: Math.max(0, power),
      toughness: Math.max(0, toughness),
      keywords: Array.from(keywords)
    };
  }

  /**
   * CR 613.1b: Layer 2 - Control-changing effects
   */
  public static getEffectiveController(obj: GameObject, state: GameState): string {
    const effects = state.ruleRegistry.continuousEffects
      .filter(e => e.layer === 2 && this.isTarget(state, e, obj.id))
      .sort((a, b) => (a.timestamp - b.timestamp));

    let controllerId = obj.controllerId;
    for (const effect of effects) {
      if (effect.targetControllerId) {
        controllerId = effect.targetControllerId;
      }
    }
    return controllerId;
  }

  private static isTarget(state: GameState, effect: ContinuousEffect, objId: string): boolean {
    if (effect.targetIds) return effect.targetIds.includes(objId);
    
    // Evaluate dynamic target mapping if targetIds is not explicitly set
    if (effect.targetMapping) {
       const obj = state.battlefield.find(o => o.id === objId);
       if (!obj) return false;

       switch (effect.targetMapping) {
         case 'ALL_CREATURES_YOU_CONTROL':
           return obj.controllerId === effect.controllerId && obj.definition.types.some(t => t.toLowerCase() === 'creature');
         case 'OTHER_CREATURES_YOU_CONTROL':
           return obj.id !== effect.sourceId && obj.controllerId === effect.controllerId && obj.definition.types.some(t => t.toLowerCase() === 'creature');
       }
    }
    return true; // Fallback to global if no specific mapping restricts it
  }

  // Helper methods...
  public static getEffectivePower(obj: GameObject, state: GameState): number {
    return this.getEffectiveStats(obj, state).power;
  }

  public static getEffectiveToughness(obj: GameObject, state: GameState): number {
    return this.getEffectiveStats(obj, state).toughness;
  }

  public static getEffectiveKeywords(obj: GameObject, state: GameState): string[] {
    return this.getEffectiveStats(obj, state).keywords;
  }

  /**
   * Convenience check for specific keywords
   */
  public static hasKeyword(obj: GameObject, state: GameState, keyword: string): boolean {
    return this.getEffectiveKeywords(obj, state).includes(keyword);
  }
}
