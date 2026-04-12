import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject, ContinuousEffect, DurationType, EmblemDefinition, TriggeredAbility, ActionType, Phase, Step } from '@shared/engine_types';
import { ManaProcessor } from '../magic/ManaProcessor';

/**
 * Prunes a context to avoid infinite depth serialization issues in Socket.io
 */
export const pruneContext = (ctx: any): any => {
    if (!ctx) return undefined;
    // If context is already 3 levels deep, we stop nesting to prevent "Max Call Stack" errors
    let depth = 0;
    let curr = ctx;
    while (curr?.parentContext) {
        depth++;
        curr = curr.parentContext;
        if (depth > 2) {
            // Prune the deepest context
            const pruned = { ...ctx };
            delete pruned.parentContext; 
            return pruned;
        }
    }
    return ctx;
};

/**
 * Rules Engine Module: Effect Resolution (Rule 608/609)
 * Interprets EffectDefinitions and translates them into GameState mutations.
 * 
 * DESIGN: Strategy-based architecture. Logic delegated to handlers/.
 */
export class EffectProcessor {

  public static resolveEffects(
    state: GameState, 
    effects: EffectDefinition[], 
    sourceId: GameObjectId, 
    targets: string[], 
    log: (m: string) => void,
    startIndex: number = 0,
    stackObject?: any,
    parentContext: any = {}
  ): boolean {
    for (let i = startIndex; i < effects.length; i++) {
        const effect = effects[i];
        this.executeEffect(state, effect, sourceId, targets, log, stackObject, parentContext);
        
        if (state.pendingAction) {
            // Rule 603.3: Prune the stored objects to avoid recursion depth and circular references in sockets.
            const slimStackObj = stackObject ? { 
                id: stackObject.id, 
                sourceId: stackObject.sourceId, 
                controllerId: stackObject.controllerId,
                targets: stackObject.targets,
                xValue: stackObject.xValue,
                data: stackObject.data,
                type: stackObject.type
            } : undefined;

            if (state.pendingAction.data?.stackObj && state.pendingAction.data?.effects) {
                return false;
            }

            if (stackObject) {
                if (!stackObject.data) stackObject.data = {};
                stackObject.data.nextEffectIndex = i + 1;
            }

            state.pendingAction.data = {
                ...(state.pendingAction.data || {}),
                effects: effects.map(e => ({ type: e.type, amount: e.amount, targetMapping: e.targetMapping, label: e.label, restrictions: e.restrictions } as any)),
                nextEffectIndex: i + 1,
                targets: targets,
                stackObj: slimStackObj,
                parentContext: pruneContext(parentContext)
            };
            state.priorityPlayerId = state.pendingAction.playerId;
            return false;
        }
    }
    if (stackObject && stackObject.data) stackObject.data.nextEffectIndex = effects.length;
    return true;
  }

  private static executeEffect(
    state: GameState, 
    effect: EffectDefinition, 
    sourceId: GameObjectId, 
    targets: string[], 
    log: (msg: string) => void,
    stackObject?: any,
    parentContext?: any
  ) {
    process.stdout.write(`[EFFECT-DEBUG] Executing ${effect.type} from ${sourceId}\n`);
    const sourceObj = this.findObject(state, sourceId, stackObject, parentContext) || (stackObject?.card ? stackObject.card : stackObject);
    const controllerId = sourceObj?.controllerId || state.activePlayerId;
    const { TargetingProcessor } = require('../actions/TargetingProcessor');

    // Rule 608.2: Evaluate conditions
    const sourceObjForCondition = this.findObject(state, sourceId, stackObject, parentContext) || (stackObject?.card ? stackObject.card : stackObject);
    const controllerIdForCondition = sourceObjForCondition?.controllerId || state.activePlayerId;
    if (effect.condition) {
        const met = this.checkCondition(state, effect.condition, stackObject, parentContext, controllerIdForCondition, targets);
        if (!met) return;
    }

    // Resolve Target Mappings
    const resolveMapping = (m: string, index: number) => {
        let ids = TargetingProcessor.resolveTargetMapping(state, m || "", targets, sourceId, controllerId, stackObject?.data, effect);
        
        // If Choice effect has no explicit mapping, it should receive all parent targets to pass them down
        if (effect.type === 'Choice' && !m && ids.length === 0) {
            ids = [...targets];
        }

        return this.getValidTargetIds(state, effect, ids, sourceId, sourceObj, stackObject, parentContext, index);
    };

    const validTargetIds = resolveMapping((effect as any).targetMapping, 0);
    const validTarget2Ids = (effect as any).target2Mapping ? resolveMapping((effect as any).target2Mapping, 1) : [];

    if (((effect as any).targetMapping && validTargetIds.length === 0) || 
        ((effect as any).target2Mapping && validTarget2Ids.length === 0)) {
        // Rule 608.2b: If ALL targets are illegal, effect does nothing.
        // Wait, MTG says if at least one target is still legal, it does as much as it can.
        // But for Fight, if one is gone, it cannot fight.
        if (effect.type === 'Fight') return;
        if (validTargetIds.length === 0) return;
    }

    const amount = (effect as any).amount !== undefined ? this.resolveAmount(state, effect.amount, sourceId, controllerId, stackObject) : 1;

    // Strategy Dispatcher
    switch (effect.type) {
      case 'DrawCards':
      case 'Exile':
      case 'ExileTopCard':
      case 'ExileAllCards':
      case 'ReturnToHand':
      case 'SearchLibrary':
      case 'Scry':
      case 'Surveil':
      case 'LookAtTopAndPick':
      case 'MoveToZone':
      case 'PutRemainderOnBottomRandom':
      case 'PutInHand':
      case 'PutOnBattlefield':
      case 'Mill': {
          log(`[DEBUG] EffectProcessor: Dispatching ${effect.type} for targets: ${validTargetIds}`);
          const { MoveEffectHandler } = require('./handlers/MoveEffectHandler');
          return MoveEffectHandler.handle(state, effect, validTargetIds, log, controllerId, stackObject, parentContext);
      }
      case 'DealDamage': {
          const sourceMappingIds = (effect as any).damageSourceMapping ? TargetingProcessor.resolveTargetMapping(state, (effect as any).damageSourceMapping, targets, sourceId, controllerId, stackObject?.data, effect) : [];
          const usedSourceId = sourceMappingIds[0] || (effect as any).damageSourceId || sourceId;
          const { LifeDamageHandler } = require('./handlers/LifeDamageHandler');
          return LifeDamageHandler.handleDamage(state, validTargetIds, amount, usedSourceId, log);
      }
      case 'GainLife': {
          const { LifeDamageHandler } = require('./handlers/LifeDamageHandler');
          return LifeDamageHandler.handleGainLife(state, validTargetIds, amount, log);
      }
      case 'LoseLife': {
          const { LifeDamageHandler } = require('./handlers/LifeDamageHandler');
          return LifeDamageHandler.handleLoseLife(state, validTargetIds, amount, log);
      }
      case 'Destroy': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          return PermanentHandler.handleDestroy(state, validTargetIds, log);
      }
      case 'Sacrifice': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          return PermanentHandler.handleSacrifice(state, validTargetIds, sourceId, log, stackObject, parentContext);
      }
      case 'Untap': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          return PermanentHandler.handleUntap(state, validTargetIds, log);
      }
      case 'Tap':
      case 'Tapped': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          return PermanentHandler.handleTap(state, validTargetIds, log);
      }
      case 'Fight': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          return PermanentHandler.handleFight(state, [...validTargetIds, ...validTarget2Ids], log);
      }
        case 'AddCounters': {
            const { PermanentHandler } = require('./handlers/PermanentHandler');
            return PermanentHandler.handleAddCounters(state, validTargetIds, amount, effect.value || '+1/+1', log);
        }
        case 'DiscardCards': {
            const { ChoiceGenerator } = require('./ChoiceGenerator');
            state.pendingAction = ChoiceGenerator.createDiscardChoice(state, validTargetIds as PlayerId[], sourceId, amount, effect.label || "Discard Cards", stackObject, parentContext, (effect as any).onFailureEffects, log);
            return;
        }
        case 'CreateToken': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          let p = (effect as any).powerOverride !== undefined ? this.resolveAmount(state, (effect as any).powerOverride, sourceId, controllerId, stackObject) : undefined;
          let t = (effect as any).toughnessOverride !== undefined ? this.resolveAmount(state, (effect as any).toughnessOverride, sourceId, controllerId, stackObject) : undefined;
          return PermanentHandler.handleCreateToken(state, validTargetIds, amount, (effect as any).tokenBlueprint, log, p, t, effect);
      }
      case 'Choice': {
          const { ChoiceEffectHandler } = require('./handlers/ChoiceEffectHandler');
          return ChoiceEffectHandler.handleChoice(state, effect, sourceId, validTargetIds, log, controllerId, stackObject, parentContext, this.findObject);
      }
      case 'Necromentia': {
          const { ChoiceEffectHandler } = require('./handlers/ChoiceEffectHandler');
          return ChoiceEffectHandler.handleNecromentia(state, effect, sourceId, validTargetIds, log, controllerId, stackObject, parentContext);
      }
      case 'ApplyContinuousEffect': {
          const { ContinuousEffectHandler } = require('./handlers/ContinuousEffectHandler');
          return ContinuousEffectHandler.handle(state, effect, sourceId, validTargetIds, log, controllerId, (amt: any) => this.resolveAmount(state, amt, sourceId, controllerId, stackObject));
      }
      case 'EndTurn':
      case 'Shuffle':
      case 'Log':
      case 'CopySpellOnStack':
      case 'AddTriggeredAbility':
      case 'AddPreventionEffect':
      case 'PhasedOut':
        case 'AddMana': {
            const { ControlEffectHandler } = require('./handlers/ControlEffectHandler');
            return ControlEffectHandler.handle(state, effect, sourceId, validTargetIds, log, controllerId, stackObject, parentContext, this.findObject);
        }
        case 'PENDING_ACTION': {
            state.pendingAction = (effect as any).action;
            return;
        }
        default:
        log(`[WARNING] Unknown effect type: ${effect.type}`);
    }
  }

  /* --- Internal Rules Engine Logic --- */

  private static getValidTargetIds(state: GameState, effect: any, ids: string[], sourceId: string, sourceObj: any, stackObject?: any, parentContext?: any, index: number = 0): string[] {
    const { TargetingProcessor } = require('../actions/TargetingProcessor');
    return ids.filter(tid => {
        if (!tid) return false;
        if (state.players[tid]) return true;
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (!obj) return false;
        if (tid === sourceId) return true; // Source is always a legal part of its own mapping (Rule 608.2b)
        if (['SELECTED_CARD', 'EVENT_TARGET'].includes(effect.targetMapping)) return true;
        const targetDef = effect.targetDefinition || (stackObject || parentContext?.stackObj)?.data?.targetDefinition;
        if (!targetDef) return true;
        return TargetingProcessor.isLegalTarget(state, sourceObj || sourceId, tid, targetDef, index);
    });
  }

  private static checkCondition(state: GameState, condition: string, stackObject?: any, parentContext?: any, controllerId?: string, targets?: string[]): boolean {
      const card = stackObject?.card || stackObject;
      
      switch (condition.toUpperCase()) {
          case 'CASTFROMHAND':
          case 'CAST_FROM_HAND': return card?.lastNonStackZone === Zone.Hand;
          case 'NOTCASTFROMHAND':
          case 'NOT_CAST_FROM_HAND': return card?.lastNonStackZone !== Zone.Hand;
          case 'ARTIFACT_COUNT_GE:':
          case 'LAND_COUNT_GE:':
              const threshold = parseInt(condition.split(':')[1]);
              const ctrl = controllerId || stackObject?.controllerId || state.activePlayerId;
              const type = condition.includes('ARTIFACT') ? 'Artifact' : 'Land';
              return state.battlefield.filter(o => o.controllerId === ctrl && o.definition.types.some(t => t.toLowerCase() === type.toLowerCase())).length >= threshold;
          default:
              const { ConditionProcessor } = require('../core/ConditionProcessor');
              const extendedEvent = { ...(stackObject || {}), targets };
              return ConditionProcessor.matchesCondition(state, condition, stackObject?.sourceId || '', controllerId || state.activePlayerId, extendedEvent);
      }
  }

  public static resolveAmount(state: GameState, amount: any, sourceId: GameObjectId, controllerId: PlayerId, stackObject?: any): number {
    if (amount === undefined) return 0;
    if (typeof amount === 'number') return amount === -1 ? state.turnState.lastDamageAmount || 0 : amount;
    if (typeof amount === 'function') return amount(state, this.findObject(state, sourceId, stackObject) || { id: sourceId, controllerId });

    const obj = this.findObject(state, sourceId, stackObject);
    let result = 0;
    
    switch (amount) {
      case 'POWER': 
          result = obj?.effectiveStats?.power || parseInt(obj?.definition.power || '0') || 0;
          break;
      case 'TOUGHNESS': 
          result = obj?.effectiveStats?.toughness || parseInt(obj?.definition.toughness || '0') || 0;
          break;
      case 'X': 
          result = stackObject?.xValue || 0;
          break;
      case 'CARDS_IN_HAND_COUNT': 
          result = state.players[controllerId]?.hand.length || 0;
          break;
      case 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT': {
          const player = state.players[controllerId];
          result = player ? player.graveyard.filter(c => {
              const types = c.definition.types.map(t => t.toLowerCase());
              return types.includes('instant') || types.includes('sorcery');
          }).length : 0;
          break;
      }
      case 'FRANTIC_INVENTORY_COUNT': {
          const player = state.players[controllerId];
          result = player ? player.graveyard.filter(c => c.definition.name === "Frantic Inventory").length : 0;
          break;
      }
      case 'EVENT_AMOUNT': 
          result = stackObject?.data?.eventAmount !== undefined ? stackObject.data.eventAmount : (state.turnState.lastDamageAmount || 0);
          break;
      default: 
          result = 0;
    }

    if (typeof amount === 'string') {
        // log(`[DEBUG] resolveAmount(${amount}) for ${controllerId} = ${result}`);
    }
    return result;
  }

  public static findObject(state: GameState, id: string, stackObject?: any, parentContext?: any): GameObject | undefined {
    return state.battlefield.find(o => o.id === id) || 
           state.stack.find(s => s.id === id || s.sourceId === id)?.card ||
           Object.values(state.players).flatMap(p => [...p.graveyard, ...p.hand, ...p.library]).find(o => o.id === id) ||
           state.exile.find(o => o.id === id) ||
           (stackObject?.card?.id === id ? stackObject.card : undefined) ||
           (state.pendingAction?.data?.lookingCards as GameObject[])?.find(o => o.id === id) ||
           (parentContext?.lookingCards as GameObject[])?.find(o => o.id === id) ||
           (stackObject?.data?.lookingCards as GameObject[])?.find(o => o.id === id);
  }
}
