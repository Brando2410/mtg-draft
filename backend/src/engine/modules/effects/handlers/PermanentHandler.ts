import { GameState, GameObject, Zone, PlayerId, ActionType, GameObjectId, EmblemDefinition } from '@shared/engine_types';
import { ActionProcessor } from '../../actions/ActionProcessor';
import { TriggerProcessor } from '../TriggerProcessor';
import { ChoiceGenerator } from '../ChoiceGenerator';
import { LayerProcessor } from '../../state/LayerProcessor';

/**
 * Strategy for CR 110: Permanents and CR 701: Keyword Actions
 */
export class PermanentHandler {

  public static handleDestroy(state: GameState, targets: string[], log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = state.battlefield.find(o => o.id === tid);
        if (obj) {
            if (LayerProcessor.hasKeyword(obj, state, 'Indestructible')) {
                log(`${obj.definition.name} is indestructible.`);
                return;
            }
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
        }
    });
  }

  public static handleSacrifice(state: GameState, targets: string[], sourceId: string, log: (m: string) => void, stackObject?: any, parentContext?: any, effect?: any) {
    if (targets.length === 0) return;

    const [tid, ...nextTargets] = targets;
    const player = state.players[tid as PlayerId];
    if (player) {
        let creatures = state.battlefield.filter(o => o.controllerId === tid && o.definition.types.some(t => t.toLowerCase() === 'creature'));
        
        // Apply GreatestPower restriction (Professor Onyx)
        if (effect?.restrictions?.includes('GreatestPower')) {
            const powers = creatures.map(c => LayerProcessor.getEffectiveStats(c, state).power);
            const maxPower = powers.length > 0 ? Math.max(...powers) : 0;
            creatures = creatures.filter(c => LayerProcessor.getEffectiveStats(c, state).power === maxPower);
        }

        if (creatures.length === 0) {
            this.handleSacrifice(state, nextTargets, sourceId, log, stackObject, parentContext, effect);
            return;
        }
        
        if (creatures.length === 1) {
            ActionProcessor.moveCard(state, creatures[0], Zone.Graveyard, tid as PlayerId, log);
            this.handleSacrifice(state, nextTargets, sourceId, log, stackObject, parentContext, effect);
            return;
        }

        state.pendingAction = ChoiceGenerator.createCardChoice(state, creatures, {
            label: effect?.label || "Choose a creature to sacrifice",
            playerId: tid as PlayerId,
            sourceId: sourceId,
            optional: false,
            actionType: ActionType.ResolutionChoice,
            onSelected: (c) => [{ type: 'Sacrifice', targetId: c.id }],
            stackObj: stackObject,
            parentContext: parentContext
        });

        // Store next targets in pendingAction to continue sequence
        if (state.pendingAction && nextTargets.length > 0) {
            state.pendingAction.data.nextPlayerIds = nextTargets;
            state.pendingAction.data.isSacrificeSequence = true;
        }
    } else {
        const obj = state.battlefield.find(o => o.id === tid);
        if (obj) ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.controllerId, log);
        this.handleSacrifice(state, nextTargets, sourceId, log, stackObject, parentContext, effect);
    }
  }

  public static handleUntap(state: GameState, targets: string[], log: (m: string) => void) {
      targets.forEach(tid => {
          const obj = state.battlefield.find(o => o.id === tid);
          if (obj) {
              obj.isTapped = false;
              log(`${obj.definition.name} untapped.`);
          }
      });
  }

  public static handlePrepare(state: GameState, targets: string[], log: (m: string) => void) {
      targets.forEach(tid => {
          const obj = state.battlefield.find(o => o.id === tid);
          if (obj) {
              obj.isPrepared = true;
              log(`${obj.definition.name} is now prepared.`);
              TriggerProcessor.onEvent(state, { type: 'ON_PREPARE', targetId: obj.id, sourceId: obj.id, data: { object: obj } }, log);
          }
      });
  }

  public static handleUnprepare(state: GameState, targets: string[], log: (m: string) => void) {
      targets.forEach(tid => {
          const obj = state.battlefield.find(o => o.id === tid);
          if (obj) {
              obj.isPrepared = false;
              log(`${obj.definition.name} is now unprepared.`);
          }
      });
  }

  public static handleTap(state: GameState, targets: string[], log: (m: string) => void) {
      targets.forEach(tid => {
          const obj = state.battlefield.find(o => o.id === tid);
          if (obj) {
              if (obj.isTapped) return;
              obj.isTapped = true;
              log(`${obj.definition.name} tapped.`);
          }
      });
  }

  public static handleFight(state: GameState, targets: string[], log: (m: string) => void) {
      if (targets.length < 2) return;
      const c1 = state.battlefield.find(o => o.id === targets[0]);
      const c2 = state.battlefield.find(o => o.id === targets[1]);
      if (!c1 || !c2) return;

      const p1 = LayerProcessor.getEffectiveStats(c1, state).power;
      const p2 = LayerProcessor.getEffectiveStats(c2, state).power;
      log(`[FIGHT] ${c1.definition.name} fights ${c2.definition.name}.`);
      
      const { DamageProcessor } = require('../../combat/DamageProcessor');
      DamageProcessor.dealDamage(state, c1.id, c2.id, p1, false, log);
      DamageProcessor.dealDamage(state, c2.id, c1.id, p2, false, log);
  }

  public static handleAddCounters(state: GameState, targets: string[], amount: number, type: string, log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = state.battlefield.find(o => o.id === tid);
        if (obj) {
            obj.counters[type] = (obj.counters[type] || 0) + amount;
            TriggerProcessor.onEvent(state, { type: 'ON_COUNTERS_ADDED', targetId: obj.id, amount, counterType: type, data: { object: obj } }, log);
        }
    });
  }

  public static handleMoveCounters(state: GameState, targets: string[], sourceId: string, log: (m: string) => void, effect?: any) {
    const sourceObj = state.battlefield.find(o => o.id === sourceId) || state.exile.find(o => o.id === sourceId) || Object.values(state.players).flatMap(p => p.graveyard).find((o: any) => o.id === sourceId);
    if (!sourceObj) return;

    const counterType = effect.counterType || 'P1P1';
    const amount = sourceObj.counters[counterType] || 0;
    if (amount <= 0) return;

    targets.forEach(tid => {
        const targetObj = state.battlefield.find(o => o.id === tid);
        if (targetObj) {
            targetObj.counters[counterType] = (targetObj.counters[counterType] || 0) + amount;
            log(`[MOVE-COUNTERS] Moved ${amount} ${counterType} counters from ${sourceObj.definition.name} to ${targetObj.definition.name}.`);
        }
    });
    sourceObj.counters[counterType] = 0;
  }

  public static handleCreateToken(state: GameState, targets: string[], amount: number, blueprint: any, log: (m: string) => void, pOverride?: number, tOverride?: number, effect?: any, stackObject?: any) {
    targets.forEach(pid => {
        if (!blueprint) return;
        for (let i = 0; i < amount; i++) {
            const token = this.createToken(state, blueprint, pid as PlayerId, pOverride, tOverride, effect);
            (state as any).lastCreatedTokenId = token.id;
            
            // Manage starting counters (e.g. Fractal tokens)
            if (effect?.startingCounters) {
                const { type, amount: cAmount } = effect.startingCounters;
                let resolvedAmount = typeof cAmount === 'string' ? 0 : cAmount;
                if (typeof cAmount === 'string') {
                    const { EffectProcessor } = require('../effects/EffectProcessor');
                    resolvedAmount = EffectProcessor.resolveAmount(state, cAmount, token.id, pid as PlayerId, stackObject);
                }
                if (resolvedAmount > 0) {
                    token.counters[type] = (token.counters[type] || 0) + resolvedAmount;
                }
            }

            if (effect?.isAttacking && state.combat) {
                state.combat.attackers.push({ attackerId: token.id, targetId: (effect.attackTargetId || Object.keys(state.players).find(id => id !== pid)!) });
                token.isTapped = true;
            }
        }
    });
  }

  public static handleCreateTokenCopy(state: GameState, targets: string[], sourceObj: GameObject, controllerId: PlayerId, log: (m: string) => void, effect: any) {
    targets.forEach(pid => {
        const blueprint = {
            ...sourceObj.definition,
            types: [...(sourceObj.definition.types || []), ...(effect.typesToAdd || [])],
            subtypes: [...(sourceObj.definition.subtypes || []), ...(effect.subtypesToAdd || [])],
            abilities: [...(sourceObj.definition.abilities || []), ...(effect.abilitiesToAdd || [])],
            image_url: sourceObj.definition.image_url
        };
        const token = this.createToken(state, blueprint, pid as PlayerId, effect.powerOverride, effect.toughnessOverride, effect);
        
        if (effect.storeLinkedId && (effect as any).originalCardId) {
            if (!token.data) token.data = {};
            token.data[effect.storeLinkedId] = (effect as any).originalCardId;
        }
        
        log(`Created token copy of ${sourceObj.definition.name} for ${pid}.`);
    });
  }

  private static createToken(state: GameState, blueprint: any, controllerId: PlayerId, pOverride?: any, tOverride?: any, effect?: any): GameObject {
      const token: GameObject = {
          id: `token_${Math.random().toString(36).substr(2, 9)}`,
          ownerId: controllerId,
          controllerId: controllerId,
          definition: {
              name: blueprint.name,
              manaCost: "",
              colors: (blueprint.colors || []).map((c: string) => {
                  const map: Record<string, string> = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
                  return map[c.toUpperCase()] || c.toLowerCase();
              }),
              supertypes: blueprint.supertypes || [],
              types: [...(blueprint.types || []), "Token"],
              subtypes: blueprint.subtypes || [],
              power: pOverride !== undefined ? String(pOverride) : (blueprint.power || "0"),
              toughness: tOverride !== undefined ? String(tOverride) : (blueprint.toughness || "0"),
              keywords: blueprint.keywords || [],
              abilities: blueprint.abilities || [],
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
          isPrepared: blueprint.entersPrepared || false,
          keywords: [],
          counters: {}
      };
      (token as any).isToken = true;
      (state as any).lastCreatedTokenId = token.id;
      state.battlefield.push(token);
      const { RegistryProcessor } = require('../../core/RegistryProcessor');
      RegistryProcessor.registerAbilities(state, token);
      TriggerProcessor.onEvent(state, { type: 'ON_ETB', targetId: token.id, sourceId: token.id, data: { object: token } }, () => {});
      return token;
  }

  public static handleCreateEmblem(state: GameState, effect: any, controllerId: PlayerId, sourceObj: any, log: (m: string) => void) {
      const blueprint = effect.emblemBlueprint;
      if (!blueprint) return;
      const emblemId = `emblem_${controllerId}_${Date.now()}`;
      const emblem: EmblemDefinition = {
          id: emblemId,
          name: blueprint.name || 'Emblem',
          controllerId,
          oracleText: blueprint.oracleText || '',
          image_url: sourceObj?.definition.image_url,
          abilities: blueprint.abilities || []
      };
      if (!state.emblems) state.emblems = [];
      state.emblems.push(emblem);
      blueprint.abilities?.forEach((ability: any, idx: number) => {
          state.ruleRegistry.triggeredAbilities.push({ ...ability, id: `${emblemId}_${idx}`, sourceId: emblemId, controllerId, activeZone: 'Command' });
      });
      log(`[EMBLEM] Created ${emblem.name} for ${state.players[controllerId]?.name}.`);
  }
}
