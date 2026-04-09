import { GameObject, GameState, ContinuousEffect, PlayerId, GameEvent } from '@shared/engine_types';
import { TargetingProcessor } from '../actions/TargetingProcessor';

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
        if (!e.activeZones.includes(source.zone)) return false;

        // Check declarative conditions (if any)
        // Note: recursion depth is managed in getEffectiveStats
        return this.matchesCondition(state, e.condition, e.sourceId, e.controllerId);
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
    let types = new Set([...(currentDefinition.types || [])]);
    let subtypes = new Set([...(currentDefinition.subtypes || [])]);

    // 4. APPLY REMAINING LAYERS (2-7)
    for (const effect of effects) {
      if (effect.layer === 1) continue; 
      if (!this.isTarget(state, effect, obj.id)) continue;

      // Layer 4: Type-changing effects
      if (effect.layer === 4) {
        effect.subtypesToAdd?.forEach(t => subtypes.add(t));
      }

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
        // Sublayer 7a: Characteristic-defining abilities
        if ((effect as any).powerDynamic === 'INSTANTS_AND_SORCERIES_IN_GRAVEYARD') {
            const player = state.players[obj.controllerId];
            if (player) {
                power = player.graveyard.filter(c => c.definition.types.some(t => t.toLowerCase() === 'instant' || t.toLowerCase() === 'sorcery')).length;
            }
        }
        
        // Sublayer 7b: Effects that set power and/or toughness
        if (effect.powerSet !== undefined) power = Number(effect.powerSet);
        if (effect.toughnessSet !== undefined) toughness = Number(effect.toughnessSet);
      }
    }

    // 5. LAYER 7c: Power/Toughness Modifiers (CR 613.4c)
    for (const effect of effects) {
        if (effect.layer === 7 && this.isTarget(state, effect, obj.id)) {
            if (effect.powerModifier !== undefined) power += Number(effect.powerModifier);
            if (effect.toughnessModifier !== undefined) toughness += Number(effect.toughnessModifier);
        }
    }

    // 6. LAYER 7d: Counters (Rule 613.4c)
    const plus1 = (obj.counters?.['+1/+1'] || 0) + (obj.counters?.['1/1'] || 0);
    const minus1 = (obj.counters?.['-1/-1'] || 0) + (obj.counters?.['-1/-1_counter'] || 0);
    
    const counterBonus = plus1 - minus1;
    power += counterBonus;
    toughness += counterBonus;

    return {
      power: Math.max(0, power),
      toughness: Math.max(0, toughness),
      keywords: Array.from(keywords),
      types: Array.from(types),
      subtypes: Array.from(subtypes)
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

  public static matchesCondition(state: GameState, condition: string | undefined, sourceId: string, controllerId: string, event?: GameEvent): boolean {
    if (!condition) return true;

    // Support for multiple conditions: CONDITION_1 && CONDITION_2
    if (condition.includes('&&')) {
        return condition.split('&&').every(c => this.matchesCondition(state, c.trim(), sourceId, controllerId));
    }

    // Parameterized conditions: HAS_PERMANENT:creature,power>=4
    if (condition.includes(':')) {
        const [type, params] = condition.split(':');
        const restrictions = params.split(',').map(r => r.trim());

        switch (type) {
            case 'HAS_PERMANENT':
                return state.battlefield.some(obj => 
                    TargetingProcessor.matchesRestrictions(state, obj, restrictions, controllerId, sourceId)
                );
            case 'NOT_HAS_PERMANENT':
                return !state.battlefield.some(obj => 
                    TargetingProcessor.matchesRestrictions(state, obj, restrictions, controllerId, sourceId)
                );
            case 'PLAYER_HAS_LIFE_GE':
                const life = parseInt(restrictions[0]);
                return (state.players[controllerId as PlayerId]?.life || 0) >= life;
            case 'OPPONENT_HAS_LIFE_LE':
                const oppLife = parseInt(restrictions[0]);
                const opponent = Object.keys(state.players).find(pid => pid !== controllerId);
                return opponent ? (state.players[opponent as PlayerId]?.life || 0) <= oppLife : false;
            case 'EVENT_OBJECT_MATCHES':
                const eventObj = event?.data?.object || (event as any)?.gameObject;
                if (!eventObj) return false;
                return TargetingProcessor.matchesRestrictions(state, eventObj, restrictions, controllerId, sourceId);
            case 'TARGET_1_MATCHES':
            case 'TARGET_2_MATCHES':
                const targetIdx = type === 'TARGET_1_MATCHES' ? 0 : 1;
                const targetId = (event as any)?.targetIds?.[targetIdx] || (event as any)?.targetId;
                if (!targetId) return false;
                const targetObj = state.battlefield.find(o => o.id === targetId) || 
                                  state.exile.find(o => o.id === targetId) ||
                                  Object.values(state.players).flatMap(p => [...p.hand, ...p.graveyard, ...p.library]).find(o => o.id === targetId);
                if (!targetObj) return false;
                return TargetingProcessor.matchesRestrictions(state, targetObj, restrictions, controllerId, sourceId);
        }
    }

    // Generic/Legacy strings
    switch (condition) {
        case 'IS_YOUR_TURN':
            return state.activePlayerId === controllerId;
        case 'HAS_CREATURE_POWER_4_PLUS':
            return state.battlefield.some(obj => 
                obj.controllerId === controllerId && 
                obj.definition.types.some(t => t.toLowerCase() === 'creature') &&
                (parseInt(obj.definition.power || '0') >= 4 || (obj.effectiveStats?.power || 0) >= 4)
            );
        case 'PLAYER_IS_CONTROLLER':
            return true;
        case 'OBJECT_IS_SELF':
            return true;
        default:
            return true;
    }
  }

  private static isTarget(state: GameState, effect: ContinuousEffect, objId: string): boolean {
    // 1. Explicit target list (snapshotted spells like Heroic Intervention)
    //    An empty array [] means "no targets" — affects nothing. Must check Array.isArray.
    if (Array.isArray(effect.targetIds)) return effect.targetIds.includes(objId);

    
    // 2. Dynamic target mapping (Standard for static abilities like Glorious Anthem)
    if (effect.targetMapping) {
       const obj = state.battlefield.find(o => o.id === objId);
       if (!obj) return false;

       switch (effect.targetMapping) {
         case 'ALL_CREATURES_YOU_CONTROL':
           return obj.controllerId === effect.controllerId && obj.definition.types.some(t => t.toLowerCase() === 'creature');
         case 'ALL_PERMANENTS_YOU_CONTROL':
           return obj.controllerId === effect.controllerId;
         case 'OTHER_CREATURES_YOU_CONTROL':
           return obj.id !== effect.sourceId && obj.controllerId === effect.controllerId && obj.definition.types.some(t => t.toLowerCase() === 'creature');
         case 'ALL_OTHER_CATS_YOU_CONTROL':
           return obj.id !== effect.sourceId && obj.controllerId === effect.controllerId && obj.definition.subtypes.some(s => s.toLowerCase() === 'cat');
         case 'MATCHING_PERMANENTS_YOU_CONTROL':
           return obj.controllerId === effect.controllerId && TargetingProcessor.matchesRestrictions(state, obj, effect.restrictions || [], effect.controllerId, effect.sourceId);
         case 'MATCHING_PERMANENTS':
           return TargetingProcessor.matchesRestrictions(state, obj, effect.restrictions || [], effect.controllerId, effect.sourceId);
         case 'ALL_CREATURES_OPPONENTS_CONTROL':
         case 'OPPONENTS_CREATURES':
           return obj.controllerId !== effect.controllerId && obj.definition.types.some(t => t.toLowerCase() === 'creature');
         case 'ALL_PERMANENTS_OPPONENTS_CONTROL':
           return obj.controllerId !== effect.controllerId;
         case 'ALL_OTHER_CREATURES':
           return obj.id !== effect.sourceId && obj.definition.types.some(t => t.toLowerCase() === 'creature');
         default:
           // If a mapping is specified but not handled here, we MUST NOT fall back to global.
           return false; 
       }
    }

    // 3. Global fallback (Only if no targetIds AND no targetMapping restricts the effect)
    return true; 
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
  /**
   * Batch updates all derived fields (P/T, Keywords, isPlayable) for all relevant objects.
   * This should be called after any rule-changing event or zone transition.
   */
  public static updateDerivedStats(state: GameState, PriorityProcessor: any) {
    // 1. Update Battlefield objects
    state.battlefield.forEach(obj => {
        const stats = this.getEffectiveStats(obj, state);

        // --- SUMMONING SICKNESS & HASTE FIX ---
        // CR 302.6: Haste allows creatures to bypass summoning sickness. 
        // We clear the sickness property so that both backend logic and frontend UI (ZZZ tag) 
        // correctly identify that the creature is ready.
        const isCreature = obj.definition.types.some(t => t.toLowerCase() === 'creature');
        if (isCreature && obj.summoningSickness) {
            const hasHaste = stats.keywords.some(k => k.toLowerCase() === 'haste');
            if (hasHaste) {
                obj.summoningSickness = false;
            }
        }

        obj.effectiveStats = {
            ...stats,
            isPlayable: state.priorityPlayerId === obj.controllerId && PriorityProcessor.canObjectBePlayed(state, obj.controllerId, obj.id)
        };
    });

    // 2. Update Hand, Graveyard, and Library cards
    Object.values(state.players).forEach(player => {
        [player.hand, player.graveyard, player.library].forEach(zone => {
            zone.forEach(card => {
                // Determine if it matches the current battlefield/spell logic, 
                // or just fallback to base stats if hidden.
                const stats = this.getEffectiveStats(card, state);
                card.effectiveStats = {
                    ...stats,
                    isPlayable: state.priorityPlayerId === player.id && PriorityProcessor.canObjectBePlayed(state, player.id, card.id)
                };
            });
        });
    });

    // 3. Update Exile
    state.exile.forEach(card => {
        const stats = this.getEffectiveStats(card, state);
        card.effectiveStats = {
            ...stats,
            isPlayable: false
        };
    });
  }
}
