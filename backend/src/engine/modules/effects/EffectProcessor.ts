import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject, ContinuousEffect, DurationType, EmblemDefinition, TriggeredAbility, ActionType } from '@shared/engine_types';
import { ActionProcessor } from '../actions/ActionProcessor';
import { DamageProcessor } from '../combat/DamageProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { TriggerProcessor } from './TriggerProcessor';
import { ChoiceGenerator } from './ChoiceGenerator';

/**
 * Rules Engine Module: Effect Resolution (Rule 608/609)
 * Interprets EffectDefinitions and translates them into GameState mutations.
 * 
 * DESIGN: Strategy Pattern for effect execution.
 */
export class EffectProcessor {

  public static troubleshoot(state: GameState, sourceId?: GameObjectId) {
    const logs: string[] = [];
    logs.push("--- ENGINE TROUBLESHOOTING REPORT ---");
    logs.push(`Stack Length: ${state.stack.length}`);
    state.stack.forEach((so, i) => {
        const name = (so as any).name || (so as any).card?.definition.name || (so as any).type || "Object";
        const nextIdx = so.data?.nextEffectIndex !== undefined ? so.data.nextEffectIndex : "N/A";
        logs.push(`Stack[${i}]: ${name} (ID: ${so.id}, NextEffectIndex: ${nextIdx})`);
    });
    
    if (state.pendingAction) {
        logs.push(`Pending Action: ${state.pendingAction.type} for Player: ${state.pendingAction.playerId}`);
        const data = state.pendingAction.data || {};
        logs.push(`Pending Action Data: nextIdx=${data.nextEffectIndex}, effectsCount=${data.effects?.length}, stackObjId=${data.stackObj?.id}`);
        if (data.parentContext) {
            logs.push(`Parent Context exists (NextIdx: ${data.parentContext.nextEffectIndex})`);
        }
    } else {
        logs.push("No Active Pending Action.");
    }
    
    if (sourceId) {
        const obj = (state.battlefield as any[]).find(o => o.id === sourceId) || (state.stack as any[]).find(s => s.sourceId === sourceId);
        if (obj) {
            const name = (obj as any).name || (obj as any).definition?.name || "Unnamed";
            logs.push(`Source Object: ${name} (ID: ${sourceId})`);
        }
    }
    
    console.log(logs.join("\n"));
    return logs;
  }

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
    log(`[RESOLVE-EFFECTS] Starting from index ${startIndex}/${effects.length}. Targets: ${targets.join(', ')}`);
    for (let i = startIndex; i < effects.length; i++) {
        const effect = effects[i];
        this.executeEffect(state, effect, sourceId, targets, log, stackObject, parentContext);
        
        if (state.pendingAction) {
            // Save context for resumption
            if (stackObject) {
                if (!stackObject.data) stackObject.data = {};
                stackObject.data.nextEffectIndex = i + 1;
            }

            state.pendingAction.data = {
                ...(state.pendingAction.data || {}),
                effects: effects,
                nextEffectIndex: i + 1,
                targets: targets,
                stackObj: stackObject,
                parentContext: parentContext
            };

            state.priorityPlayerId = state.pendingAction.playerId;
            return false;
        }
    }

    // Mark as completed in the stack object to prevent redundant resolution
    if (stackObject) {
        if (!stackObject.data) stackObject.data = {};
        stackObject.data.nextEffectIndex = effects.length;
    }
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
    const sourceObj = this.findObject(state, sourceId, stackObject, parentContext) || (stackObject?.card ? stackObject.card : stackObject);
    const controllerId = sourceObj?.controllerId || state.activePlayerId;
    log(`[EXECUTE-EFFECT] Type: ${effect.type}. Mapping: ${(effect as any).targetMapping}. Targets in context: ${targets.join(', ')}`);

    // --- CR 601.2c / 608.2b: TARGETING FOR MID-SPELL EFFECTS ---
    // If an effect has a targetDefinition but no target has been selected yet (length 0),
    // it means this effect is part of a complex spell (like a choice) that needs a NEW targeting phase.
    if ((effect as any).targetDefinition && targets.length === 0) {
        const targetDef = (effect as any).targetDefinition;
        const { TargetingProcessor } = require('../actions/TargetingProcessor');
        const legalTargetIds = this.getLegalTargetIdsForEffect(state, sourceId, targetDef, stackObject);
        
        if (legalTargetIds.length === 0) {
            log(`[RESOLVING] No legal targets found for ${effect.type}${!targetDef.optional ? ' (Mandatory)' : ''}. Skipping sub-effect.`);
            // CR 608.2b: If no legal targets exist, the effect fails to apply. 
            // We return here to skip the rest of this SPECIFIC effect list (like a choice branch), 
            // which will trigger the parent context resumption logic.
            return;
        }

        state.pendingAction = {
            type: 'TARGETING',
            playerId: controllerId,
            sourceId: sourceId,
            data: {
                targetDefinition: targetDef,
                targets: [],
                legalTargetIds: legalTargetIds,
                stackObj: stackObject, // Preserve context
                parentContext: parentContext // Keep resolution chain
            }
        };
        log(`[RESOLVING] ${state.players[controllerId]?.name} must select a target for ${effect.type}.`);
        return; // SUSPEND RESOLUTION
    }

    const { TargetingProcessor } = require('../actions/TargetingProcessor');
    let resolvedTargetIds = TargetingProcessor.resolveTargetMapping(state, (effect as any).targetMapping || "", targets, sourceId, controllerId, stackObject?.data, effect);
    if ((effect as any).targetId) resolvedTargetIds = [(effect as any).targetId]; // Override if hardcoded specifically for this sub-action
    
    const validTargetIds = this.getValidTargetIds(state, effect, resolvedTargetIds, sourceId, sourceObj, stackObject, parentContext);

    if (resolvedTargetIds.length > 0 && validTargetIds.length === 0) {
        // If it was targeted but all targets became invalid, skip this specific effect.
        return;
    }

    let amount = (effect as any).amount !== undefined 
        ? this.resolveAmount(state, effect.amount, sourceId, controllerId, stackObject)
        : 1; // Default to 1 if amount is not specified in data (MTG: "a" token, "a" card, etc.)

    // --- CR 608.2: EVALUATE CONDITIONS ---
    if (effect.condition && !this.checkCondition(state, effect.condition, stackObject, parentContext)) {
        log(`[RESOLVING] Condition NOT met for ${effect.type}. Skipping.`);
        return;
    }

    // CR 609: Effect Strategy Dispatcher
    switch (effect.type) {
      case 'DrawCards':           this.handleMoveToZone(state, { ...effect, type: effect.type, selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: amount, destination: Zone.Hand }, validTargetIds, log, stackObject, parentContext); break;
      case 'DiscardCards':        this.handleDiscardCards(state, validTargetIds, amount, sourceId, log); break;
      case 'DealDamage':          this.handleDealDamage(state, validTargetIds, amount, sourceId, log); break;
      case 'Exile':               this.handleMoveToZone(state, { ...effect, type: effect.type, destination: Zone.Exile }, validTargetIds, log, stackObject, parentContext); break;
      case 'ExileTopCard':        this.handleMoveToZone(state, { ...effect, type: effect.type, selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: amount, destination: Zone.Exile }, validTargetIds, log, stackObject, parentContext); break;
      case 'ExileAllCards':       this.handleMoveToZone(state, { ...effect, type: effect.type, selectionType: 'All', sourceZones: [Zone.Graveyard], destination: Zone.Exile }, validTargetIds, log, stackObject, parentContext); break;
      case 'CopySpellOnStack':    this.handleCopySpellOnStack(state, validTargetIds, controllerId, log); break;
      case 'ReturnToHand':        this.handleMoveToZone(state, { ...effect, type: effect.type, destination: Zone.Hand }, validTargetIds, log, stackObject, parentContext); break;
      case 'PhasedOut':           this.handlePhasedOut(state, validTargetIds, effect.value !== false, log, stackObject, parentContext); break;
      case 'Destroy':             this.handleDestroy(state, validTargetIds, log, stackObject, parentContext); break;
      case 'GainLife':            this.handleGainLife(state, validTargetIds, amount, log); break;
      case 'LoseLife':            this.handleLoseLife(state, validTargetIds, amount, log); break;
      case 'AddCounters':         this.handleAddCounters(state, validTargetIds, amount, effect.value || '+1/+1', log); break;
      case 'CreateToken': {
          let p = (effect as any).powerOverride !== undefined ? this.resolveAmount(state, (effect as any).powerOverride, sourceId, controllerId, stackObject) : undefined;
          let t = (effect as any).toughnessOverride !== undefined ? this.resolveAmount(state, (effect as any).toughnessOverride, sourceId, controllerId, stackObject) : undefined;
          this.handleCreateToken(state, validTargetIds, amount, (effect as any).tokenBlueprint, log, p, t, effect); 
          break;
      }
      case 'SearchLibrary':       this.handleMoveToZone(state, { ...effect, type: effect.type, selectionType: 'Search', sourceZones: [Zone.Library], shuffle: true, reveal: true }, validTargetIds, log, stackObject, parentContext); break;
      case 'Scry':                this.handleMoveToZone(state, { ...effect, type: effect.type, fromTop: amount, sourceZones: [Zone.Library], selectionType: 'TopN' }, validTargetIds, log, stackObject, parentContext); break;
      case 'LookAtTopAndPick':     this.handleMoveToZone(state, { ...effect, type: effect.type, selectionType: 'TopN', sourceZones: [Zone.Library], fromTop: amount }, validTargetIds, log, stackObject, parentContext); break;
      case 'MoveToZone':           this.handleMoveToZone(state, effect, validTargetIds, log, stackObject, parentContext); break;
      case 'PutRemainderOnBottomRandom': this.handleMoveToZone(state, { ...effect, type: effect.type, selectionType: 'Target', destination: Zone.Library, remainderZone: Zone.Library }, validTargetIds, log, stackObject, parentContext); break;
      case 'Sacrifice':            this.handleSacrifice(state, validTargetIds, sourceId, log, stackObject, parentContext); break;
      case 'AddTriggeredAbility':  this.handleAddTriggeredAbility(state, effect, sourceId, log); break;
      case 'Fight':                this.handleFight(state, validTargetIds, log); break;
      case 'AddPreventionEffect':  this.handleAddPreventionEffect(state, effect, sourceId, log); break;
      case 'Shuffle':              this.shuffleLibrary(state.players[validTargetIds[0] as PlayerId], log); break;
      case 'Log':                  log(effect.message || ""); break;
      case 'ApplyContinuousEffect': this.handleApplyContinuousEffect(state, effect, sourceId, validTargetIds, log, stackObject, parentContext); break;
      case 'Choice':               this.handleChoice(state, effect, sourceId, validTargetIds, log, stackObject, parentContext); break;
      default:
        log(`[WARNING] Effect type ${effect.type} not yet implemented.`);
      }
  }

  private static getValidTargetIds(
    state: GameState,
    effect: EffectDefinition,
    resolvedTargetIds: string[],
    sourceId: GameObjectId,
    sourceObj: any,
    stackObject?: any,
    parentContext?: any
  ): string[] {
    const { TargetingProcessor } = require('../actions/TargetingProcessor');
    return resolvedTargetIds.filter((tid: string) => {
        if (!tid) return false;
        if (state.players[tid]) return true; // Keep players
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (!obj) return false;
        
        if (['TARGET_1', 'TARGET_2', 'TARGET_ALL', 'TARGET_1_CONTROLLER', 'TARGET_1_OPPONENT', 'EVENT_TARGET'].includes(effect.targetMapping || "")) {
            const tempStackObj = state.stack.find(s => s.id === (state as any).lastResolvedStackId || s.sourceId === sourceId) || stackObject;
            const targetDef = (effect as any).targetDefinition || tempStackObj?.data?.targetDefinition;
            if (!targetDef) return true; // SELECTED/CHOICE result, skip formal targeting validation
            return TargetingProcessor.isLegalTarget(state, (sourceObj as any) || (sourceId as any), tid, targetDef);
        }
        return true;
    });
  }

  private static shuffleLibrary(player: any, log: (m: string) => void) {
      if (!player) return;
      for (let i = player.library.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [player.library[i], player.library[j]] = [player.library[j], player.library[i]];
      }
      log(`[SHUFFLE] ${player.name} shuffled their library.`);
  }

  private static handleAddTriggeredAbility(state: GameState, effect: any, sourceId: string, log: (m: string) => void) {
      const sourceObj = state.battlefield.find(o => o.id === sourceId) || state.players[sourceId as any];
      const controllerId = (sourceObj as any)?.controllerId || (state.activePlayerId);

      const trigger: TriggeredAbility = {
          id: `delayed_trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          sourceId: sourceId,
          controllerId: controllerId,
          eventMatch: effect.eventMatch || effect.on,
          activeZone: 'Any',
          duration: { type: (effect.duration || 'UNTIL_END_OF_TURN') as any },
          ...effect
      };

      state.ruleRegistry.triggeredAbilities.push(trigger);
      log(`[DELAYED-TRIGGER] A new trigger was registered until end of turn.`);
  }

  private static handleAddPreventionEffect(state: GameState, effect: any, sourceId: string, log: (m: string) => void) {
      const sourceObj = this.findObject(state, sourceId);
      const controllerId = (sourceObj as any)?.controllerId || state.activePlayerId;

      const prevention: any = {
          id: `prevention_${Date.now()}_${Math.random()}`,
          sourceId,
          controllerId,
          damageType: effect.damageType || 'CombatDamage',
          targetMapping: effect.targetMapping,
          duration: effect.duration || 'UntilEndOfTurn'
      };

      if (!state.ruleRegistry.preventionEffects) state.ruleRegistry.preventionEffects = [];
      state.ruleRegistry.preventionEffects.push(prevention);
      log(`[PREVENTION] ${prevention.damageType} to ${prevention.targetMapping} will be prevented this turn.`);
  }

  /* --- Concrete Effect Handlers (CR 609) --- */

  private static handleMoveToZone(state: GameState, effect: EffectDefinition, targets: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const controllerId = (stackObject as any)?.controllerId || state.activePlayerId;
    const targetIds = targets.length > 0 ? targets : ((stackObject as any)?.targets || []);
    const selectionType = effect.selectionType || 'Target';

    log(`[MOVE-TO-ZONE] Selection: ${selectionType}. Destination: ${effect.destination || effect.zone}.`);

    if (selectionType === 'Target' && targetIds.length > 0) {
        return this.resolveMoveTargets(state, effect, targetIds, log, stackObject, parentContext);
    }
    if ((effect.fromTop || 0) > 0 && (effect.sourceZones || []).includes(Zone.Library)) {
        return this.resolveLibraryTopMoves(state, effect, controllerId, log, stackObject, parentContext);
    }
    if (selectionType === 'Search' && (effect.sourceZones || []).includes(Zone.Library)) {
        return this.resolveLibrarySearch(state, effect, controllerId, log, stackObject, parentContext);
    }
    if (selectionType === 'All') {
        return this.resolveMassMove(state, effect, targetIds, controllerId, log, stackObject, parentContext);
    }

    return this.resolveSingleTargetMove(state, effect, targetIds, log, stackObject, parentContext);
  }

  private static resolveMoveTargets(state: GameState, effect: EffectDefinition, targetIds: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const { ActionProcessor } = require('../actions/ActionProcessor');
    const destination = effect.zone || effect.destination || Zone.Hand;

    targetIds.forEach((tid: string) => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (obj) {
            const from = obj.zone;
            ActionProcessor.moveCard(state, obj, destination, obj.ownerId, log);
            if (destination === Zone.Exile) {
                TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: tid, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
            }
        }
    });
  }

  private static resolveLibraryTopMoves(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const { ActionProcessor } = require('../actions/ActionProcessor');
    const player = state.players[controllerId];
    if (!player) return;

    const fromTop = effect.fromTop || 0;
    const destination = effect.zone || effect.destination || Zone.Hand;
    const cards: GameObject[] = [];
    for (let i = 0; i < fromTop && player.library.length > 0; i++) {
        cards.push(player.library.pop()!);
    }
    if (cards.length === 0) return;

    if (effect.type === 'LookAtTopAndPick') {
        state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
            label: effect.label || `Choose a card from the top ${cards.length}`,
            playerId: controllerId,
            sourceId: stackObject?.sourceId || '',
            restrictions: effect.restrictions,
            reveal: effect.reveal,
            optional: effect.optional,
            actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
            onSelected: (c: any) => {
                const subEffects = [];
                if (effect.splitDestinations) {
                    subEffects.push({ type: 'MoveToZone', targetId: (c as any).id, zone: effect.splitDestinations[0].zone, tapped: effect.splitDestinations[0].tapped, reveal: effect.reveal });
                } else {
                    subEffects.push({ type: 'MoveToZone', targetId: (c as any).id, zone: destination, reveal: effect.reveal });
                }
                
                const remainder = cards.filter(o => o.id !== c.id);
                if (remainder.length > 0) {
                    subEffects.push({ type: 'MoveToZone', selectionType: 'Target', targetIds: remainder.map(o => o.id), zone: effect.remainderZone || Zone.Library });
                }
                return subEffects;
            },
            onNone: () => [
                { type: 'MoveToZone', selectionType: 'Target', targetIds: cards.map(o => o.id), zone: effect.remainderZone || Zone.Library }
            ],
            stackObj: stackObject,
            parentContext: parentContext
        });
        return;
    }

    if (effect.type === 'Scry') {
        if (fromTop === 1) {
            state.pendingAction = ChoiceGenerator.createModalChoice({ 
              label: `Scry ${cards[0].definition.name}`, 
              playerId: controllerId, 
              sourceId: stackObject?.sourceId || '',
              actionType: ActionType.ResolutionChoice,
              stackObj: stackObject,
              parentContext: parentContext
            }, [
                { label: 'Put on Top', value: 'top', effects: [{ type: 'MoveToZone', targetId: cards[0].id, zone: Zone.Library }] },
                { label: 'Put on Bottom', value: 'bottom', effects: [{ type: 'MoveToZone', targetId: cards[0].id, zone: Zone.Library, remainderZone: Zone.Library }] }
            ]);
        }
        return;
    }

    cards.forEach(c => {
        const from = c.zone;
        ActionProcessor.moveCard(state, c, destination, controllerId, log);
        if (destination === Zone.Exile) {
            TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: c.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
        }
    });
  }

  private static resolveLibrarySearch(state: GameState, effect: EffectDefinition, controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const player = state.players[controllerId];
    if (!player) return;

    state.pendingAction = ChoiceGenerator.createCardChoice(state, player.library, {
        label: effect.label || "Search your library",
        playerId: controllerId,
        sourceId: stackObject?.sourceId || '',
        restrictions: effect.restrictions,
        reveal: effect.reveal,
        optional: effect.optional,
        actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
        onSelected: (c: any) => {
            const subEffects = [];
            if (effect.splitDestinations) {
                subEffects.push({ type: 'MoveToZone', targetId: (c as any).id, zone: effect.splitDestinations[0].zone, tapped: effect.splitDestinations[0].tapped, reveal: effect.reveal });
            } else {
                subEffects.push({ type: 'MoveToZone', targetId: (c as any).id, zone: effect.zone || effect.destination || Zone.Hand, reveal: effect.reveal });
            }

            if (effect.shuffle) subEffects.push({ type: 'Shuffle', targetMapping: 'CONTROLLER' } as any);
            return subEffects;
        },
        stackObj: stackObject,
        parentContext: parentContext
    });
  }

  private static resolveMassMove(state: GameState, effect: EffectDefinition, targetIds: string[], controllerId: PlayerId, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const { ActionProcessor } = require('../actions/ActionProcessor');
    const targetPlayerIds = targetIds.length > 0 ? targetIds : [controllerId];
    const destination = effect.zone || effect.destination || Zone.Hand;
    const sources = effect.sourceZones || [Zone.Battlefield];

    targetPlayerIds.forEach((tid: string) => {
        const player = state.players[tid as PlayerId];
        if (player) {
            const pool = sources.flatMap(z => {
                if (z === Zone.Graveyard) return [...player.graveyard];
                if (z === Zone.Hand) return [...player.hand];
                if (z === Zone.Library) return [...player.library];
                return [];
            });
            pool.forEach(c => {
                const from = c.zone;
                ActionProcessor.moveCard(state, c, destination, c.ownerId, log);
                if (destination === Zone.Exile) {
                    TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: c.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
                }
            });
            log(`[MASS-MOVE] Moved ${pool.length} cards from ${sources.join('/')} to ${destination}.`);
        }
    });
  }

  private static resolveSingleTargetMove(state: GameState, effect: EffectDefinition, targetIds: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const { ActionProcessor } = require('../actions/ActionProcessor');
    const obj = this.findObject(state, (effect as any).targetId || (targetIds[0]), stackObject, parentContext);
    if (obj) {
        const from = obj.zone;
        const destination = effect.zone || effect.destination || Zone.Hand;
        ActionProcessor.moveCard(state, obj, destination, obj.ownerId, log);
        if (effect.reveal) (obj as any).isRevealed = true;
        if (destination === Zone.Exile) {
            TriggerProcessor.onEvent(state, { type: 'ON_EXILE', targetId: obj.id, sourceId: (stackObject as any)?.sourceId || '', sourceZone: from }, log);
        }
    }
  }


  private static handleChoice(state: GameState, effect: any, sourceId: string, targets: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const sourceObj = this.findObject(state, sourceId, stackObject) || stackObject?.card || stackObject;
    if (!sourceObj) return;

    const controllerId = sourceObj.controllerId || state.activePlayerId;
    let dynamicChoices = effect.choices;

    // --- SUPPORT FOR PRE-SELECTED CHOICES (MODAL SETUP) ---
    // If the spell was popped from the stack for resolution, it's passed here directly.
    const preSelectedIdx = stackObject?.data?.preSelectedChoice !== undefined 
        ? stackObject.data.preSelectedChoice 
        : (stackObject as any)?.preSelectedChoice;

    if (preSelectedIdx !== undefined) {
        const choice = dynamicChoices[preSelectedIdx];
        if (choice && choice.effects) {
            log(`[RESOLVING CHOICE] Auto-resolved pre-selected mode: ${choice.label}`);
            this.resolveEffects(state, choice.effects, sourceId, targets, log, 0, stackObject, parentContext);
            return;
        }
    }

    // --- HAND-PICKING OR GRAVEYARD-PICKING ---
    const targetZoneMapping = (effect as any).targetIdMapping;
    if (['TARGET_1_HAND', 'TARGET_1_GRAVEYARD', 'CONTROLLER_HAND', 'CONTROLLER_GRAVEYARD'].includes(targetZoneMapping) && !dynamicChoices) {
        let targetPlayerId: string | undefined;
        
        if (targetZoneMapping.startsWith('TARGET_1_')) {
            targetPlayerId = targets[0];
            if (!targetPlayerId) {
                targetPlayerId = Object.keys(state.players).find(pid => pid !== controllerId);
            }
        } else {
            targetPlayerId = controllerId;
        }

        const targetPlayer = state.players[targetPlayerId as PlayerId];
        if (targetPlayer) {
            const isGraveyard = targetZoneMapping.endsWith('_GRAVEYARD');
            const sourceCards = isGraveyard ? targetPlayer.graveyard : targetPlayer.hand;
            
            if (targetZoneMapping === 'TARGET_1_HAND') {
                targetPlayer.hand.forEach((c: any) => c.isRevealed = true);
                log(`[REVEAL] Hand of ${targetPlayer.name} revealed.`);
            }

            state.pendingAction = ChoiceGenerator.createCardChoice(state, sourceCards, {
                label: effect.label || (targetZoneMapping === 'TARGET_1_GRAVEYARD' ? 'Scegli una Carta dal Cimitero' : 'Scegli una Carta dalla Mano'),
                playerId: controllerId,
                sourceId: sourceId,
                restrictions: effect.restrictions,
                optional: effect.optional !== false,
                hideUndo: effect.hideUndo !== undefined ? effect.hideUndo : true,
                actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
                onSelected: (c) => effect.effects,
                onNone: () => [],
                stackObj: stackObject,
                parentContext: parentContext
            });
            const parts = targetZoneMapping.split('_');
            const zoneName = parts[parts.length - 1].toLowerCase();
            log(`[CHOICE] ${state.players[controllerId]?.name} must choose a card from ${targetPlayer.name}'s ${zoneName}.`);
            return;
        }
    }

    // --- GENERIC MODAL CHOICES ---
    state.pendingAction = ChoiceGenerator.createModalChoice(
        { 
            label: effect.label || 'Scegli un\'Opzione', 
            playerId: controllerId, 
            sourceId: sourceId, 
            hideUndo: effect.hideUndo !== undefined ? effect.hideUndo : true,
            actionType: effect.optional ? ActionType.OptionalAction : ActionType.ResolutionChoice,
            stackObj: stackObject,
            parentContext: parentContext
        },
        dynamicChoices || []
    );

    log(`[CHOICE] ${state.players[controllerId]?.name} must choose: ${effect.label || 'an option'}`);
  }

  public static handleDrawCards(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
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

  public static handleDiscardCards(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(id => {
        // 1. Check if the target is a Player (Standard Discard)
        const player = state.players[id];
        if (player) {
            if (amount === -1) {
                const handCount = player.hand.length;
                const handCopy = [...player.hand];
                while (player.hand.length > 0) {
                    const card = player.hand[0];
                    ActionProcessor.moveCard(state, card, Zone.Graveyard, id, log);
                    TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId: id, data: { card, sourceId } }, log);
                }
                log(`${player.name} discarded their hand (${handCount} cards).`);
            } else if (amount > 0) {
                state.pendingAction = { type: 'DISCARD', playerId: id, sourceId, data: { amount } };
                player.pendingDiscardCount = amount;
                log(`${player.name} must discard ${amount} card(s).`);
            }
            return;
        }

        // 2. Check if the target is a specific Card (e.g. Duress, SELECTED_CARD)
        // Rule 701.8a: "To discard a card" can mean choosing one or moving a specific one to the graveyard.
        const obj = this.findObject(state, id);
        if (obj) {
            const owner = state.players[obj.ownerId];
            if (owner && owner.hand.some(c => c.id === obj.id)) {
                ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
                TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId: obj.ownerId, data: { card: obj, sourceId } }, log);
                log(`${owner.name} discarded ${obj.definition.name}.`);
            }
        }
    });
  }

  private static handleDealDamage(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(tid => DamageProcessor.dealDamage(state, sourceId, tid, amount, false, log));
  }

  private static handleCopySpellOnStack(state: GameState, targets: string[], controllerId: string, log: (m: string) => void) {
      targets.forEach(tid => {
          const stackObj = state.stack.find(s => s.id === tid || s.sourceId === tid);
          if (!stackObj) return;

          const copy = JSON.parse(JSON.stringify(stackObj)); // Deep copy to avoid reference issues
          copy.id = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          (copy as any).isCopy = true;
          copy.controllerId = controllerId;

          state.stack.push(copy);
          log(`[COPY] Created copy of ${stackObj.card?.definition.name || 'spell'}.`);

          if (copy.data?.targetDefinition) {
              const targetDef = copy.data.targetDefinition;
              const { TargetingProcessor } = require('../actions/TargetingProcessor');
              const legalTargetIds = [
                  ...Object.keys(state.players),
                  ...state.battlefield.filter(o => TargetingProcessor.isLegalTarget(state, copy.id, o.id, targetDef)).map(o => o.id),
                  ...state.stack.filter(s => TargetingProcessor.isLegalTarget(state, copy.id, s.id, targetDef)).map(s => s.id)
              ];

              state.pendingAction = {
                  type: 'TARGETING' as any,
                  playerId: controllerId,
                  sourceId: copy.id,
                  data: {
                      targetDefinition: targetDef,
                      legalTargetIds,
                      optional: true, // Rule 706.10c: "You may choose new targets"
                      originalTargets: [...copy.targets]
                  }
              };
              log(`[COPY] ${state.players[controllerId].name} may choose new targets for the copy.`);
          }
      });
  }


  private static handlePhasedOut(state: GameState, targets: string[], value: boolean, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
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

  private static handleDestroy(state: GameState, targets: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (obj) {
            if (LayerProcessor.hasKeyword(obj, state, 'Indestructible')) {
                log(`${obj.definition.name} is indestructible.`);
                return;
            }
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
        }
    });
  }

  private static handleSacrifice(state: GameState, targets: string[], sourceId: string, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    targets.forEach(tid => {
        // Sacrifice can target a player (who must then choose) or a permanent directly
        const player = state.players[tid];
        if (player) {
            // "Each opponent sacrifices a creature" -> trigger a choice for the player
            // This is a special case: we need the player to pick something they own
            const creatures = state.battlefield.filter(o => o.controllerId === tid && o.definition.types.some(t => t.toLowerCase() === 'creature'));
            
            if (creatures.length === 0) {
                log(`${player.name} has no creatures to sacrifice.`);
                return;
            }

            if (creatures.length === 1) {
                TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId: tid, sourceId: creatures[0].id, data: { object: creatures[0] } }, log);
                ActionProcessor.moveCard(state, creatures[0], Zone.Graveyard, tid, log);
                log(`${player.name} sacrificed ${creatures[0].definition.name}.`);
                return;
            }

            // Multiple options: trigger a choice
            state.pendingAction = ChoiceGenerator.createCardChoice(state, creatures, {
                label: "Scegli una creatura da sacrificare",
                playerId: tid,
                sourceId: sourceId,
                hideUndo: true,
                optional: false,
                actionType: ActionType.ResolutionChoice,
                onSelected: (c) => [{ type: 'Sacrifice', targetId: c.id }],
                stackObj: stackObject,
                parentContext: parentContext
            });
            log(`${player.name} must choose a creature to sacrifice.`);
        } else {
            // Direct sacrifice of a specific object (rare for effects, common for costs)
            const obj = state.battlefield.find(o => o.id === tid);
            if (obj) {
                TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId: obj.controllerId, sourceId: obj.id, data: { object: obj } }, log);
                ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.controllerId, log);
                log(`${state.players[obj.controllerId]?.name} sacrificed ${obj.definition.name}.`);
            }
        }
    });
  }

  private static handleFight(state: GameState, targets: string[], log: (m: string) => void) {
      if (targets.length < 2) return;
      const c1 = this.findObject(state, targets[0]);
      const c2 = this.findObject(state, targets[1]);

      if (!c1 || !c2) {
          log(`[FIGHT] One or more combatants are missing from the battlefield. Fight canceled.`);
          return;
      }

      // Rule 701.12: Each deals damage to the other EQUAL TO ITS POWER
      const p1 = LayerProcessor.getEffectiveStats(c1, state).power;
      const p2 = LayerProcessor.getEffectiveStats(c2, state).power;

      log(`[FIGHT] ${c1.definition.name} (${p1}) fights ${c2.definition.name} (${p2}).`);

      this.handleDealDamage(state, [c2.id], p1, c1.id, log);
      this.handleDealDamage(state, [c1.id], p2, c2.id, log);
  }

  public static handleGainLife(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        if (state.players[pid]) {
            const oldLife = state.players[pid].life;
            state.players[pid].life += amount;
            state.turnState.lastLifeGainedAmount = amount;
            log(`${state.players[pid].name} gains ${amount} life (${oldLife} -> ${state.players[pid].life})`);

            // CR 603: Emit trigger event for life gain
            TriggerProcessor.onEvent(state, {
                type: 'ON_LIFE_GAIN',
                playerId: pid,
                amount,
                data: { amount }
            }, (m: string) => log(m));
        }
    });
  }

  private static handleLoseLife(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        if (state.players[pid]) {
            // Rule 119.3: Loss of life occurs when an effect explicitly says so.
            state.players[pid].life -= amount;
            // Rule 119.3: Loss of life occurs when an effect explicitly says so.
            TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId: pid, amount }, log);
            log(`${state.players[pid].name} loses ${amount} life.`);
        }
    });
  }

  private static handleAddCounters(state: GameState, targets: string[], amount: number, type: string, log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid);
        if (obj) {
            obj.counters[type] = (obj.counters[type] || 0) + amount;
            log(`Added ${amount} ${type} counter(s) to ${obj.definition.name}.`);
            TriggerProcessor.onEvent(state, {
                type: 'ON_COUNTERS_ADDED',
                targetId: obj.id,
                amount,
                counterType: type,
                data: { object: obj }
            }, log);
        }
    });
  }

  private static handleCreateToken(state: GameState, targets: string[], amount: number, blueprint: any, log: (m: string) => void, pOverride?: number, tOverride?: number, effect?: any) {
    targets.forEach(pid => {
        if (!blueprint) return;
        for (let i = 0; i < amount; i++) {
            const token = this.createToken(state, blueprint, pid, pOverride, tOverride);
            if (effect?.isAttacking && state.combat) {
                const opponentId = Object.keys(state.players).find(id => id !== pid);
                state.combat.attackers.push({ attackerId: token.id, targetId: (effect.attackTargetId || opponentId!) });
                token.isTapped = true;
                log(`[COMBAT] ${token.definition.name} enters the battlefield attacking!`);
            }
        }
        const pt = pOverride !== undefined ? ` [${pOverride}/${tOverride}]` : "";
        log(`Created ${amount} ${blueprint.name}${pt} token(s) for ${state.players[pid]?.name}.`);
    });
  }


  /**
   * CR 114: Create an Emblem and place it in the Command Zone.
   * Emblems are permanent objects that cannot be removed and have triggered abilities.
   */
  private static handleCreateEmblem(
    state: GameState,
    effect: any,
    controllerId: PlayerId,
    sourceId: GameObjectId,
    log: (m: string) => void
  ) {
    const blueprint = effect.emblemBlueprint;
    if (!blueprint) {
      log(`[ERROR] CreateEmblem: No emblemBlueprint provided.`);
      return;
    }

    const emblemId = `emblem_${controllerId}_${blueprint.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    const sourceObj = this.findObject(state, sourceId);

    // Rule 114.1: Create the emblem in the Command Zone
    const emblem: EmblemDefinition = {
      id: emblemId,
      name: blueprint.name || 'Emblem',
      controllerId,
      oracleText: blueprint.oracleText || '',
      image_url: sourceObj?.definition.image_url, // Show the PW art
      abilities: blueprint.abilities || []
    };

    // Initialize emblems array if it doesn't exist (backward compat)
    if (!state.emblems) state.emblems = [];
    state.emblems.push(emblem);
    log(`[EMBLEM] ${state.players[controllerId]?.name} gets ${emblem.name} (Command Zone).`);

    // Register each emblem ability into the Rule Registry
    // They use a special sourceId prefix so TriggerProcessor can find them via state.emblems
    blueprint.abilities?.forEach((ability: any, idx: number) => {
      const registeredAbility = {
        ...ability,
        id: `${emblemId}_ability_${idx}`,
        sourceId: emblemId,          // Emblem ID as source
        controllerId,
        activeZone: 'Command',       // Emblems function from the Command Zone
      };

      state.ruleRegistry.triggeredAbilities.push(registeredAbility);
      log(`[EMBLEM] Registered ability: "${ability.triggerEvent || 'static'}" for ${emblem.name}.`);
    });
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
    log: (m: string) => void,
    stackObject?: any,
    parentContext?: any
  ) {
    // PRIORITY for controllerId:
    // 1. The stackObject itself (most reliable — the actual spell being resolved)
    // 2. The game object found by findObject (may be missing if spell just left the stack)
    // 3. state.activePlayerId (LAST resort — this is wrong on the opponent's turn!)
    const sourceObj = this.findObject(state, sourceId);
    const controllerId = stackObject?.controllerId || sourceObj?.controllerId || state.activePlayerId;
    log(`[CE] Resolving continuous effect. ControllerId=${controllerId} (from: ${stackObject ? 'stackObject' : sourceObj ? 'findObject' : 'activePlayer fallback'})`);
    const durationStr = (effect as any).duration || DurationType.UntilEndOfTurn;
    const durationType = (durationStr === DurationType.UntilEndOfTurn)
        ? DurationType.UntilEndOfTurn
        : DurationType.Static;

    // RULE 611.2a: Continuous effects from spells/abilities SNAP targets at resolution.
    // Static abilities from permanents (like Glorious Anthem) stay dynamic via targetMapping.
    let finalTargetIds = resolvedTargetIds.length > 0 ? [...resolvedTargetIds] : undefined;
    
    // If it's a floating effect (from a spell) and has a dynamic mapping, we convert it to a snapshot of IDs
    const mapping = (effect as any).targetMapping;
    if (!finalTargetIds && mapping) {
        const { TargetingProcessor } = require('../actions/TargetingProcessor');
        if (mapping === 'ALL_PERMANENTS_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => o.controllerId === controllerId).map(o => o.id);
        } else if (mapping === 'ALL_CREATURES_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature')).map(o => o.id);
        } else if (mapping === 'MATCHING_PERMANENTS_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => o.controllerId === controllerId && TargetingProcessor.matchesRestrictions(state, o, effect.restrictions || [], controllerId, sourceId)).map(o => o.id);
        } else if (mapping === 'MATCHING_PERMANENTS') {
            finalTargetIds = state.battlefield.filter(o => TargetingProcessor.matchesRestrictions(state, o, effect.restrictions || [], controllerId, sourceId)).map(o => o.id);
        }
    }

    const effId = `floating_${sourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const continuousEff: any = {
        id: effId,
        sourceId: 'floating', // Floating: not tied to a permanent's presence on battlefield
        controllerId,
        layer: (effect as any).layer || 7,
        timestamp: Date.now(),
        activeZones: ['Battlefield'],
        duration: { type: durationType },
        targetMapping: finalTargetIds ? undefined : mapping, // If we have IDs, we don't need mapping
        targetIds: finalTargetIds || (effect as any).exiledIds || (parentContext as any)?.exiledIds,
        abilitiesToAdd: (effect as any).abilitiesToAdd,
        abilitiesToRemove: (effect as any).abilitiesToRemove,
        powerModifier: (effect as any).powerModifier !== undefined ? this.resolveAmount(state, (effect as any).powerModifier, sourceId, controllerId, stackObject) : undefined,
        toughnessModifier: (effect as any).toughnessModifier !== undefined ? this.resolveAmount(state, (effect as any).toughnessModifier, sourceId, controllerId, stackObject) : undefined,
        powerSet: (effect as any).powerSet !== undefined ? this.resolveAmount(state, (effect as any).powerSet, sourceId, controllerId, stackObject) : undefined,
        toughnessSet: (effect as any).toughnessSet !== undefined ? this.resolveAmount(state, (effect as any).toughnessSet, sourceId, controllerId, stackObject) : undefined,
        canPlayExiled: (effect as any).value === 'MAY_PLAY_EXILED',
        isFreeCast: (effect as any).value === 'MAY_CAST_WITHOUT_PAYING'
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
    controllerId: PlayerId,
    stackObject?: any
  ): number {
    if (amount === undefined) return 0;
    if (typeof amount === 'number') {
      return amount === -1 ? state.turnState.lastDamageAmount || 0 : amount;
    }

    switch (amount) {
      case 'POWER': {
        const obj = this.findObject(state, sourceId, stackObject);
        return obj?.effectiveStats?.power || parseInt(obj?.definition.power || '0') || 0;
      }
      case 'TOUGHNESS': {
        const obj = this.findObject(state, sourceId, stackObject);
        return obj?.effectiveStats?.toughness || parseInt(obj?.definition.toughness || '0') || 0;
      }
      case 'TARGET_1_CMC': {
        const tid = (stackObject as any)?.targets?.[0];
        if (!tid) return 0;
        const obj = this.findObject(state, tid as string, stackObject);
        return obj ? ManaProcessor.getManaValue(obj.definition.manaCost || '') : 0;
      }
      case 'TARGET_1_HALF_LIFE_UP':
      case 'HALF_LIFE_ROUND_UP': {
          const tid = (stackObject as any)?.targets?.[0];
          const player = state.players[tid as string];
          return player ? Math.ceil(player.life / 2) : 0;
      }
      case 'TARGET_1_HALF_LIBRARY_UP':
      case 'HALF_LIBRARY_ROUND_UP': {
          const tid = (stackObject as any)?.targets?.[0];
          const player = state.players[tid as string];
          return player ? Math.ceil(player.library.length / 2) : 0;
      }
      case 'COUNT_hand':
      case 'CARDS_IN_HAND_COUNT':
          return state.players[controllerId]?.hand.length || 0;
      case 'COUNT_drawn':
          return state.turnState.cardsDrawnThisTurn[controllerId] || 0;
      case (typeof amount === 'string' && (amount as string).startsWith('COUNT_')) ? amount : '___NON_MATCHING___': {
          const parts = (amount as string).split('_').map(p => p.toLowerCase());
          let objects = state.battlefield.filter(o => o.controllerId === controllerId);

          if (parts.includes('other')) {
              objects = objects.filter(o => o.id !== sourceId);
          }

          if (parts.includes('attacking')) {
              objects = objects.filter(o => state.combat?.attackers.some(a => a.attackerId === o.id));
          }

          const filter = parts[parts.length - 1];
          if (parts.includes('is')) {
              if (filter.startsWith('power') && filter.endsWith('plus')) {
                  const threshold = parseInt(filter.replace('power', '').replace('plus', ''));
                  objects = objects.filter(o => (o.effectiveStats?.power ?? parseInt(o.definition.power || '0')) >= threshold);
              } else {
                  // Keyword check
                  objects = objects.filter(o => {
                      const keywords = (o.effectiveStats?.keywords || []).concat(o.definition.keywords || []).map(k => k.toLowerCase());
                      return keywords.includes(filter);
                  });
              }
          } else if (filter !== 'other' && filter !== 'attacking') {
              // Type/Subtype check
              objects = objects.filter(o => 
                (o.definition.types.some(t => t.toLowerCase() === filter) || 
                 o.definition.subtypes.some(t => t.toLowerCase() === filter))
              );
          }
          return objects.length;
      }
      case 'OTHER_FLYING_CREATURES_YOU_CONTROL':
        return 2 * this.resolveAmount(state, 'COUNT_is_flying', sourceId, controllerId, stackObject);
      case 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT': {
        const player = state.players[controllerId];
        return player ? player.graveyard.filter(o => o.definition.types.includes('Instant') || o.definition.types.includes('Sorcery')).length : 0;
      }
      case 'DAMAGE_DEALT_AMOUNT':
      case 'EVENT_AMOUNT':
          return (stackObject?.data?.eventAmount) !== undefined ? stackObject.data.eventAmount : (state.turnState.lastDamageAmount || 0);
      case 'LIFE_GAINED_AMOUNT':
          return (stackObject?.data?.eventAmount) !== undefined ? stackObject.data.eventAmount : (state.turnState.lastLifeGainedAmount || 0);
      case 'EVENT_OBJECT_POWER': {
          const eventObj = stackObject?.data?.eventData?.object;
          if (eventObj) {
              const objOnField = state.battlefield.find(o => o.id === eventObj.id);
              if (objOnField) return (objOnField.effectiveStats?.power !== undefined) ? objOnField.effectiveStats.power : parseInt(objOnField.definition.power || '0') || 0;
              return parseInt(eventObj.definition?.power || '0') || 0;
          }
          return 0;
      }
      case 'X': {
        return stackObject?.xValue || 0;
      }
      default:
        return 0;
    }
  }


  private static getLegalTargetIdsForEffect(state: GameState, sourceId: string, targetDef: any, stackObject?: any): string[] {
      const { TargetingProcessor } = require('../actions/TargetingProcessor');
      const pool = [
          ...Object.keys(state.players),
          ...state.battlefield.map(o => o.id),
          ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
      ];
      return pool.filter(tid => TargetingProcessor.isLegalTarget(state, stackObject || sourceId, tid, targetDef));
  }

  private static findObject(state: GameState, id: string, stackObject?: any, parentContext?: any): GameObject | undefined {
    // 1. Battlefield
    const foundOnField = state.battlefield.find(o => o.id === id);
    if (foundOnField) return foundOnField;

    // 2. The physical card for the spell CURRENTLY resolving (even if it was popped from stack)
    if (stackObject) {
       const card = stackObject.card || stackObject;
       if (card && card.id === id) return card;
    }

    // 3. Stack
    const foundOnStack = state.stack.find(s => s.id === id || s.sourceId === id)?.card;
    if (foundOnStack) return foundOnStack;

    // 4. Graveyard
    const foundInGY = Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === id);
    if (foundInGY) return foundInGY;

    // 5. Exile
    const foundInExile = state.exile.find(o => o.id === id);
    if (foundInExile) return foundInExile;

    // 6. Hands (e.g. Duress selection)
    for (const playerId in state.players) {
        const foundInHand = state.players[playerId as PlayerId].hand.find(o => o.id === id);
        if (foundInHand) return foundInHand;
    }

    // 6. Temporary "Looking" Zone (for LookAtTop effects mid-choice)
    if (state.pendingAction?.data?.lookingCards) {
        const foundInLooking = (state.pendingAction.data.lookingCards as GameObject[]).find(o => o.id === id);
        if (foundInLooking) return foundInLooking;
    }
    
    // 7. Check parent context (in case pendingAction was cleared but resolveEffects is still running)
    if (parentContext?.lookingCards) {
        const foundInLooking = (parentContext.lookingCards as GameObject[]).find(o => o.id === id);
        if (foundInLooking) return foundInLooking;
    }

    return undefined;
  }

  private static createToken(state: GameState, blueprint: any, controllerId: PlayerId, pOverride?: number, tOverride?: number): GameObject {
    const token: GameObject = {
      id: `token_${Math.random().toString(36).substr(2, 9)}`,
      ownerId: controllerId,
      controllerId: controllerId,
      definition: {
        name: blueprint.name,
        manaCost: "", // Tokens have no mana cost (CR 111.12)
        // Map colors strictly from the blueprint (e.g., ["Blue", "Red"] -> ["blue", "red"])
        colors: (blueprint.colors || []).map((c: string) => {
            const map: Record<string, string> = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
            const result = map[c.toUpperCase()] || c.toLowerCase();
            return ['white', 'blue', 'black', 'red', 'green'].includes(result) ? result : null;
        }).filter(Boolean) as any[],
        supertypes: blueprint.supertypes || [],
        types: [...(blueprint.types || []), "Token"],
        subtypes: blueprint.subtypes || [],
        power: pOverride !== undefined ? pOverride.toString() : (blueprint.power || "0"),
        toughness: tOverride !== undefined ? tOverride.toString() : (blueprint.toughness || "0"),
        keywords: blueprint.keywords || [],
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
    
    // Ensure the token's abilities (like Flying) are registered and it triggers ETB
    // We import here to avoid circular dependencies if any
    const { ActionProcessor } = require('../actions/ActionProcessor');
    const { TriggerProcessor } = require('./TriggerProcessor');
    
    ActionProcessor.registerAbilities(state, token);
    TriggerProcessor.onEvent(state, { 
        type: 'ON_ETB', 
        targetId: token.id, 
        sourceId: token.id, 
        data: { object: token } 
    }, (m: string) => {});

    return token;
  }

  private static checkCondition(state: GameState, condition: string, stackObject?: any, parentContext?: any): boolean {
      const card = stackObject?.card || stackObject;

      switch (condition) {
          case 'castFromHand':
          case 'CAST_FROM_HAND':
              return card?.lastNonStackZone === Zone.Hand;
          case 'notCastFromHand':
          case 'NOT_CAST_FROM_HAND':
              return card?.lastNonStackZone !== Zone.Hand;
          case 'targetWasCreature': {
              const firstTargetId = stackObject?.targets?.[0];
              if (!firstTargetId) return false;
              const targetObj = this.findObject(state, firstTargetId, stackObject, parentContext);
              return !!targetObj?.definition.types.some(t => t.toLowerCase() === 'creature');
          }
          default:
              return true;
      }
  }
}
