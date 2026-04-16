import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject, ContinuousEffect, DurationType, EmblemDefinition, TriggeredAbility, ActionType, Phase, Step, EffectType, AbilityType, ConditionType } from '@shared/engine_types';
import { ManaProcessor } from '../magic/ManaProcessor';
import { ActionProcessor } from '../actions/ActionProcessor';

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
    parentContext: any = {},
    controllerIdOverride?: PlayerId
  ): boolean {
    for (let i = startIndex; i < effects.length; i++) {
        const effect = effects[i];
        this.executeEffect(state, effect, sourceId, targets, log, stackObject, parentContext, i, controllerIdOverride);
        
        if (state.pendingAction) {
            // Rule 603.3: Prune the stored objects to avoid recursion depth and circular references in sockets.
            const slimStackObj = this.slimStackObj(state, stackObject);

            if (state.pendingAction.data?.stackObj && state.pendingAction.data?.effects) {
                return false;
            }

            if (stackObject) {
                if (!stackObject.data) stackObject.data = {};
                stackObject.data.nextEffectIndex = i + 1;
            }

            state.pendingAction.data = {
                ...(state.pendingAction.data || {}),
                effects: effects.map(e => ({ ...e } as any)),
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

  private static slimStackObj(state: GameState, stackObject: any): any {
    if (stackObject) {
        // Recover name/image if missing (triggers often lose metadata in engine internals)
        let name = stackObject.name;
        let imageUrl = stackObject.image_url;

        const { TargetingProcessor } = require('./../actions/TargetingProcessor');
        const source = TargetingProcessor.findObjectInAnyZone(state, stackObject.sourceId);

        if (!name || !imageUrl) {
            if (source) {
                if (!name) name = `${source.definition.name}'s Trigger`;
                if (!imageUrl) imageUrl = source.definition.image_url || source.definition.image_uris?.normal;
            }
        }

        return { 
            id: stackObject.id, 
            name: name || 'Ability', 
            image_url: imageUrl,
            sourceId: stackObject.sourceId,
            type: stackObject.type,
            definition: source?.definition, // Pass the definition for clean rendering
            targets: stackObject.targets || []
        };
    }
    return null;
  }

  private static executeEffect(
    state: GameState, 
    effect: EffectDefinition, 
    sourceId: GameObjectId, 
    targets: string[], 
    log: (msg: string) => void,
    stackObject?: any,
    parentContext?: any,
    index: number = 0,
    controllerIdOverride?: PlayerId
  ) {
    const sourceObj = this.findObject(state, sourceId, stackObject, parentContext) || (stackObject?.card ? stackObject.card : stackObject);
    const controllerId = controllerIdOverride || sourceObj?.controllerId || state.activePlayerId;
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
        const ids = TargetingProcessor.resolveTargetMapping(state, m || "", targets, sourceId, controllerId, stackObject?.data, effect, parentContext);
        
        // If Choice effect has no explicit mapping, it should receive all parent targets to pass them down
        if (effect.type === 'Choice' && (!m || m === "") && ids.length === 0) {
            return ids.length > 0 ? ids : [...targets];
        }

        const mStr = (m || "").toUpperCase();
        const isDirectTargetMapping = mStr.startsWith('TARGET_') && !isNaN(parseInt(mStr.substring(7))) && mStr.split('_').length === 2;
        
        let validationIndex = index;
        if (isDirectTargetMapping) {
            validationIndex = parseInt(mStr.substring(7)) - 1;
        }

        if (isDirectTargetMapping || ['TARGET_OPPONENT', 'TARGET_PLAYER', 'TARGET_CREATURE', 'TARGET_PERMANENT'].includes(mStr)) {
            return this.getValidTargetIds(state, effect, ids, sourceId, sourceObj, stackObject, parentContext, validationIndex);
        }
        
        return ids;
    };

    let validTargetIds = resolveMapping((effect as any).targetMapping, 0);
    // CR 608.2c: If an effect has no target mapping specified, it defaults to the controller for player-centric actions
    if (!(effect as any).targetMapping && validTargetIds.length === 0) {
        if (['CreateToken', 'DrawCards', 'Scry', 'Surveil', 'AddMana', 'Learn', 'Mill'].includes(effect.type)) {
            validTargetIds = [controllerId];
        }
    }
    const validTarget2Ids = (effect as any).target2Mapping ? resolveMapping((effect as any).target2Mapping, 1) : [];

    if (((effect as any).targetMapping && validTargetIds.length === 0 && !(effect as any).targetId && !effect.targetDefinition) || 
        ((effect as any).target2Mapping && validTarget2Ids.length === 0 && !effect.targetDefinition)) {
        if (effect.type === 'Fight') return;
        return;
    }
    
    const amount = (effect as any).amount !== undefined ? this.resolveAmount(state, (effect as any).amount, sourceId, controllerId, stackObject, validTargetIds, parentContext) : 1;

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
      case 'Mill':
      case 'RevealUntilCondition': {
          log(`[DEBUG] EffectProcessor: Dispatching ${effect.type} for targets: ${validTargetIds}`);
          const { MoveEffectHandler } = require('./handlers/MoveEffectHandler');
          const searchingPlayerId = validTargetIds.find((tid: string) => state.players[tid as PlayerId]) as PlayerId || controllerId;
          return MoveEffectHandler.handle(state, effect, validTargetIds, log, searchingPlayerId, stackObject, parentContext);
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
          return PermanentHandler.handleSacrifice(state, validTargetIds, sourceId, log, stackObject, parentContext, effect);
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
            const type = (effect as any).counterType || (effect as any).value || (effect as any).type || 'p1p1';
            return PermanentHandler.handleAddCounters(state, validTargetIds, amount, type, log);
        }
        case 'DoubleCounters': {
            const { PermanentHandler } = require('./handlers/PermanentHandler');
            return PermanentHandler.handleDoubleCounters(state, validTargetIds, (effect as any).counterType || 'p1p1', log);
        }
        case 'MoveCounters': {
            const { PermanentHandler } = require('./handlers/PermanentHandler');
            return PermanentHandler.handleMoveCounters(state, validTargetIds, sourceId, log, effect);
        }
        case 'DiscardCards': {
            const { ChoiceGenerator } = require('./ChoiceGenerator');
            state.pendingAction = ChoiceGenerator.createDiscardChoice(state, validTargetIds as PlayerId[], sourceId, amount, effect.label || "Discard Cards", stackObject, parentContext, (effect as any).onFailureEffects, log);
            return;
        }
        case 'CreateToken': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          let p = (effect as any).powerOverride !== undefined ? this.resolveAmount(state, (effect as any).powerOverride, sourceId, controllerId, stackObject, [], parentContext) : undefined;
          let t = (effect as any).toughnessOverride !== undefined ? this.resolveAmount(state, (effect as any).toughnessOverride, sourceId, controllerId, stackObject, [], parentContext) : undefined;
          return PermanentHandler.handleCreateToken(state, validTargetIds, amount, (effect as any).tokenBlueprint, log, p, t, effect, stackObject);
      }
      case 'CreateTokenCopy': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          let sourceCardId = (effect as any).target2Mapping ? validTarget2Ids[0] : validTargetIds[0];
          
          if (!sourceCardId && (effect as any).targetMapping === 'TRIGGER_EVENT_SOURCE') {
              sourceCardId = (stackObject as any)?.data?.eventData?.data?.object?.id || (stackObject as any)?.sourceId;
          }

          const sourceObj = this.findObject(state, sourceCardId, stackObject, parentContext);
          if (sourceObj) {
              const controllerIds = (effect as any).target2Mapping ? validTargetIds : [controllerId];
              const updatedEffect = { ...effect, originalCardId: sourceCardId };
              return PermanentHandler.handleCreateTokenCopy(state, controllerIds, sourceObj, controllerId, log, updatedEffect);
          }
          return;
      }
      case 'Choice': {
          const { ChoiceEffectHandler } = require('./handlers/ChoiceEffectHandler');
          const searchingPlayerId = validTargetIds.find((tid: string) => state.players[tid as PlayerId]) as PlayerId || controllerId;
          return ChoiceEffectHandler.handleChoice(state, effect, sourceId, validTargetIds, log, searchingPlayerId, stackObject, parentContext, this.findObject);
      }
      case 'Necromentia': {
          const { ChoiceEffectHandler } = require('./handlers/ChoiceEffectHandler');
          return ChoiceEffectHandler.handleNecromentia(state, effect, sourceId, validTargetIds, log, controllerId, stackObject, parentContext);
      }
      case 'ApplyContinuousEffect': {
          const { ContinuousEffectHandler } = require('./handlers/ContinuousEffectHandler');
          return ContinuousEffectHandler.handle(state, effect, sourceId, validTargetIds, log, controllerId, (amt: any) => this.resolveAmount(state, amt, sourceId, controllerId, stackObject, [], parentContext), stackObject);
      }
      case 'Prepare': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          return PermanentHandler.handlePrepare(state, validTargetIds, log);
      }
      case 'Unprepare': {
          const { PermanentHandler } = require('./handlers/PermanentHandler');
          return PermanentHandler.handleUnprepare(state, validTargetIds, log);
      }
      case 'ExileTopCardsExcessDamage': {
          const { MoveEffectHandler } = require('./handlers/MoveEffectHandler');
          const { ContinuousEffectHandler } = require('./handlers/ContinuousEffectHandler');
          const excessAmt = state.turnState.lastExcessDamageAmount;
          log(`[EXILE-EXCESS] Exiling top ${excessAmt} cards due to excess damage.`);
          
          MoveEffectHandler.handle(state, { ...effect, type: 'Exile', amount: excessAmt, fromTop: excessAmt, sourceZones: [Zone.Library] } as any, validTargetIds, log, controllerId, stackObject, parentContext);
          
          // Add permission to play exiled cards
          if (excessAmt > 0) {
              const exiledIds = (state as any).lastExiledIds || []; // MoveEffectHandler should store these
              if (exiledIds.length > 0) {
                  ContinuousEffectHandler.handle(state, {
                      type: 'ApplyContinuousEffect',
                      canPlayExiled: true,
                      targetIds: exiledIds,
                      duration: effect.duration || { type: DurationType.UntilEndOfTurn }
                  } as any, sourceId, exiledIds, log, controllerId, (a: any) => this.resolveAmount(state, a, sourceId, controllerId, stackObject, [], parentContext), stackObject);
              }
          }
          return;
      }
      case 'ConditionalEffect': {
          const effects = (effect as any).effects || [];
          return this.resolveEffects(state, effects, sourceId, targets, log, 0, stackObject, parentContext);
      }
      case 'Learn': {
          const { ChoiceGenerator } = require('./ChoiceGenerator');
          const player = state.players[controllerId];
          const lessons = (player?.sideboard || []).filter(c => 
              c.definition.subtypes?.some(s => s.toLowerCase() === 'lesson')
          );

          const choices = [];
          if (lessons.length > 0) {
              choices.push({
                  label: "Reveal Lesson",
                  value: 'REVEAL_LESSON',
                  effects: [
                      {
                          type: 'Choice',
                          label: "Choose a Lesson to put into your hand",
                          targetIdMapping: 'CONTROLLER_SIDEBOARD',
                          restrictions: ['Lesson'],
                          effects: [{ type: 'MoveToZone', zone: Zone.Hand, revealed: true }]
                      }
                  ]
              });
          }

          choices.push({
              label: "Discard and Draw",
              value: 'DISCARD_DRAW',
              effects: [
                  { type: 'DiscardCards', amount: 1, label: "Discard a card (Learn)" },
                  { type: 'DrawCards', amount: 1 }
              ]
          });

          choices.push({
              label: "Decline",
              value: 'NONE',
              effects: []
          });

          state.pendingAction = ChoiceGenerator.createModalChoice({
              label: "Learn",
              playerId: controllerId,
              sourceId: sourceId,
              stackObj: stackObject,
              parentContext: parentContext
          }, choices);
          return;
      }
      case 'CastSpell': {
        const { SpellProcessor } = require('./../actions/SpellProcessor');
        const spellName = (effect as any).value;
        const isFree = (effect as any).isFreeCast;
        let targetId = (effect as any).targetId || validTargetIds[0];

        log(`[DEBUG] EffectProcessor: CastSpell for ${targetId} (Free: ${isFree})`);

        log(`[DEBUG] EffectProcessor: CastSpell for ${targetId} (Free: ${isFree})`);

        if (spellName && !targetId) {
            const { oracle } = require('../../OracleLogicMap');
            const cardDef = oracle.getCard(spellName);
            if (!cardDef) {
                log(`[ERROR] CastSpell: Could not find definition for ${spellName}.`);
                return;
            }

            const copyId = `cast_copy_${Date.now()}`;
            const copy = {
                id: copyId,
                definition: cardDef,
                controllerId: controllerId,
                ownerId: controllerId,
                zone: Zone.Exile,
                isCopy: true,
                isFreeCast: isFree,
                counters: {}
            } as any;

            if (!(state as any).paradigmCopies) (state as any).paradigmCopies = {};
            (state as any).paradigmCopies[copyId] = copy;
            targetId = copyId;
        }

        // --- PARADIGM SUPPORT ---
        if ((effect as any).isParadigmCopy && spellName) {
            const originalInExile = state.exile.find(c => c.definition.name === spellName && c.ownerId === controllerId);
            if (originalInExile) {
                const copyId = `paradigm_copy_${originalInExile.id}_${Date.now()}`;
                targetId = copyId;
                if (!(state as any).paradigmCopies) (state as any).paradigmCopies = {};
                (state as any).paradigmCopies[copyId] = { ...originalInExile, id: copyId, isParadigmCopy: true };
            }
        }

        if (targetId) {
            const castObj = this.findObject(state, targetId, stackObject, parentContext);
            if (castObj && isFree) {
                (castObj as any).isFreeCast = true;
            }
            const oldPriority = state.priorityPlayerId;
            state.priorityPlayerId = controllerId;
            SpellProcessor.playCard(state, controllerId, targetId, [], log, (state as any).gameEngine || {
                tapForMana: () => {},
                passPriority: () => {},
                checkAutoPass: () => {},
                checkStateBasedActions: () => {}
            }, true);
            if (state.priorityPlayerId === controllerId) state.priorityPlayerId = oldPriority;
        }
        return;
      }
        case 'Paradigm': {
            const { ActionProcessor } = require('./../actions/ActionProcessor');
            const { AbilityType } = require('@shared/engine_types');
            const resolvingStackObj = stackObject || parentContext?.stackObj;
            const spellName = resolvingStackObj?.card?.definition.name || sourceObj?.definition.name;
            if (!spellName) return;
            
            // 1. Exile the spell
            if (resolvingStackObj) {
                resolvingStackObj.exileOnResolution = true;
                if (resolvingStackObj.card) {
                    ActionProcessor.moveCard(state, resolvingStackObj.card, Zone.Exile, controllerId, log);
                }
            }

            // 2. Register first-main-phase recurring trigger
            state.ruleRegistry.triggeredAbilities.push({
                type: AbilityType.Triggered,
                eventMatch: 'ON_BEGIN_PHASE_PRECOMBAT_MAIN',
                condition: 'IS_YOUR_TURN',
                id: `paradigm_${controllerId}_${spellName}_${Date.now()}`,
                sourceId: sourceId,
                controllerId: controllerId,
                activeZone: Zone.Command, // Virtual rule
                effects: [
                    {
                        type: EffectType.Choice,
                        label: `Paradigm: Cast ${spellName}?`,
                        choices: [
                            {
                                label: `Cast copy of ${spellName}`,
                                effects: [
                                    { 
                                        type: EffectType.CastSpell, 
                                        isFreeCast: true,
                                        isParadigmCopy: true,
                                        value: spellName 
                                    }
                                ]
                            },
                            { label: "Decline", effects: [] }
                        ]
                    }
                ]
            } as any);
            log(`[PARADIGM] ${spellName} is now a recurring paradigm for ${state.players[controllerId].name}.`);
            return;
        }

      case 'EndTurn':
      case 'Shuffle':
      case 'Log':
      case 'CopySpellOnStack':
      case 'AddTriggeredAbility':
      case 'AddPreventionEffect':
      case 'PhasedOut':
      case 'AddMana': {
          if ((effect as any).choices) {
              const { ChoiceEffectHandler } = require('./handlers/ChoiceEffectHandler');
              const searchingPlayerId = validTargetIds.find((tid: string) => state.players[tid as PlayerId]) as PlayerId || controllerId;
              return ChoiceEffectHandler.handleChoice(state, effect, sourceId, validTargetIds, log, searchingPlayerId, stackObject, parentContext, this.findObject);
          }
          const { ControlEffectHandler } = require('./handlers/ControlEffectHandler');
          return ControlEffectHandler.handle(state, effect, sourceId, validTargetIds, log, controllerId, stackObject, parentContext, this.findObject);
      }
      case 'PayMana':
      case 'LoseMana': {
          const { ManaProcessor } = require('./../magic/ManaProcessor');
          const value = (effect as any).value || '{0}';
          const player = state.players[controllerId];
          if (!player) return;
          
          const requirements = ManaProcessor.parseManaCost(value.startsWith('{') ? value : `{${value}}`);
          player.manaPool.W = Math.max(0, player.manaPool.W - (requirements.colored.W || 0));
          player.manaPool.U = Math.max(0, player.manaPool.U - (requirements.colored.U || 0));
          player.manaPool.B = Math.max(0, player.manaPool.B - (requirements.colored.B || 0));
          player.manaPool.R = Math.max(0, player.manaPool.R - (requirements.colored.R || 0));
          player.manaPool.G = Math.max(0, player.manaPool.G - (requirements.colored.G || 0));
          player.manaPool.C = Math.max(0, player.manaPool.C - (requirements.colored.C || 0));
          
          let generic = requirements.generic;
          const colors: ('W'|'U'|'B'|'R'|'G'|'C')[] = ['C', 'W', 'U', 'B', 'R', 'G'];
          for (const c of colors) {
              const toSub = Math.min(player.manaPool[c], generic);
              player.manaPool[c] -= toSub;
              generic -= toSub;
          }
          log(`[PAID/LOST] ${player.name} paid/lost ${value}.`);
          return;
      }
      case 'CreateDelayedTrigger': {
          const { TriggerProcessor } = require('./TriggerProcessor');
          // Support for capturing data from the current resolution (like MV of countered spell)
          const data = (effect as any).data || {};
          if ((effect as any).captureTargetMV) {
              const { TargetingProcessor } = require('../actions/TargetingProcessor');
              const targetId = validTargetIds[0];
              const targetObj = TargetingProcessor.findObjectInAnyZone(state, targetId) || state.stack.find(s => s.id === targetId);
              if (targetObj) {
                  data.capturedMV = targetObj.paidManaValue || 0;
              }
          }
          return TriggerProcessor.createDelayedTrigger(state, { ...effect, data }, sourceId, controllerId, log);
      }
      case 'ExchangeHandAndGraveyard': {
          const player = state.players[controllerId];
          if (!player) return;
          const oldHand = [...player.hand];
          const oldGrave = [...player.graveyard];
          
          player.hand = [];
          player.graveyard = [];
          
          oldHand.forEach(c => ActionProcessor.moveCard(state, c, Zone.Graveyard, player.id, log));
          oldGrave.forEach(c => ActionProcessor.moveCard(state, c, Zone.Hand, player.id, log));
          log(`[HARNESS INFINITY] ${player.name} exchanged hand and graveyard.`);
          return;
      }
      case 'DisableDamagePrevention': {
          state.turnState.damagePreventionDisabled = true;
          log(`[SYSTEM] Damage can't be prevented this turn.`);
          return;
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
        
        // Choice and SearchLibrary often use mappings to players/zones that shouldn't be matched against the main target definition
        if (['Choice', 'SearchLibrary', 'Scry', 'Surveil', 'MoveToZone'].includes(effect.type)) return true;
        
        if (['SELECTED_CARD', 'EVENT_TARGET'].includes(effect.targetMapping)) return true;
        const targetDef = effect.targetDefinition || (stackObject || parentContext?.stackObj)?.data?.targetDefinition;
        if (!targetDef) return true;
        return TargetingProcessor.isLegalTarget(state, sourceObj || sourceId, tid, targetDef, index);
    });
  }

  private static checkCondition(state: GameState, condition: ConditionType, stackObject?: any, parentContext?: any, controllerId?: string, targets?: string[]): boolean {
      const { ConditionProcessor } = require('../core/ConditionProcessor');
      const extendedEvent = { ...(stackObject || {}), targets };
      return ConditionProcessor.matchesCondition(state, condition, stackObject?.sourceId || '', controllerId || state.activePlayerId, extendedEvent);
  }

  public static resolveAmount(state: GameState, amount: any, sourceId: GameObjectId, controllerId: PlayerId, stackObject?: any, targetIds: string[] = [], parentContext?: any): number {
    if (amount === undefined) return 0;
    if (typeof amount === 'number') return amount === -1 ? state.turnState.lastDamageAmount || 0 : amount;
    if (typeof amount === 'string' && !isNaN(Number(amount))) return Number(amount);
    if (typeof amount === 'string' && ['ANY', 'ALL', 'Any', 'All'].includes(amount)) return amount as any;
    if (typeof amount === 'function') return amount(state, this.findObject(state, sourceId, stackObject) || { id: sourceId, controllerId }, targetIds);


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
          if (state.logs) state.logs.push(`[DEBUG] EffectProcessor: Resolved X = ${result}`);
          break;
      case 'X_PLUS_1':
          result = (stackObject?.xValue || 0) + 1;
          break;
        case 'DESTROYED_COUNT':
          result = (state.turnState as any).lastDestroyedCount || 0;
          break;
        case 'DISCARDED_COUNT':
          result = (state.turnState as any).lastDiscardedCount || 0;
          break;
        case 'DISCARDED_COUNT_PLUS_1':
          result = ((state.turnState as any).lastDiscardedCount || 0) + 1;
          break;
      case 'CARDS_IN_HAND_COUNT': 
          result = state.players[controllerId]?.hand.length || 0;
          break;
      case 'CARDS_DRAWN_THIS_TURN':
          result = state.turnState.cardsDrawnThisTurn?.[controllerId] || 0;
          break;
      case 'GAINED_LIFE_AMOUNT':
          result = state.turnState.lifeGainedThisTurn?.[controllerId] || 0;
          break;
      case 'CONVERGE_AMOUNT':
          result = (stackObject as any)?.convergeAmount || (stackObject as any)?.card?.convergeAmount;
          if (result === undefined && stackObject?.data?.eventData?.data?.card?.convergeAmount !== undefined) {
              result = stackObject.data.eventData.data.card.convergeAmount;
          }
          if (result === undefined && stackObject?.data?.convergeAmount !== undefined) {
              result = stackObject.data.convergeAmount;
          }
          result = result || 0;
          break;
      case 'X_POWER_OF_2': {
          const x = stackObject?.xValue || 0;
          result = Math.pow(2, x);
          break;
      }
      case 'CAPTURED_AMOUNT': {
          result = stackObject?.data?.amount || (stackObject as any)?.data?.capturedMV || 0;
          break;
      }
      case 'TARGET_1_HAND_SIZE': {
          const pid = targetIds[0] as PlayerId;
          const player = state.players[pid];
          result = player ? player.hand.length : 0;
          break;
      }
      case 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT': {
          const player = state.players[controllerId];
          result = player ? player.graveyard.filter(c => {
              const types = (c.definition.types || []).map(t => t.toLowerCase());
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
          result = stackObject?.data?.eventAmount !== undefined ? stackObject.data.eventAmount : (stackObject?.data?.eventData?.spent || stackObject?.data?.eventData?.data?.card?.paidManaValue || state.turnState.lastDamageAmount || 0);
          break;
      case 'SACRIFICED_OBJECT_POWER':
          const lastSac = (state.turnState as any).lastSacrificedObject;
          result = lastSac?.effectiveStats?.power || parseInt(lastSac?.definition.power || '0') || 0;
          break;
      case 'TARGET_1_POWER':
      case 'TARGET_1_TOUGHNESS': {
          const tid = targetIds[0] || (stackObject as any)?.targets?.[0];
          const obj = state.battlefield.find(o => o.id === tid) || state.turnState.creaturesDiedThisTurn.find(o => o.id === tid);
          if (!obj) return 0;
          const { LayerProcessor } = require('./../state/LayerProcessor');
          const stats = LayerProcessor.getEffectiveStats(obj, state);
          result = amount === 'TARGET_1_POWER' ? stats.power : stats.toughness;
          break;
      }
      case 'EVENT_PAID_MANA': {
        const obj = (stackObject as any)?.data?.object || (stackObject as any)?.card;
        result = obj?.paidManaValue || (stackObject as any)?.data?.card?.paidManaValue || 0;
        break;
      }
      case 'DISCARDED_COUNT': {
          result = state.turnState.lastDiscardedCount || 0;
          break;
      }
      case 'TARGET_1_MANA_VALUE': {
          const { ManaProcessor } = require('../magic/ManaProcessor');
          const tId = targetIds[0] || (stackObject as any)?.targets?.[0];
          const obj = this.findObject(state, tId, stackObject, parentContext);
          result = obj ? ManaProcessor.getManaValue(obj.definition.manaCost) : 0;
          break;
      }
      case 'TARGET_1_COUNTERS_P1P1': {
          const tId = targetIds[0] || (stackObject as any)?.targets?.[0];
          const obj = state.battlefield.find(o => o.id === tId);
          result = (obj?.counters?.['p1p1'] || 0) + (obj?.counters?.['+1/+1'] || 0);
          break;
      }
      case 'CREATURE_COUNT_YOU_CONTROL': {
          result = state.battlefield.filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature')).length;
          break;
      }
      case 'TARGET_HAND_SIZE_7_MINUS': {
          const targetId = stackObject?.targets?.[0];
          const target = state.battlefield.find(o => o.id === targetId);
          const handSize = state.players[target?.controllerId as PlayerId]?.hand.length || 0;
          result = -(7 - handSize); // Return negative for pMod
          break;
      }
      case '2_POW_X': {
          const x = stackObject?.xValue || 0;
          result = Math.pow(2, x);
          break;
      }
      case 'CONVERGE_AMOUNT': {
          result = stackObject?.convergeAmount || stackObject?.card?.convergeAmount || 0;
          break;
      }
      case 'GRAVEYARD_NAME_COUNT_PLUS_1': {
          const player = state.players[controllerId];
          const name = obj?.definition.name;
          result = player ? player.graveyard.filter(c => c.definition.name === name).length + 1 : 1;
          break;
      }
      case 'CREATURES_YOU_CONTROL': {
          result = state.battlefield.filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature')).length;
          break;
      }
      default: 
          result = 0;
    }

    if (typeof amount === 'string') {
        // log(`[DEBUG] resolveAmount(${amount}) for ${controllerId} = ${result}`);
    }
    return result;
  }

  public static findObject(state: GameState, id: string, stackObject?: any, parentContext?: any): GameObject | undefined {
    // Priority 1: Trigger snapshot (for leaves-battlefield triggers like Star Pupil)
    const snapshot = stackObject?.data?.eventData?.data?.object;
    if (snapshot && snapshot.id === id) return snapshot;

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
