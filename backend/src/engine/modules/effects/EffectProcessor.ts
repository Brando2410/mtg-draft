import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject, ContinuousEffect } from '@shared/engine_types';
import { ActionProcessor } from '../actions/ActionProcessor';
import { DamageProcessor } from '../combat/DamageProcessor';
import { ValidationProcessor } from '../state/ValidationProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { LayerProcessor } from '../state/LayerProcessor';

/**
 * Rules Engine Module: Effect Resolution (Rule 608/609)
 * Interprets EffectDefinitions and translates them into GameState mutations.
 * 
 * DESIGN: Strategy Pattern for effect execution.
 */
export class EffectProcessor {

  public static resolveEffects(
    state: GameState, 
    effects: EffectDefinition[], 
    sourceId: GameObjectId, 
    targets: string[], 
    log: (m: string) => void
  ) {
    for (const effect of effects) {
      this.executeEffect(state, effect, sourceId, targets, log);
    }
  }

  private static executeEffect(
    state: GameState, 
    effect: EffectDefinition, 
    sourceId: GameObjectId, 
    targets: string[], 
    log: (msg: string) => void
  ) {
    const sourceObj = this.findObject(state, sourceId);
    const controllerId = sourceObj?.controllerId || state.activePlayerId;

    const resolvedTargetIds = this.resolveTargetMapping(state, effect.targetMapping, targets, sourceId, controllerId);
    
    // CR 608.2b: Targeted effects only apply to targets that are still legal.
    const validTargetIds = resolvedTargetIds.filter(tid => {
        if (state.players[tid]) return true; // Keep players
        const obj = this.findObject(state, tid);
        if (!obj) return false;
        
        if (['TARGET_1', 'TARGET_2', 'TARGET_ALL', 'TARGET_1_CONTROLLER', 'TARGET_1_OPPONENT'].includes(effect.targetMapping)) {
            const stackObj = state.stack.find(s => s.id === (state as any).lastResolvedStackId || s.sourceId === sourceId);
            const targetDef = (effect as any).targetDefinition || stackObj?.data?.targetDefinition;
            return ValidationProcessor.isLegalTarget(state, sourceId, tid, targetDef);
        }
        return true;
    });

    const amount = this.resolveAmount(state, effect.amount, sourceId, controllerId);

    // CR 609: Effect Strategy Dispatcher
    switch (effect.type) {
      case 'DrawCards':           this.handleDrawCards(state, validTargetIds, amount, log); break;
      case 'DiscardCards':        this.handleDiscardCards(state, validTargetIds, amount, sourceId, log); break;
      case 'DealDamage':          this.handleDealDamage(state, validTargetIds, amount, sourceId, log); break;
      case 'Exile':               this.handleExile(state, validTargetIds, log); break;
      case 'ReturnToHand':        this.handleReturnToHand(state, validTargetIds, log); break;
      case 'PhasedOut':           this.handlePhasedOut(state, validTargetIds, effect.value !== false, log); break;
      case 'Destroy':             this.handleDestroy(state, validTargetIds, log); break;
      case 'GainLife':            this.handleGainLife(state, validTargetIds, amount, log); break;
      case 'AddCounters':         this.handleAddCounters(state, validTargetIds, amount, effect.value || '+1/+1', log); break;
      case 'CreateToken':         this.handleCreateToken(state, validTargetIds, amount, effect.tokenBlueprint, log); break;
      case 'SearchLibrary':       this.handleSearchLibrary(state, validTargetIds, log); break;
      case 'ApplyContinuousEffect': this.handleApplyContinuousEffect(state, effect, sourceId, validTargetIds, log); break;
      default:
        log(`[WARNING] Effect type ${effect.type} not yet implemented.`);
    }
  }

  /* --- Concrete Effect Handlers (CR 609) --- */

  private static handleDrawCards(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        const player = state.players[pid];
        if (!player) return;
        for (let i = 0; i < amount; i++) {
            if (player.library.length > 0) {
                ActionProcessor.moveCard(state, player.library.pop()!, Zone.Hand, pid, log);
            } else {
                log(`${player.name} tried to draw from an empty library!`);
            }
        }
        log(`${player.name} draws ${amount} cards.`);
    });
  }

  private static handleDiscardCards(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(pid => {
        const player = state.players[pid];
        if (!player) return;
        if (amount === -1) {
            const handCount = player.hand.length;
            while (player.hand.length > 0) {
                ActionProcessor.moveCard(state, player.hand[0], Zone.Graveyard, pid, log);
            }
            log(`${player.name} discarded their hand.`);
        } else if (amount > 0) {
            state.pendingAction = { type: 'DISCARD', playerId: pid, sourceId, data: { amount } };
            player.pendingDiscardCount = amount;
            log(`${player.name} must discard ${amount} card(s).`);
        }
    });
  }

  private static handleDealDamage(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(tid => DamageProcessor.dealDamage(state, sourceId, tid, amount, false, log));
  }

  private static handleExile(state: GameState, targets: string[], log: (m: string) => void) {
    targets.forEach(tid => {
        const player = state.players[tid];
        if (player) {
            const card = player.library.pop();
            if (card) ActionProcessor.moveCard(state, card, Zone.Exile, player.id, log);
        } else {
            const obj = this.findObject(state, tid);
            if (obj) ActionProcessor.moveCard(state, obj, Zone.Exile, obj.ownerId, log);
        }
    });
  }

  private static handleReturnToHand(state: GameState, targets: string[], log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid);
        if (obj) {
            ActionProcessor.moveCard(state, obj, Zone.Hand, obj.ownerId, log);
            state.turnState.permanentReturnedToHandThisTurn = true;
        }
    });
  }

  private static handlePhasedOut(state: GameState, targets: string[], value: boolean, log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid);
        if (obj) {
            obj.isPhasedOut = value;
            if (state.combat) {
                state.combat.attackers = state.combat.attackers.filter(a => a.attackerId !== tid);
                state.combat.blockers = state.combat.blockers.filter(b => b.blockerId !== tid);
            }
            log(`${obj.definition.name} phased ${value ? 'out' : 'in'}.`);
        }
    });
  }

  private static handleDestroy(state: GameState, targets: string[], log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid);
        if (obj) {
            if (LayerProcessor.hasKeyword(obj, state, 'Indestructible')) {
                log(`${obj.definition.name} is indestructible.`);
                return;
            }
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
        }
    });
  }

  private static handleGainLife(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        if (state.players[pid]) {
            state.players[pid].life += amount;
            state.turnState.lastLifeGainedAmount = amount;
            log(`${state.players[pid].name} gains ${amount} life.`);
        }
    });
  }

  private static handleAddCounters(state: GameState, targets: string[], amount: number, type: string, log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid);
        if (obj) {
            obj.counters[type] = (obj.counters[type] || 0) + amount;
            log(`Added ${amount} ${type} counter(s) to ${obj.definition.name}.`);
        }
    });
  }

  private static handleCreateToken(state: GameState, targets: string[], amount: number, blueprint: any, log: (m: string) => void) {
    targets.forEach(pid => {
        if (!blueprint) return;
        for (let i = 0; i < amount; i++) {
            this.createToken(state, blueprint, pid);
        }
        log(`Created ${amount} ${blueprint.name} token(s) for ${state.players[pid]?.name}.`);
    });
  }

  private static handleSearchLibrary(state: GameState, targets: string[], log: (m: string) => void) {
    targets.forEach(pid => log(`[SEARCH] ${state.players[pid]?.name} is searching...`));
  }

  /**
   * CR 611: Applying a Continuous Effect from a spell or ability resolution.
   * Registers it into the central rule registry so LayerProcessor can evaluate it.
   */
  private static handleApplyContinuousEffect(
    state: GameState,
    effect: EffectDefinition,
    sourceId: GameObjectId,
    resolvedTargetIds: string[],
    log: (m: string) => void
  ) {
    const sourceObj = this.findObject(state, sourceId);
    const controllerId = sourceObj?.controllerId || state.activePlayerId;
    const durationStr = (effect as any).duration || 'UNTIL_END_OF_TURN';
    // Normalize duration string to {type: 'UntilEndOfTurn'} or {type: 'Static'}
    const durationType = (durationStr === 'UNTIL_END_OF_TURN' || durationStr === 'UntilEndOfTurn')
        ? 'UntilEndOfTurn'
        : 'Static';

    const effId = `floating_${sourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const continuousEff: any = {
        id: effId,
        sourceId: 'floating', // Floating: not tied to a permanent's presence on battlefield
        controllerId,
        layer: (effect as any).layer || 7,
        timestamp: Date.now(),
        activeZones: ['Battlefield'],
        duration: { type: durationType },
        targetMapping: (effect as any).targetMapping,
        targetIds: resolvedTargetIds.length > 0 ? resolvedTargetIds : undefined,
        abilitiesToAdd: (effect as any).abilitiesToAdd,
        abilitiesToRemove: (effect as any).abilitiesToRemove,
        powerModifier: (effect as any).powerModifier,
        toughnessModifier: (effect as any).toughnessModifier,
    };

    state.ruleRegistry.continuousEffects.push(continuousEff);
    const keywords = (effect as any).abilitiesToAdd?.join(', ') || '';
    const mods = [];
    if ((effect as any).powerModifier) mods.push(`+${(effect as any).powerModifier}/+${(effect as any).toughnessModifier}`);
    if (keywords) mods.push(keywords);
    log(`Applied continuous effect [${durationStr}]: ${mods.join(', ')} to ${resolvedTargetIds.length} target(s).`);
  }

  /* --- Helper Methods --- */

  private static resolveAmount(
    state: GameState, 
    amount: number | string | undefined, 
    sourceId: GameObjectId, 
    controllerId: PlayerId
  ): number {
    if (amount === undefined) return 0;
    if (typeof amount === 'number') {
      return amount === -1 ? state.turnState.lastDamageAmount || 0 : amount;
    }

    switch (amount) {
      case 'POWER': {
        const obj = this.findObject(state, sourceId);
        return obj?.effectiveStats?.power || parseInt(obj?.definition.power || '0') || 0;
      }
      case 'TOUGHNESS': {
        const obj = this.findObject(state, sourceId);
        return obj?.effectiveStats?.toughness || parseInt(obj?.definition.toughness || '0') || 0;
      }
      case 'TARGET_1_CMC': {
        const stackObj = state.stack.find(s => s.id === sourceId);
        const tid = stackObj?.targets?.[0];
        if (!tid) return 0;
        const obj = this.findObject(state, tid as string);
        return obj ? ManaProcessor.getManaValue(obj.definition.manaCost || '') : 0;
      }
      case 'SHRINE_COUNT':
        return state.battlefield.filter(o => o.controllerId === controllerId && o.definition.subtypes.includes('Shrine')).length;
      case '2_PER_FLYING_CREATURE_YOU_CONTROL':
        const flyingCount = state.battlefield.filter(o => o.controllerId === controllerId && (o.effectiveStats?.keywords.includes('Flying') || o.definition.keywords.includes('Flying'))).length;
        return 2 * flyingCount;
      case 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT':
        const player = state.players[controllerId];
        return player ? player.graveyard.filter(o => o.definition.types.includes('Instant') || o.definition.types.includes('Sorcery')).length : 0;
      case 'DAMAGE_DEALT_AMOUNT':
          return state.turnState.lastDamageAmount || 0;
      case 'LIFE_GAINED_AMOUNT':
          return state.turnState.lastLifeGainedAmount || 0;
      case 'X': {
          const stackObj = state.stack.find(s => s.id === sourceId);
          return stackObj?.xValue || 0;
      }
      default:
        return 0;
    }
  }

  private static resolveTargetMapping(
    state: GameState, 
    mapping: string, 
    targets: string[], 
    sourceId: GameObjectId,
    controllerId: PlayerId
  ): string[] {
    switch (mapping) {
      case 'SELF': return [sourceId];
      case 'CONTROLLER': return [controllerId];
      case 'TARGET_1': return [targets[0]];
      case 'TARGET_2': return [targets[1]];
      case 'TARGET_ALL': return targets;
      case 'TARGET_1_CONTROLLER':
        const obj = this.findObject(state, targets[0]);
        return obj ? [obj.controllerId] : [];
      case 'ALL_CREATURES_YOU_CONTROL':
        return state.battlefield
          .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
          .map(o => o.id);
      case 'ALL_PERMANENTS_YOU_CONTROL':
        return state.battlefield
          .filter(o => o.controllerId === controllerId)
          .map(o => o.id);
      case 'ALL_CREATURES':
        return state.battlefield
          .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature'))
          .map(o => o.id);
      case 'EACH_OPPONENT':
          return Object.keys(state.players).filter(pid => pid !== controllerId);
      default:
        return [];
    }
  }

  private static findObject(state: GameState, id: string): GameObject | undefined {
    return state.battlefield.find(o => o.id === id) || 
           state.exile.find(o => o.id === id) ||
           state.stack.find(s => s.id === id || s.sourceId === id)?.card ||
           Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === id);
  }

  private static createToken(state: GameState, blueprint: any, controllerId: PlayerId) {
    const token: GameObject = {
      id: `token_${Math.random().toString(36).substr(2, 9)}`,
      ownerId: controllerId,
      controllerId: controllerId,
      definition: {
        name: blueprint.name,
        manaCost: "",
        colors: blueprint.colors,
        supertypes: [],
        types: [...blueprint.types, "Token"],
        subtypes: blueprint.subtypes,
        power: blueprint.power,
        toughness: blueprint.toughness,
        keywords: blueprint.keywords,
        oracleText: blueprint.oracleText || "",
        image_url: blueprint.image_url || ""
      },
      zone: Zone.Battlefield,
      isTapped: false,
      damageMarked: 0,
      deathtouchMarked: false,
      summoningSickness: true,
      abilitiesUsedThisTurn: 0,
      faceDown: false,
      keywords: [],
      counters: {}
    };
    (token as any).isToken = true;
    state.battlefield.push(token);
  }
}
