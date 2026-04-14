import { GameState, GameObjectId, PlayerId, GameObject, Zone, GameEvent, ConditionType } from '@shared/engine_types';

/**
 * Rules Engine Module: Condition Evaluation
 * Evaluates declarative strings and logic checks against the current game state.
 * 
 * DESIGN: Shared utility to break circular dependencies between Effects and Layers.
 */
export class ConditionProcessor {

  /**
   * CR 608.2c: Evaluates a condition string against the state.
   */
  public static matchesCondition(
    state: GameState, 
    condition: ConditionType | undefined, 
    sourceId: GameObjectId, 
    controllerId: PlayerId, 
    event?: GameEvent
  ): boolean {
    if (!condition) return true;

    // Support for multiple conditions: CONDITION_1 && CONDITION_2
    if (condition.includes('&&')) {
      return condition.split('&&').every(c => this.matchesCondition(state, c.trim(), sourceId, controllerId, event));
    }

    // Parameterized conditions: HAS_PERMANENT:creature,power>=4
    if (condition.includes(':')) {
      const [type, params] = condition.split(':');
      const restrictions = params.split(',').map(r => r.trim());
      
      // We use a local require for TargetingProcessor to avoid top-level circularity if needed, 
      // but ideally TargetingProcessor should also be refactored.
      const { TargetingProcessor } = require('../actions/TargetingProcessor');

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
          const targetId = (event as any)?.targetIds?.[targetIdx] || (event as any)?.targets?.[targetIdx] || (event as any)?.targetId;
          if (!targetId) return false;
          const targetObj = state.battlefield.find(o => o.id === targetId) ||
            state.exile.find(o => o.id === targetId) ||
            Object.values(state.players).flatMap(p => [...p.hand, ...p.graveyard, ...p.library]).find(o => o.id === targetId);
          if (!targetObj) return false;
          return TargetingProcessor.matchesRestrictions(state, targetObj, restrictions, controllerId, sourceId);
        case 'TARGET_1_COUNTERS_P1P1': {
          const tId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0];
          const obj = state.battlefield.find(o => o.id === tId);
          return (obj?.counters?.['+1/+1'] || 0) >= parseInt(restrictions[0]);
        }
        case 'EVENT_MANA_VALUE_GE': {
          const threshold = parseInt(restrictions[0]);
          const obj = event?.data?.object || event?.data?.card || event?.data?.copy || (event as any)?.gameObject;
          if (!obj) return false;
          const { ManaProcessor } = require('./../magic/ManaProcessor');
          return ManaProcessor.getManaValue(obj.definition.manaCost) >= threshold;
        }
        case 'DRAWN_CARDS_GE':
          const threshold = parseInt(restrictions[0]);
          return (state.turnState.cardsDrawnThisTurn[controllerId] || 0) >= threshold;
        case 'X_EQUALS': {
          const xValue = (event as any)?.xValue || 0;
          return xValue === parseInt(restrictions[0]);
        }
        case 'X_GE': {
          const xValue = (event as any)?.xValue || 0;
          return xValue >= parseInt(restrictions[0]);
        }
        case 'SPENT_MANA_GE':
        case 'SPENT_MANA_LT': {
          const threshold = parseInt(restrictions[0]);
          const spent = (event as any)?.data?.card?.paidManaValue || (event as any)?.eventData?.spent || 0;
          return type === 'SPENT_MANA_GE' ? spent >= threshold : spent < threshold;
        }
        case 'SPELL_IS_MULTICOLORED': {
            const card = event?.data?.card || event?.data?.object || (event as any)?.gameObject;
            if (!card) return false;
            return (card.definition.colors || []).length > 1;
        }
        case 'COUNTER_GE': {
          const countType = restrictions[0];
          const threshold = parseInt(restrictions[1]);
          const obj = state.battlefield.find(o => o.id === sourceId);
          if (!obj) return false;
          const count = obj.counters?.[countType] || 0;
          return count >= threshold;
        }
        case 'EVENT_SPELL_TARGET_MATCHES': {
          const targets = event?.data?.stackSnapshot?.targets || [];
          if (!targets.length) return false;
          return targets.some((tid: string) => {
            const obj = TargetingProcessor.findObjectInAnyZone(state, tid);
            if (!obj) return false;
            return TargetingProcessor.matchesRestrictions(state, obj, restrictions, controllerId, sourceId);
          });
        }
        case 'OTHER_LANDS_LE': {
          const threshold = parseInt(restrictions[0]);
          const count = state.battlefield.filter(o => o.id !== sourceId && o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'land')).length;
          return count <= threshold;
        }
        case 'SPENT_MANA_GT_POWER_OR_TOUGHNESS': {
          const spent = (event as any)?.amount || (event as any)?.data?.card?.paidManaValue || 0;
          const obj = state.battlefield.find(o => o.id === sourceId);
          if (!obj) return false;
          const { LayerProcessor } = require('./../state/LayerProcessor');
          const stats = LayerProcessor.getEffectiveStats(obj, state);
          return spent > stats.power || spent > stats.toughness;
        }
        case 'ARTIFACT_COUNT_GE':
        case 'LAND_COUNT_GE': {
          const threshold = parseInt(restrictions[0]);
          const targetType = type.includes('ARTIFACT') ? 'Artifact' : 'Land';
          return state.battlefield.filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === targetType.toLowerCase())).length >= threshold;
        }
        case 'TOTAL_TOUGHNESS_GE': {
          const threshold = parseInt(restrictions[0]);
          const { LayerProcessor } = require('./../state/LayerProcessor');
          const total = state.battlefield
            .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
            .reduce((sum, obj) => sum + LayerProcessor.getEffectiveStats(obj, state).toughness, 0);
          return total >= threshold;
        }
        case 'GRAVEYARD_COUNT_GE': {
          const threshold = parseInt(restrictions[0]);
          return (state.players[controllerId]?.graveyard.length || 0) >= threshold;
        }
        case 'GRAVEYARD_CREATURE_COUNT_GE': {
          const threshold = parseInt(restrictions[0]);
          return (state.players[controllerId]?.graveyard.filter(c => (c.definition.types || []).some(t => t.toLowerCase() === 'creature')).length || 0) >= threshold;
        }
        case 'IS_FLASHBACK_CAST': {
          return (stackObject as any)?.isFlashbackCast === true;
        }
        case 'CONTROL_SUBTYPE_GE': {
            const subtype = restrictions[0];
            const threshold = parseInt(restrictions[1]) || 1;
            return state.battlefield.filter(o => o.controllerId === controllerId && (o.definition.subtypes || []).some(s => s.toLowerCase() === subtype.toLowerCase())).length >= threshold;
        }
        case 'CREATURES_DIED_COUNT_GE': {
            const threshold = parseInt(restrictions[0]);
            return (state.turnState.creaturesDiedThisTurn.length || 0) >= threshold;
        }
      }
    }

    // Generic/Legacy strings
    switch (condition.toUpperCase()) {
      case 'SPELL_TARGETS_SOURCE': {
        const targets = (event?.data as any)?.targets || [];
        return targets.includes(sourceId);
      }
      case 'SPELL_TARGETS_CREATURE': {
        const targets = (event as any)?.targets || (event as any)?.data?.targets || [];
        if (targets.length === 0) return false;
        return targets.some((tid: string) => {
          const obj = state.battlefield.find(o => o.id === tid);
          return obj && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        });
      }
      case 'CARDS_LEFT_YOUR_GRAVEYARD_THIS_TURN':
        return state.turnState.cardLeftGraveyardThisTurn[controllerId] || false;
      case 'IS_YOUR_TURN':
      case 'OUR_TURN':
        return state.activePlayerId === controllerId;
      case 'IS_OPPONENT_TURN':
        return state.activePlayerId !== controllerId;
      case 'EVENT_PLAYER_IS_OPPONENT':
        return event?.playerId !== controllerId;
      case 'IS_OPPONENT_UPKEEP':
        return state.activePlayerId !== controllerId && state.currentStep === 'Upkeep';
      case 'PLAYER_GAINED_LIFE_THIS_TURN':
      case 'LIFE_GAINED_THIS_TURN':
        return (state.turnState.lifeGainedThisTurn[controllerId] || 0) > 0;
      case 'CARDS_EXILED_THIS_TURN':
        return state.turnState.cardsExiledThisTurn[controllerId] || false;
      case 'CREATURE_DIED_UNDER_YOUR_CONTROL_THIS_TURN':
        return state.turnState.creaturesDiedThisTurn.some(c => c.controllerId === controllerId);
      case 'TARGET_1_IS_PREPARED': {
          const targetId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0] || (event as any)?.targetId;
          const targetObj = state.battlefield.find(o => o.id === targetId);
          return targetObj?.isPrepared || false;
      }
      case 'SPELL_IS_CREATURE': {
        const card = event?.data?.card || event?.data?.object;
        return card?.definition.types.some((t: string) => t.toLowerCase() === 'creature') || false;
      }
      case 'HAS_COUNTERS': {
        const obj = state.battlefield.find(o => o.id === sourceId);
        return obj ? Object.values(obj.counters || {}).some(v => (v as number) > 0) : false;
      }
      case 'PUT_COUNTER_ON_SELF_THIS_TURN':
        return state.turnState.countersAddedThisTurnIds?.includes(sourceId) || false;
      case 'NOT_CAST_FROM_HAND':
        return event?.data?.sourceZone !== Zone.Hand && (event as any).sourceZone !== Zone.Hand && (event as any).lastNonStackZone !== Zone.Hand;
      case 'CAST_FROM_HAND':
        return event?.data?.sourceZone === Zone.Hand || (event as any).sourceZone === Zone.Hand || (event as any).lastNonStackZone === Zone.Hand;
      case 'EVENT_PLAYER_IS_CONTROLLER':
      case 'EVENT_PLAYER_IS_YOU':
        return event?.playerId === controllerId;
      case 'TRIGGER_SOURCE_POW_OR_TOUGH_LE_1': {
        const tid = event?.data?.object?.id || event?.targetId;
        const obj = state.battlefield.find(o => o.id === tid);
        if (!obj) return false;
        const { LayerProcessor } = require('./../state/LayerProcessor');
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        return stats.power <= 1 || stats.toughness <= 1;
      }
      case 'TRIGGER_TARGET_IS_SELF':
        return (event?.targetId === sourceId) || (event?.data?.targetId === sourceId);
      case 'TARGETS_TAPPED_CREATURE': {
        const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
        if (!tId) return false;
        const obj = state.battlefield.find(o => o.id === tId);
        return obj && obj.isTapped && obj.definition.types.map((t: string) => t.toLowerCase()).includes('creature') || false;
      }
      case 'HAS_CREATURE_POWER_4_PLUS':
        return state.battlefield.some(obj =>
          obj.controllerId === controllerId &&
          obj.definition.types.some(t => t.toLowerCase() === 'creature') &&
          (parseInt(obj.definition.power || '0') >= 4 || (obj.effectiveStats?.power || 0) >= 4)
        );
      case 'PLAYER_IS_CONTROLLER':
        return event?.playerId === controllerId;
      case 'OBJECT_IS_SELF':
        return true;
      case 'INCREMENT_CHECK': {
        const spent = event?.data?.spent || 0;
        const obj = state.battlefield.find(o => o.id === sourceId);
        if (!obj) return false;
        const { LayerProcessor } = require('./../state/LayerProcessor');
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        return spent > stats.power || spent > stats.toughness;
      }
      case 'REPARTEE_TRIGGER': {
        const isInstantOrSorcery = event?.data?.card?.definition.types.some((t: string) => t.toLowerCase() === 'instant' || t.toLowerCase() === 'sorcery');
        if (!isInstantOrSorcery) return false;
        const targets = event?.data?.targets || [];
        return targets.some((tid: string) => {
            const obj = state.battlefield.find(o => o.id === tid);
            return obj && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        });
      }
      case 'TOP_CARD_IS_GOBLIN': {
        const player = state.players[controllerId];
        if (!player || player.library.length === 0) return false;
        const topCard = player.library[player.library.length - 1];
        return topCard.definition.subtypes?.some((s: string) => s.toLowerCase() === 'goblin') || false;
      }
      case 'HAS_INSTANT_AND_SORCERY_IN_GY': {
        const gy = state.players[controllerId].graveyard;
        const hasInstant = gy.some(c => c.definition.types.some(t => t.toLowerCase() === 'instant' || t.toLowerCase() === 'instant_or_sorcery'));
        const hasSorcery = gy.some(c => c.definition.types.some(t => t.toLowerCase() === 'sorcery' || t.toLowerCase() === 'instant_or_sorcery'));
        return hasInstant && hasSorcery;
      }
      case 'CREATURE_DIED_THIS_TURN':
        return state.turnState.creaturesDiedThisTurn.length > 0;
      case 'GAINED_LIFE_THIS_TURN':
      case 'INFUSION':
        return (state.turnState.lifeGainedThisTurn[controllerId] || 0) > 0;
      case 'TARGET_IS_OPPONENT': {
        const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
        if (!tId) return false;
        return tId !== controllerId;
      }
      case 'SPELL_TARGETS_CREATURE': {
        const targets = (event as any)?.targets || (event as any)?.data?.targets || [];
        const { TargetingProcessor } = require('./../actions/TargetingProcessor');
        return targets.some((tid: string) => {
          const obj = state.battlefield.find(o => o.id === tid) || TargetingProcessor.findObjectInAnyZone(state, tid);
          return obj && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        });
      }
      case 'OWN_CREATURE_ENTERS': {
        const obj = event?.data?.object || (event as any)?.gameObject;
        if (!obj) return false;
        return obj.controllerId === controllerId && obj.definition.types.map((t: string) => t.toLowerCase()).includes('creature');
      }
      case 'TARGET_IS_INSTANT_OR_SORCERY': {
        const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
        if (!tId) return false;
        const targetObj = state.stack.find(s => s.id === tId)?.card || state.battlefield.find(o => o.id === tId);
        if (!targetObj) return false;
        const types = targetObj.definition.types.map((t: string) => t.toLowerCase());
        return types.includes('instant') || types.includes('sorcery');
      }
      case 'IS_CREATURE': {
          const tId = (event as any)?.targetId || sourceId;
          const obj = state.battlefield.find(o => o.id === tId);
          if (!obj) return false;
          const { LayerProcessor } = require('./../state/LayerProcessor');
          const stats = LayerProcessor.getEffectiveStats(obj, state);
          return stats.types.some((t: string) => t.toLowerCase() === 'creature');
      }
      case 'NOT_CREATURE': {
          const tId = (event as any)?.targetId || sourceId;
          const obj = state.battlefield.find(o => o.id === tId);
          if (!obj) return true;
          const { LayerProcessor } = require('./../state/LayerProcessor');
          const stats = LayerProcessor.getEffectiveStats(obj, state);
          return !stats.types.some((t: string) => t.toLowerCase() === 'creature');
      }
      case 'CAST_INSTANT_SORCERY_THIS_TURN':
        return state.turnState.instantOrSorceryCastThisTurn[controllerId] || false;
      case 'CAST_ANOTHER_SPELL_THIS_TURN':
        return (state.turnState.spellsCastThisTurn[controllerId] || 0) > 1;
      case 'TARGET_1_IS_CONTROLLER': {
        const tId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0] || (event as any)?.targetId;
        return tId === controllerId;
      }
      case 'TARGET_1_EXISTS': {
        return !!((event as any)?.targetIds?.[0] || (event as any)?.targets?.[0] || (event as any)?.targetId);
      }
      case 'TARGET_2_EXISTS': {
        return !!((event as any)?.targetIds?.[1] || (event as any)?.targets?.[1]);
      }
      case 'TARGET_3_EXISTS': {
        return !!((event as any)?.targetIds?.[2] || (event as any)?.targets?.[2]);
      }
      case 'OPPONENT_HAS_MORE_CARDS': {
        const player = state.players[controllerId];
        if (!player) return false;
        return Object.values(state.players).some(p => p.id !== controllerId && p.hand.length > player.hand.length);
      }
      case 'OPPONENT_CONTROLS_MORE_CREATURES': {
          const myCreatures = state.battlefield.filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature')).length;
          const opponentId = Object.keys(state.players).find(id => id !== controllerId);
          if (!opponentId) return false;
          const oppCreatures = state.battlefield.filter(o => o.controllerId === opponentId && o.definition.types.some(t => t.toLowerCase() === 'creature')).length;
          return oppCreatures > myCreatures;
      }
      case 'OWN_CREATURE_DIES': {
        const obj = event?.data?.object || (event as any)?.gameObject;
        if (!obj) return false;
        return obj.controllerId === controllerId && obj.definition.types.map((t: string) => t.toLowerCase()).includes('creature');
      }
      case 'SPENT_MANA_GE': {
        const val = parseInt(condition.split(':')[1]);
        const spent = event?.data?.spentMana || 0;
        return spent >= val;
      }
      case 'SPENT_MANA_LT': {
        const val = parseInt(condition.split(':')[1]);
        const spent = event?.data?.spentMana || 0;
        return spent < val;
      }
      case 'SPENT_MANA_LE': {
        const val = parseInt(condition.split(':')[1]);
        const spent = event?.data?.spentMana || 0;
        return spent <= val;
      }
      case 'SPENT_MANA_GT_POWER_OR_TOUGHNESS': {
        const spent = event?.data?.spentMana || 0;
        const source = state.battlefield.find(o => o.id === sourceId);
        if (!source) return false;
        const { LayerProcessor } = require('./../state/LayerProcessor');
        const stats = LayerProcessor.getEffectiveStats(source, state);
        return spent > stats.power || spent > stats.toughness;
      }
      default:
        // Assume true if unknown (safer for gameplay)
        return true;
    }
  }
}
