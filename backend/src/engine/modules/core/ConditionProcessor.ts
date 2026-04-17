import { ConditionType, GameEvent, GameObject, GameObjectId, GameState, PlayerId, TriggerEvent, Zone } from '@shared/engine_types';

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

    // Support for function-based conditions
    if (typeof condition === 'function') {
      return (condition as any)(state, event, { sourceId, controllerId });
    }

    if (typeof condition !== 'string') return true;

    // --- RECURSIVE LOGICAL PARSER (Supports parentheses, &&, ||) ---
    // 1. Handle Parentheses
    if (condition.includes('(')) {
      let result = condition;
      while (result.includes('(')) {
        const lastOpen = result.lastIndexOf('(');
        const nextClose = result.indexOf(')', lastOpen);
        if (nextClose === -1) break; // Malformed

        const subExpr = result.substring(lastOpen + 1, nextClose);
        const subRes = this.matchesCondition(state, subExpr, sourceId, controllerId, event);
        result = result.substring(0, lastOpen) + (subRes ? 'TRUE_VAL' : 'FALSE_VAL') + result.substring(nextClose + 1);
      }
      return this.matchesCondition(state, result, sourceId, controllerId, event);
    }

    // 2. Handle OR (||) - lowest precedence
    if (condition.includes('||')) {
      return condition.split('||').some(c => this.matchesCondition(state, c.trim(), sourceId, controllerId, event));
    }

    // 3. Handle AND (&&)
    if (condition.includes('&&')) {
      return condition.split('&&').every(c => this.matchesCondition(state, c.trim(), sourceId, controllerId, event));
    }

    // 4. Handle Placeholder results from parentheses reduction
    if (condition.trim() === 'TRUE_VAL') return true;
    if (condition.trim() === 'FALSE_VAL') return false;

    // 5. Handle Negation (!)
    if (condition.trim().startsWith('!')) {
      return !this.matchesCondition(state, condition.trim().substring(1), sourceId, controllerId, event);
    }

    const trimmedCondition = condition.trim();

    // 6. Parameterized conditions: HAS_PERMANENT:creature,power>=4
    if (trimmedCondition.includes(':')) {
      const [type, params] = trimmedCondition.split(':');
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
        case 'EVENT_OBJECT_MATCHES': {
          const obj = event?.data?.object || event?.data?.card || (event as any)?.gameObject || event?.object || (state.battlefield.find((o: any) => o.id === event?.sourceId));
          if (!obj) return false;
          return TargetingProcessor.matchesRestrictions(state, obj, restrictions, controllerId, sourceId);
        }
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
        case 'X_LE': {
          const xValue = (event as any)?.xValue || 0;
          return xValue <= parseInt(restrictions[0]);
        }
        case 'X_LT': {
          const xValue = (event as any)?.xValue || 0;
          return xValue < parseInt(restrictions[0]);
        }
        case 'SPENT_MANA_GE':
        case 'SPENT_MANA_LT':
        case 'SPENT_MANA_LE': {
          const threshold = parseInt(restrictions[0]);
          const spent = (event as any)?.data?.card?.paidManaValue || (event as any)?.eventData?.spent || (event as any)?.data?.spentMana || 0;
          if (type === 'SPENT_MANA_GE') return spent >= threshold;
          if (type === 'SPENT_MANA_LT') return spent < threshold;
          if (type === 'SPENT_MANA_LE') return spent <= threshold;
          return false;
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
        case 'ARTIFACT_COUNT_GE':
        case 'LAND_COUNT_GE': {
          const threshold = parseInt(restrictions[0]);
          const targetType = type.includes('ARTIFACT') ? 'Artifact' : 'Land';
          return state.battlefield.filter(o => o.controllerId === controllerId && (o.definition.types || []).some(t => t.toLowerCase() === targetType.toLowerCase())).length >= threshold;
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
        case 'HAND_COUNT_GE': {
          const threshold = parseInt(restrictions[0]);
          return (state.players[controllerId]?.hand.length || 0) >= threshold;
        }
        case 'GRAVEYARD_CREATURE_COUNT_GE': {
          const threshold = parseInt(restrictions[0] || '0');
          return (state.players[controllerId]?.graveyard.filter(c => (c.definition.types || []).some(t => t.toLowerCase() === 'creature')).length || 0) >= threshold;
        }
        case 'IS_FLASHBACK_CAST': {
          const obj = event?.data?.object || event?.data?.card || event?.card || (event as any)?.gameObject;
          if (obj) return (obj as any)?.isFlashbackCast === true;
          return (event as any)?.isFlashbackCast === true; // Support direct property on StackObject
        }
        case 'CONTROL_SUBTYPE_GE': {
          const subtype = restrictions[0];
          const threshold = parseInt(restrictions[1]) || 1;
          return state.battlefield.filter(o => o.controllerId === controllerId && (o.definition.subtypes || []).some(s => s.toLowerCase() === subtype.toLowerCase())).length >= threshold;
        }
        case 'EVENT_OBJECT_OWNER_NOT_YOU': {
          const card = event?.data?.card || event?.data?.object;
          if (!card) return false;
          return card.ownerId !== controllerId;
        }
        case 'CREATURES_DIED_COUNT_GE': {
          const threshold = parseInt(restrictions[0]);
          return (state.turnState.creaturesDiedThisTurn.length || 0) >= threshold;
        }
        case 'EVENT_COUNTER_TYPE_MATCHES': {
          const expectedType = restrictions[0] === 'p1p1' ? '+1/+1' : restrictions[0];
          const actualType = (event as any)?.counterType || (event as any)?.data?.counterType;
          const normalizedActualType = actualType === 'p1p1' ? '+1/+1' : actualType;
          return normalizedActualType === expectedType;
        }

        case 'EVENT_OBJECT_IS_TARGET_1': {
          const objId = event?.data?.object?.id || (event as any)?.gameObject?.id || event?.targetId;
          const targetId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0];
          return objId === targetId;
        }
        case 'EVENT_OBJECT_IS_TRIGGER_SOURCE': {
          const objId = event?.data?.object?.id || (event as any)?.gameObject?.id;
          return objId === sourceId;
        }

        case 'SELF_COMBAT_DAMAGE_PLAYER_OR_PLANESWALKER': {
          if (!event || event.sourceId !== sourceId || !event.data?.isCombat) return false;
          // DamageDealtToPlayer is always valid if source matches
          if (event.type === TriggerEvent.DamageDealtToPlayer || event.type === 'ON_DAMAGE_PLAYER') return true;
          // DamageTaken is valid only if target is a Planeswalker
          if (event.type === TriggerEvent.DamageTaken) {
            const targetObj = state.battlefield.find(o => o.id === event.targetId);
            return !!targetObj && targetObj.definition.types.some(t => t.toLowerCase() === 'planeswalker');
          }
          return false;
        }
      }
    }

    // Generic/Legacy strings
    switch (trimmedCondition.toUpperCase()) {
      case 'SPELL_TARGETS_SOURCE': {
        const targets = (event?.data as any)?.targets || [];
        return targets.includes(sourceId);
      }
      case 'SPELL_TARGETS_PERMANENT':
      case 'TARGETS_PERMANENT': {
        const targets = (event as any)?.targets || (event as any)?.data?.targets || (event as any)?.targetIds || [];
        if (targets.length === 0) return false;
        return targets.some((tid: string) => {
          const obj = state.battlefield.find(o => o.id === tid);
          return obj && ['artifact', 'creature', 'enchantment', 'land', 'planeswalker'].some(t => obj.definition.types.some((ot: string) => ot.toLowerCase() === t));
        });
      }
      case 'SPELL_TARGETS_CREATURE': {
        const targets = (event as any)?.targets || (event as any)?.data?.targets || (event as any)?.targetIds || [];
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
      case 'GAINED_LIFE_THIS_TURN':
      case 'INFUSION':
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
      case 'LIFE_GAINED_2_OR_MORE_THIS_TURN':
        return (state.turnState.lifeGainedThisTurn[controllerId] || 0) >= 2;
      case 'LIFE_GAINED_3_OR_MORE_THIS_TURN':
        return (state.turnState.lifeGainedThisTurn[controllerId] || 0) >= 3;
      case 'PLAYER_LIFE_GE_STARTING_PLUS_7':
        return (state.players[controllerId]?.life || 0) >= 27;
      case 'HAS_COUNTERS': {
        const obj = state.battlefield.find(o => o.id === sourceId) || event?.data?.object;
        return obj ? Object.values(obj.counters || {}).some(v => (v as number) > 0) : false;
      }
      case 'REPARTEE_TRIGGER': {
        if (event?.playerId !== controllerId) return false;
        const targets = event?.targets || event?.data?.targets || [];
        return targets.some((tid: string) => {
          const obj = state.battlefield.find(o => o.id === tid);
          return obj && obj.definition.types.some(t => t.toLowerCase() === 'creature');
        });
      }
      case 'PUT_COUNTER_ON_SELF_THIS_TURN':
        return state.turnState.countersAddedThisTurnIds?.includes(sourceId) || false;
      case 'NOT_CAST_FROM_HAND': {
        const zone = (event as any).sourceZone || (event as any).lastNonStackZone || event?.data?.sourceZone || event?.card?.lastNonStackZone;
        return zone !== Zone.Hand;
      }
      case 'CAST_FROM_GRAVEYARD_OR_EXILE': {
        const zone = (event as any).sourceZone || (event as any).lastNonStackZone || event?.data?.sourceZone || event?.card?.lastNonStackZone;
        return zone === Zone.Graveyard || zone === Zone.Exile;
      }
      case 'CAST_FROM_HAND': {
        const zone = (event as any).sourceZone || (event as any).lastNonStackZone || event?.data?.sourceZone || event?.card?.lastNonStackZone;
        return zone === Zone.Hand;
      }
      case 'PLAYER_IS_CONTROLLER':
      case 'EVENT_PLAYER_IS_YOU':
      case 'TRIGGER_EVENT_SOURCE.CONTROLLERID === CONTROLLER_ID':
        return String(event?.playerId) === String(controllerId);
      case 'EVENT_OBJECT_CONTROLLER_IS_YOU': {
        const eObj = event?.data?.object || event?.data?.card || (event as any)?.gameObject || event?.object || (state.battlefield.find((o: any) => o.id === (event?.sourceId || (event as any)?.sourceId)));
        return String(eObj?.controllerId) === String(controllerId);
      }
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
      case 'EVENT_SOURCE_IS_SELF':
        return (event as any)?.sourceId === sourceId;
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
          (Number(obj.definition.power || 0) >= 4 || (obj.effectiveStats?.power || 0) >= 4)
        );
      case 'SOURCE_IS_SELF':
      case 'OBJECT_IS_SELF':
      case 'EVENT_SOURCE_IS_SELF':
        return String(sourceId) === String((event as any)?.sourceId || event?.sourceId || event?.data?.sourceId);
      case 'EVENT_OBJECT_HAS_X': {
        const obj = event?.data?.object || event?.data?.card || (event as any)?.gameObject;
        if (!obj) return false;
        const hasX = (obj.definition.manaCost || '').includes('X');
        // if (state.logs) state.logs.push(`[DEBUG] Condition check: EVENT_OBJECT_HAS_X for ${obj.definition.name} = ${hasX}`);
        return hasX;
      }
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
      case 'SPENT_MANA_GT_POWER_OR_TOUGHNESS': {
        const spent = (event as any)?.data?.card?.paidManaValue ?? (event as any)?.amount ?? 0;
        const obj = state.battlefield.find(o => o.id === sourceId);
        if (!obj) return false;
        const { LayerProcessor } = require('./../state/LayerProcessor');
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        const met = spent > stats.power || spent > stats.toughness;
        const basePower = Number(obj.definition.power || 0);
        const baseToughness = Number(obj.definition.toughness || 0);
        if (spent > 0) process.stdout.write(`[DEBUG] Increment check for ${obj.definition.name}: spent ${spent} > power ${stats.power} (base ${basePower}) or toughness ${stats.toughness} (base ${baseToughness})? ${met}\n`);
        return met;
      }
      case 'GRAVEYARD_CREATURE_COUNT_GE_3': {
        const creatures = state.players[controllerId].graveyard.filter(c => c.definition.types.some(t => t.toLowerCase() === 'creature'));
        return creatures.length >= 3;
      }
      case 'TOP_CARD_IS_GOBLIN': {
        const player = state.players[controllerId];
        if (!player || player.library.length === 0) return false;
        const topCard = player.library[player.library.length - 1];
        return topCard.definition.subtypes?.some((s: string) => s.toLowerCase() === 'goblin') || false;
      }
      case 'HAS_INSTANT_AND_SORCERY_IN_GY': {
        const gy = state.players[controllerId]?.graveyard || [];
        const hasInstant = gy.some(c => c.definition.types?.some(t => t.toLowerCase() === 'instant'));
        const hasSorcery = gy.some(c => c.definition.types?.some(t => t.toLowerCase() === 'sorcery'));
        return hasInstant && hasSorcery;
      }
      case 'CREATURE_DIED_THIS_TURN':
        return state.turnState.creaturesDiedThisTurn.length > 0;
      case 'TARGET_IS_OPPONENT': {
        const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
        if (!tId) return false;
        return tId !== controllerId;
      }
      case 'OWN_CREATURE_ENTERS': {
        const obj = event?.data?.object || (event as any)?.gameObject;
        if (!obj) return false;
        return obj.controllerId === controllerId && obj.definition.types.map((t: string) => t.toLowerCase()).includes('creature');
      }
      case 'OWN_TOKEN_ENTERS': {
        const obj = event?.data?.object || (event as any)?.gameObject;
        if (!obj) return false;
        return obj.controllerId === controllerId && !!obj.isToken;
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
      case 'SELF_DIED':
      case 'SELFDIED':
        return (event as any)?.targetId === sourceId;
      case 'YOUR_CARD_LEAVES_GRAVEYARD':
        return event?.playerId === controllerId;
      case 'SELF_ATTACKS':
      case 'SELFATTACKS':
        return (event as any)?.sourceId === sourceId;
      case 'CONTROLLER_HAS_ARTIFACT':
        return state.battlefield.some(o => o.controllerId === controllerId && (o.definition.types || []).some(t => t.toLowerCase() === 'artifact'));
      case 'ON_CAST_INSTANT_SORCERY': {
        if (String(event?.playerId) !== String(controllerId)) return false;
        const card = event?.data?.card || event?.data?.object || (event as any)?.gameObject;
        if (!card) return false;
        const types = card.definition.types.map((t: string) => t.toLowerCase());
        return types.includes('instant') || types.includes('sorcery');
      }
      case 'OPPONENT_ATTACKS_YOUR_PLANESWALKER': {
        const opponentId = event?.playerId;
        if (!opponentId || opponentId === controllerId) return false;

        const attackers = state.combat?.attackers || [];
        return attackers.some(a => {
          const defender = state.battlefield.find(o => o.id === a.targetId);
          return defender &&
            defender.controllerId === controllerId &&
            defender.definition.types.some(t => t.toLowerCase() === 'planeswalker');
        });
      }
      case 'OPPONENT_TARGETS_YOUR_PERMANENT': {
        // targetId is in event for BecomeTarget
        const tId = (event as any)?.targetId || (event as any)?.data?.targetId;
        const target = state.battlefield.find(o => o.id === tId);
        if (!target || target.controllerId !== controllerId) return false;

        // sourceId is the thing that did the targeting
        const sId = (event as any)?.sourceId || (event as any)?.data?.sourceId;
        const { TargetingProcessor } = require('./../actions/TargetingProcessor');
        const source = TargetingProcessor.findObjectInAnyZone(state, sId);
        // If source is null (e.g. game event), or source controller is you, it's not an opponent targeting
        if (!source || source.controllerId === controllerId) return false;

        return true;
      }
      case 'LAST_DISCARDED_HAS_TYPE_CREATURE': {
        const lastIds = state.turnState.lastDiscardedIds || [];
        if (lastIds.length === 0) return false;
        const { TargetingProcessor } = require('./../actions/TargetingProcessor');
        return lastIds.some(id => {
          const obj = TargetingProcessor.findObjectInAnyZone(state, id);
          return obj && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        });
      }
      case 'TRIGGER_EVENT_SOURCE.CONTROLLERID === CONTROLLER_ID':
        return event?.playerId === controllerId;
      case 'EVENT_IS_NONCOMBAT':
        return !(event as any)?.data?.isCombat;
      case 'EVENT_IS_COMBAT':
        return !!(event as any)?.data?.isCombat;
      case 'YOUR_CARD_LEAF_GRAVEYARD':
        return String(event?.playerId) === String(controllerId);
      case 'GRAVEYARD_CREATURE_COUNT_GE':
        return (state.players[controllerId]?.graveyard.filter(c => (c.definition.types || []).some(t => t.toLowerCase() === 'creature')).length || 0) >= 1;
      case 'ARTIFACT_COUNT_GE':
        return state.battlefield.filter(o => o.controllerId === controllerId && (o.definition.types || []).some(t => t.toLowerCase() === 'artifact')).length >= 1;
      case 'LAND_COUNT_GE':
        return state.battlefield.filter(o => o.controllerId === controllerId && (o.definition.types || []).some(t => t.toLowerCase() === 'land')).length >= 1;
      case 'CAST_FROM_HAND':
      case 'NOTCASTFROMHAND':
        const zone = (event as any).sourceZone || (event as any).lastNonStackZone || event?.data?.sourceZone || event?.card?.lastNonStackZone;
        return zone === Zone.Hand;
      case 'IS_MAIN_PHASE':
      case 'CAST_DURING_MAIN_PHASE':
      case 'CASTDURINGMAINPHASE':
        return state.currentStep.toLowerCase().includes('main');
      case 'CONTROLEIGHTORMORELANDS':
      case 'CONTROL_EIGHT_OR_MORE_LANDS':
        return state.battlefield.filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'land')).length >= 8;
      case 'DISCARDED_CREATURE':
      case 'DISCARDEDCREATURE':
        const discIds = state.turnState.lastDiscardedIds || [];
        return discIds.some(id => {
          const obj = state.players[controllerId]?.graveyard.find(c => c.id === id);
          return obj && obj.definition.types.some(t => t.toLowerCase() === 'creature');
        });
      case 'IS_INSTANT_OR_SORCERY_DISCARDED':
        const discIdsIS = state.turnState.lastDiscardedIds || [];
        return discIdsIS.some(id => {
          const obj = state.players[controllerId]?.graveyard.find(c => c.id === id);
          return obj && (obj.definition.types.some(t => t.toLowerCase() === 'instant' || t.toLowerCase() === 'sorcery'));
        });
      case 'SELF_IS_ATTACKING':
      case 'SELFISATTACKING':
      case 'SELFATTACKING':
        return state.combat?.attackers.some(a => a.attackerId === sourceId) || false;
      case 'NOTLAND':
      case 'NON_LAND':
        const eObj = event?.data?.object || (event as any)?.gameObject;
        return eObj && !eObj.definition.types.some((t: string) => t.toLowerCase() === 'land') || false;
      case 'XIS1': return (event as any)?.xValue === 1;
      case 'XIS2': return (event as any)?.xValue === 2;
      case 'XIS3': return (event as any)?.xValue === 3;
      case 'XIS4ORMORE': return ((event as any)?.xValue || 0) >= 4;
      case 'YOUGAINEDLIFE':
      case 'LIFEGAINEDTHISTURN':
      case 'YOU_GAINED_LIFE':
        return (state.turnState.lifeGainedThisTurn[controllerId] || 0) > 0;
      case 'TARGET_IS_CREATURE_YOU_CONTROL_AND_COUNTER_IS_P1P1':
      case 'TARGETISCREATUREYOUCONTROLANDCOUNTERISP1P1': {
        const tId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0];
        const obj = state.battlefield.find(o => o.id === tId);
        const counterType = (event as any)?.counterType || (event as any)?.data?.counterType;
        return !!(obj && obj.controllerId === controllerId && (counterType === '+1/+1' || counterType === 'p1p1'));
      }
      case 'TARGETS_MANA_VALUE_4_GE':
      case 'TARGETSMANAVALUE4ORGREATER': {
        const tId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0];
        const obj = state.battlefield.find(o => o.id === tId);
        if (!obj) return false;
        const { ManaProcessor } = require('./../magic/ManaProcessor');
        return ManaProcessor.getManaValue(obj.definition.manaCost) >= 4;
      }
      case 'OPPONENTHASMORECARDSINHAND':
      case 'OPPONENT_HAS_MORE_CARDS_IN_HAND':
        const myHand = state.players[controllerId]?.hand.length || 0;
        return Object.values(state.players).some(p => p.id !== controllerId && p.hand.length > myHand);
      case 'YOUCONTROLENTEREDOBJECT':
        const entObj = event?.data?.object || (event as any)?.gameObject;
        return entObj && entObj.controllerId === controllerId || false;
      default:
        // Assume true if unknown (safer for gameplay)
        return true;
    }
  }
}

