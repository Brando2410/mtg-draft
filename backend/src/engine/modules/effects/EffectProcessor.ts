import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject } from '@shared/engine_types';
import { ActionProcessor } from '../actions/ActionProcessor';
import { DamageProcessor } from '../combat/DamageProcessor';
import { ValidationProcessor } from '../state/ValidationProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { LayerProcessor } from '../state/LayerProcessor';

/**
 * Rules Engine Module: Effect Resolution (Rule 608/609)
 * Interprets EffectDefinitions and translates them into GameState mutations.
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
    // We filter out any targets that represent objects (but not players) if they are no longer legal.
    const validTargetIds = resolvedTargetIds.filter(tid => {
        if (state.players[tid]) return true; // Keep players
        const obj = this.findObject(state, tid);
        if (!obj) return false;
        
        // If it's a targeted mapping like TARGET_1, TARGET_2, TARGET_ALL, 
        // we must re-evaluate if it's still a legal target for the source effect.
        if (['TARGET_1', 'TARGET_2', 'TARGET_ALL', 'TARGET_1_CONTROLLER', 'TARGET_1_OPPONENT'].includes(effect.targetMapping)) {
            const stackObj = state.stack.find(s => s.id === (state as any).lastResolvedStackId || s.sourceId === sourceId);
            const targetDef = (effect as any).targetDefinition || stackObj?.data?.targetDefinition;
            return ValidationProcessor.isLegalTarget(state, sourceId, tid, targetDef);
        }
        return true;
    });

    const amount = this.resolveAmount(state, effect.amount, sourceId, controllerId);

    switch (effect.type) {
      case 'DrawCards':
        validTargetIds.forEach(pid => {

          const player = state.players[pid];
          if (player) {
            for (let i = 0; i < amount; i++) {
              if (player.library.length > 0) {
                const card = player.library.pop()!;
                ActionProcessor.moveCard(state, card, Zone.Hand, pid, log);
              } else {
                log(`${player.name} tried to draw from an empty library!`);
              }
            }
            log(`${player.name} draws ${amount} cards.`);
          }
        });
        break;
      
      case 'DiscardCards':
        validTargetIds.forEach(pid => {
          const player = state.players[pid];
          if (player) {
            if (amount === -1) { // Discard hand
               const handCount = player.hand.length;
               while (player.hand.length > 0) {
                 ActionProcessor.moveCard(state, player.hand[0], Zone.Graveyard, pid, log);
               }
               log(`${player.name} discarded their hand (${handCount} cards).`);
            } else if (amount > 0) {
               // Rule: If amount > 0, we need the player to choose. 
               // We set a pending action.
               state.pendingAction = {
                 type: 'DISCARD',
                 playerId: pid,
                 sourceId: sourceId,
                 data: { amount: amount }
               };
               player.pendingDiscardCount = amount;
               log(`${player.name} must discard ${amount} card(s).`);
            }
          }
        });
        break;

      case 'DealDamage':
        validTargetIds.forEach(tid => {
          DamageProcessor.dealDamage(state, sourceId, tid, amount, false, log);
        });
        break;

      case 'Exile':
        validTargetIds.forEach(tid => {
          // Check if the target is a player (meaning top of deck) or an object
          const player = state.players[tid];
          if (player) {
              const card = player.library.pop();
              if (card) {
                  log(`Exiling top card of ${player.name}'s library: ${card.definition.name}`);
                  ActionProcessor.moveCard(state, card, Zone.Exile, player.id, log);
              }
          } else {
              const obj = this.findObject(state, tid);
              if (obj) {
                log(`Exiling ${obj.definition.name}`);
                ActionProcessor.moveCard(state, obj, Zone.Exile, obj.ownerId, log);
              }
          }
        });
        break;

      case 'ReturnToHand':
        validTargetIds.forEach(tid => {
          const obj = this.findObject(state, tid);
          if (obj) {
            log(`Returning ${obj.definition.name} to hand.`);
            ActionProcessor.moveCard(state, obj, Zone.Hand, obj.ownerId, log);
            state.turnState.permanentReturnedToHandThisTurn = true;
          }
        });
        break;

      case 'PhasedOut':
        validTargetIds.forEach(tid => {
          const obj = this.findObject(state, tid);
          if (obj) {
            obj.isPhasedOut = effect.value !== false;
            // CR 702.26b: A phased-out permanent is removed from combat.
            if (state.combat) {
              state.combat.attackers = state.combat.attackers.filter(a => a.attackerId !== tid);
              state.combat.blockers = state.combat.blockers.filter(b => b.blockerId !== tid);
            }
            log(`${obj.definition.name} phased out.`);
          }
        });
        break;

      case 'Destroy':
        validTargetIds.forEach(tid => {
          const obj = this.findObject(state, tid);
          if (obj) {
            // CR 701.7b: Indestructible check
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            if (stats.keywords.some((k: string) => k.toLowerCase() === 'indestructible')) {
                log(`${obj.definition.name} is indestructible and cannot be destroyed.`);
                return;
            }

            log(`Destroying ${obj.definition.name}.`);
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
          }
        });
        break;

      case 'GainLife':
        validTargetIds.forEach(pid => {
          if (state.players[pid]) {
            state.players[pid].life += amount;
            state.turnState.lastLifeGainedAmount = amount;
            log(`Player ${pid} gains ${amount} life.`);
          }
        });
        break;

      case 'AddCounters':
        const counterType = effect.value || '+1/+1';
        validTargetIds.forEach(tid => {
          const obj = this.findObject(state, tid);
          if (obj) {
            obj.counters[counterType] = (obj.counters[counterType] || 0) + amount;
            log(`Added ${amount} ${counterType} counter to ${obj.definition.name}.`);
          }
        });
        break;

      case 'CreateToken':
        if (effect.tokenBlueprint) {
          validTargetIds.forEach(pid => {
            log(`Creating ${amount} ${effect.tokenBlueprint?.name} token(s) for ${pid}`);
            for (let i = 0; i < amount; i++) {
              this.createToken(state, effect.tokenBlueprint!, pid);
            }
          });
        }
        break;

      case 'SearchLibrary':
        validTargetIds.forEach(pid => {
            log(`[SEARCH] ${state.players[pid].name} is searching their library (UI Interaction Required).`);
            // This would normally set a PENDING_ACTION with a 'SEARCH' type
            // for the frontend to show the LibraryViewer.
        });
        break;
      
      case 'ApplyContinuousEffect':
        // Layer Processor handles these via the ruleRegistry
        break;

      case 'Choice':
        log(`[CHOICE] Resolving modal choice...`);
        break;

      default:
        log(`[WARNING] Effect type ${effect.type} not yet implemented in EffectProcessor.`);
    }
  }

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
      case 'ALL_CREATURES':
        return state.battlefield
          .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature'))
          .map(o => o.id);
      case 'ENCHANTED_CREATURE': {
          const aura = this.findObject(state, sourceId);
          // In a real engine, we'd check state.attachments[sourceId]
          // For now, assume it's stored in targets[0] if it's an aura ETB or static
          return [targets[0]];
      }
      case 'EACH_OPPONENT':
          return Object.keys(state.players).filter(pid => pid !== controllerId);
      case 'TARGET_1_OPPONENT':
        const targetObj = this.findObject(state, targets[0]);
        return targetObj ? [targetObj.controllerId] : []; 
      default:
        return [];
    }
  }

  private static findObject(state: GameState, id: string): GameObject | undefined {
    return state.battlefield.find(o => o.id === id) || 
           state.exile.find(o => o.id === id) ||
           state.stack.find(s => s.id === id)?.card ||
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
