import { GameState, GameObjectId, PlayerId, GameObject, Zone, GameEvent } from '@shared/engine_types';

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
    condition: string | undefined, 
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
        case 'DRAWN_CARDS_GE':
          const threshold = parseInt(restrictions[0]);
          return (state.turnState.cardsDrawnThisTurn[controllerId] || 0) >= threshold;
      }
    }

    // Generic/Legacy strings
    switch (condition.toUpperCase()) {
      case 'SPELL_TARGETS_SOURCE': {
        const targets = (event?.data as any)?.targets || [];
        return targets.includes(sourceId);
      }
      case 'IS_YOUR_TURN':
        return state.activePlayerId === controllerId;
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
      case 'TOP_CARD_IS_GOBLIN': {
        const player = state.players[controllerId];
        if (!player || player.library.length === 0) return false;
        const topCard = player.library[player.library.length - 1];
        return topCard.definition.subtypes.some(s => s.toLowerCase() === 'goblin');
      }
      case 'CREATURE_DIED_THIS_TURN':
        return state.turnState.creaturesDiedThisTurn.length > 0;
      case 'TARGET_IS_OPPONENT': {
        const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
        if (!tId) return false;
        return tId !== controllerId;
      }
      default:
        // Assume true if unknown (safer for gameplay)
        return true;
    }
  }
}
