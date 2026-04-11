import { GameState, GameObject, ContinuousEffect, PlayerId, GameObjectId, Zone } from '@shared/engine_types';
import { ConditionProcessor } from '../core/ConditionProcessor';
import { TargetingProcessor } from '../actions/TargetingProcessor';

/**
 * CR 613: Interaction of Continuous Effects
 * This is the "Pipeline" that calculates effective stats based on the "Whiteboard" (Registry).
 */
export class LayerProcessor {

  /**
   * CR 613: Interaction of Continuous Effects
   * Returns a copy of the object's stats after applying all relevant layers.
   */
  public static getEffectiveStats(obj: GameObject, state: GameState) {
    const effects = state.ruleRegistry.continuousEffects || [];

    // 1. FILTER RELEVANT EFFECTS (Rule 613.1)
    // An effect applies to an object if its condition (if any) is met 
    // AND the source is in an active zone (for static abilities).
    const activeEffects = effects.filter(e => {
        // Rule 611.2a: Floating effects do not depend on source zone
        if (e.id?.startsWith('floating_') || e.sourceId === 'global') return true;
        
        const source = state.battlefield.find(o => o.id === e.sourceId);
        if (!source || !e.activeZones.includes(source.zone)) return false;

        if (e.condition) {
            return ConditionProcessor.matchesCondition(state, e.condition, e.sourceId, e.controllerId);
        }
        return true;
    });

    // 2. LAYER 1: Copiable Values (Rule 707)
    let currentDefinition = { ...obj.definition };
    const copyEffects = activeEffects.filter(e => e.layer === 1);
    for (const effect of copyEffects) {
      if (this.isTarget(state, effect, obj.id) && effect.copyFromId) {
        const sourceObj = state.battlefield.find(o => o.id === effect.copyFromId);
        if (sourceObj) {
          currentDefinition = { ...sourceObj.definition };
        }
      }
    }

    // 3. Initialize working stats
    let power = parseInt(currentDefinition.power || '0');
    let toughness = parseInt(currentDefinition.toughness || '0');
    const keywords = new Set<string>(currentDefinition.keywords || []);
    const colors = new Set<string>(currentDefinition.colors || []);
    const types = new Set<string>(currentDefinition.types || []);
    const subtypes = new Set<string>(currentDefinition.subtypes || []);

    // 4. APPLY REMAINING LAYERS (2-7)
    for (const effect of activeEffects) {
      if (effect.layer === 1) continue;
      if (!this.isTarget(state, effect, obj.id)) continue;

      // Layer 4: Type-changing effects
      effect.typesToAdd?.forEach(t => types.add(t));
      effect.subtypesToAdd?.forEach(s => subtypes.add(s));

      // Layer 5: Color-changing effects
      effect.colorsToAdd?.forEach(c => colors.add(c));
      if (effect.colorSet) {
          colors.clear();
          effect.colorSet.forEach(c => colors.add(c));
      }

      // Layer 6: Ability Adding/Removing
      // We process Layer 6 if the effect explicitly targets layer 6 OR has ability-related properties
      if (effect.layer === 6 || effect.abilitiesToAdd || effect.abilitiesToRemove || effect.removeAllAbilities) {
        if (effect.removeAllAbilities) {
          keywords.clear();
        }
        effect.abilitiesToAdd?.forEach(k => {
            keywords.add(k);
            console.log(`[LAYER 6] Added keyword ${k} to ${obj.id}`);
        });
        effect.abilitiesToRemove?.forEach(k => keywords.delete(k));
      }

      // Layer 7a, 7b: Power/Toughness Set/Dynamic
      if (effect.layer === 7 || effect.powerSet !== undefined || effect.toughnessSet !== undefined || effect.powerDynamic || effect.toughnessDynamic) {
        this.applyLayer7(state, effect, obj, (p, t) => {
            power = p !== undefined ? p : power;
            toughness = t !== undefined ? t : toughness;
            console.log(`[LAYER 7] Updated PT of ${obj.id} to ${power}/${toughness}`);
        });
      }
    }

    // 5. LAYER 7c: Power/Toughness Modifiers (CR 613.4c)
    for (const effect of activeEffects) {
      if (!this.isTarget(state, effect, obj.id)) continue;
      if (effect.layer === 7 || effect.powerModifier !== undefined || effect.toughnessModifier !== undefined) {
        let pMod = effect.powerModifier !== undefined ? Number(effect.powerModifier) : 0;
        let tMod = effect.toughnessModifier !== undefined ? Number(effect.toughnessModifier) : 0;

        if (effect.powerDynamic === 'attacking_dogs_count') {
            pMod += state.combat?.attackers.filter(a => {
                const attacker = state.battlefield.find(o => o.id === a.attackerId);
                return attacker && attacker.id !== obj.id && attacker.definition.subtypes.some(s => s.toLowerCase() === 'dog');
            }).length || 0;
        }

        power += pMod;
        toughness += tMod;
      }
    }

    // 6. LAYER 7d: Counters (Rule 613.4c)
    const plus1 = (obj.counters?.['+1/+1'] || 0) + (obj.counters?.['+1/+1_counter'] || 0);
    const minus1 = (obj.counters?.['-1/-1'] || 0) + (obj.counters?.['-1/-1_counter'] || 0);
    const counterBonus = plus1 - minus1;
    power += counterBonus;
    toughness += counterBonus;

    return {
      power,
      toughness,
      keywords: Array.from(keywords),
      colors: Array.from(colors),
      types: Array.from(types),
      subtypes: Array.from(subtypes)
    };
  }

  private static applyLayer7(state: GameState, effect: ContinuousEffect, obj: GameObject, update: (p?: number, t?: number) => void) {
      // Sublayer 7a: Characteristic-defining abilities
      if ((effect as any).powerDynamic === 'INSTANTS_AND_SORCERIES_IN_GRAVEYARD') {
        const player = state.players[obj.controllerId];
        if (player) {
          const count = player.graveyard.filter(c => c.definition.types.some(t => t.toLowerCase() === 'instant' || t.toLowerCase() === 'sorcery')).length;
          update(count, count);
        }
      }

      if ((effect as any).powerDynamic === 'GREATEST_POWER_IN_GRAVEYARD') {
          const player = state.players[obj.controllerId];
          if (player) {
              const powers = player.graveyard
                  .filter(c => c.definition.types.some(t => t.toLowerCase() === 'creature'))
                  .map(c => parseInt(c.definition.power || '0'));
              const maxPower = powers.length > 0 ? Math.max(...powers) : 0;
              update(maxPower, undefined);
          }
      }

      // Sublayer 7b: Effects that set power and/or toughness
      if (effect.powerSet !== undefined || effect.toughnessSet !== undefined) {
          update(
              effect.powerSet !== undefined ? Number(effect.powerSet) : undefined,
              effect.toughnessSet !== undefined ? Number(effect.toughnessSet) : undefined
          );
      }
  }

  public static isTarget(state: GameState, effect: ContinuousEffect, objId: string): boolean {
    // 1. Explicit target list (snapshotted spells)
    if (Array.isArray(effect.targetIds)) return effect.targetIds.includes(objId);

    // 2. Dynamic target mapping (Static abilities)
    if (effect.targetMapping) {
      const obj = TargetingProcessor.findObjectInAnyZone(state, objId);
      if (!obj) return false;

      switch (effect.targetMapping) {
        case 'SELF':
          return objId === effect.sourceId;
        case 'ALL_CREATURES_YOU_CONTROL':
          return obj.controllerId === effect.controllerId && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        case 'ALL_PERMANENTS_YOU_CONTROL':
          return obj.controllerId === effect.controllerId;
        case 'OTHER_CREATURES_YOU_CONTROL':
          return obj.id !== effect.sourceId && obj.controllerId === effect.controllerId && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        case 'ALL_OTHER_CATS_YOU_CONTROL':
          return obj.id !== effect.sourceId && obj.controllerId === effect.controllerId && obj.definition.subtypes.some((s: string) => s.toLowerCase() === 'cat');
        case 'MATCHING_PERMANENTS_YOU_CONTROL':
          return obj.controllerId === effect.controllerId && TargetingProcessor.matchesRestrictions(state, obj, effect.restrictions || [], effect.controllerId, effect.sourceId);
        case 'MATCHING_PERMANENTS':
          return TargetingProcessor.matchesRestrictions(state, obj, effect.restrictions || [], effect.controllerId, effect.sourceId);
        case 'ALL_CREATURES_OPPONENTS_CONTROL':
        case 'OPPONENTS_CREATURES':
          return obj.controllerId !== effect.controllerId && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        case 'ALL_PERMANENTS_OPPONENTS_CONTROL':
          return obj.controllerId !== effect.controllerId;
        case 'ALL_OTHER_CREATURES':
          return obj.id !== effect.sourceId && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        case 'ENCHANTED_CREATURE':
        case 'ENCHANTED_PERMANENT': {
          const source = state.battlefield.find(o => o.id === effect.sourceId);
          return !!source && (source as any).attachedTo === objId;
        }
        default:
          return false;
      }
    }

    return true;
  }

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
      player.virtualHand = [];
      player.graveyard.forEach(card => {
        const hasPermission = PriorityProcessor.findPermissionEffect(state, player.id, 'AllowCastFromGraveyard', card.id);
        if (hasPermission) {
          player.virtualHand.push(card);
        }
      });

      state.exile.forEach(card => {
        if (card.controllerId === player.id) {
          const hasPermission = PriorityProcessor.findPermissionEffect(state, player.id, 'AllowPlayExiled', card.id);
          if (hasPermission) {
            player.virtualHand.push(card);
          }
        }
      });

      // Top of library
      if (player.library.length > 0) {
        const topCard = player.library[player.library.length - 1];
        const hasPermission = PriorityProcessor.findPermissionEffect(state, player.id, 'AllowPlayFromTop', topCard.id);
        if (hasPermission) {
          player.virtualHand.push(topCard);
        }
      }
    });

    // 3. Update effective stats for all objects in all zones (to set isPlayable correctly)
    [...state.battlefield, ...Object.values(state.players).flatMap(p => [...p.hand, ...p.graveyard, ...p.library, ...p.virtualHand]), ...state.exile].forEach(obj => {
      const stats = this.getEffectiveStats(obj, state);
      const isPlayable = state.priorityPlayerId === obj.controllerId && PriorityProcessor.canObjectBePlayed(state, obj.controllerId, obj.id);
      obj.effectiveStats = { ...stats, isPlayable };
    });
  }
}
