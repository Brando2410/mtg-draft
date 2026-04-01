import { GameState, PlayerId, Zone, Phase, GameObject, AbilityType, AbilityCost } from '@shared/engine_types';
import { M21_LOGIC } from '../../data/m21_logic';
import { ManaProcessor } from '../magic/ManaProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { ValidationProcessor } from '../state/ValidationProcessor';
import { TriggerProcessor } from '../effects/TriggerProcessor';

/**
 * Casting Spells and Activating Abilities (Chapters 601 & 602)
 */
export class SpellProcessor {

  public static playCard(
    state: GameState, 
    playerId: PlayerId, 
    cardInstanceId: string, 
    declaredTargets: string[],
    log: (m: string) => void,
    engine: {
        tapForMana: (p: PlayerId, c: string) => void;
        passPriority: (p: PlayerId) => void;
        checkAutoPass: (p: PlayerId) => void;
        checkStateBasedActions: () => void;
    },
    bypassTargeting = false
  ): boolean {
    const activeId = String(state.activePlayerId).trim();
    const callerId = String(playerId).trim();
    
    // 1. Priority Error (Rule 117.1)
    if (!bypassTargeting && String(state.priorityPlayerId) !== String(playerId)) {
      log(`Tried to play card without priority.`);
      return false;
    }
    
    if (state.pendingAction && !bypassTargeting) {
       log(`Cannot cast: Pending action ${state.pendingAction.type} must be resolved first.`);
       return false;
    }

    const player = state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      log(`Player must finish discarding before playing cards.`);
      return false;
    }

    let cardToPlay: any;
    const cardInHand = player.hand.find((c: any) => c.id === cardInstanceId);
    if (cardInHand) {
        cardToPlay = cardInHand;
    } else if (bypassTargeting) {
        cardToPlay = player.hand.find((c: any) => c.id === cardInstanceId);
    }

    if (!cardToPlay) {
      log(`Card not found in hand.`);
      return false;
    }

    const typeLine = (cardToPlay.definition.type_line || '').toLowerCase();
    const isLand = typeLine.includes('land');
    const isInstantOrFlash = typeLine.includes('instant') || (cardToPlay.definition.oracleText || '').includes('Flash'); 
    
    // 2. Timing/Speed (Rule 305/307)
    if (!isInstantOrFlash) {
      if (activeId !== callerId || (state.currentPhase !== Phase.PreCombatMain && state.currentPhase !== Phase.PostCombatMain) || state.stack.length > 0) {
         log(`Illegal Play: Cannot cast sorcery speed spell/land right now.`);
         return false;
      }
    }

    // 3. Land Handling (Rule 305)
    if (isLand) {
      if (player.hasPlayedLandThisTurn) {
         log(`Illegal Play: Already played a land this turn.`);
         return false;
      }
      player.hand = player.hand.filter((c: any) => c.id !== cardInstanceId);
      cardToPlay.zone = Zone.Battlefield;
      state.battlefield = [...state.battlefield, cardToPlay];
      player.hasPlayedLandThisTurn = true;
      log(`Played Land: ${cardToPlay.definition.name}`);
      engine.checkStateBasedActions();
      return true;
    }

    // 4. Extract logic and effects
    const logic = M21_LOGIC[cardToPlay.definition.name];
    const targetDefinition = (logic as any)?.targetDefinition || (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.targetDefinition;
    const spellEffects = (logic as any)?.effects || (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.effects || [];
    const choiceEffectIndex = spellEffects.findIndex((e: any) => e.type === 'Choice' && e.choices && !e.targetMapping);
    const hasPreSelectedChoice = (state as any).lastChoiceIndex !== undefined;
    
    // CR 601.2f: Determine total cost
    const { totalMana, additionalCosts } = this.getEffectiveCosts(state, cardToPlay);

    // --- SETUP SEQUENCE: TARGETING -> CHOICE -> FINALIZATION ---
    
    // Step 1: Check Targeting
    if (targetDefinition && (!declaredTargets || declaredTargets.length === 0) && !bypassTargeting) {
        if (!ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana)) {
            log(`Illegal Play: Not enough mana available to even start casting ${cardToPlay.definition.name}.`);
            return false;
        }

        const precalculatedTargets = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...state.exile.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
        ].filter(tid => ValidationProcessor.isLegalTarget(state, cardToPlay.id, tid, targetDefinition));

        if (precalculatedTargets.length === 1 && !targetDefinition.optional) {
            declaredTargets = precalculatedTargets;
            log(`[AUTO-TARGET] Only one legal target found for ${cardToPlay.definition.name}: ${state.players[precalculatedTargets[0]]?.name || precalculatedTargets[0]}`);
        } else {
            if (precalculatedTargets.length === 0) {
                if (targetDefinition.optional) {
                    log(`No legal targets found, auto-skipping optional target selection.`);
                    return this.playCard(state, playerId, cardInstanceId, [], log, engine, true);
                } else {
                    log(`Illegal Play: No valid targets available for ${cardToPlay.definition.name}.`);
                    return false;
                }
            }

            state.pendingAction = {
                type: 'TARGETING',
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: { targetDefinition, legalTargetIds: precalculatedTargets, isSpellCasting: true }
            };
            log(`[TARGETING] ${state.players[playerId].name} is selecting targets for ${cardToPlay.definition.name}...`);
            return true;
        }
    }

    // Step 1.5: Check Additional Costs (e.g. Goremand's sacrifice)
    const costRequiresTarget = additionalCosts.find(c => c.type === 'Sacrifice' && !c.targetMapping);
    const hasChosenSacrifice = (state as any).lastChosenSacrificeId !== undefined;
    
    if (costRequiresTarget && !hasChosenSacrifice && !bypassTargeting) {
        const legalSacrificeIds = state.battlefield
            .filter(o => o.controllerId === playerId && ValidationProcessor.matchesRestrictions(state, o, costRequiresTarget.restrictions || [], playerId, cardToPlay.id))
            .map(o => o.id);

        if (legalSacrificeIds.length === 0) {
            log(`Illegal Play: No valid objects to pay the additional cost for ${cardToPlay.definition.name}.`);
            return false;
        }

        // Trigger a choice phase specifically for the cost
        state.pendingAction = {
            type: 'CHOICE',
            playerId: playerId,
            sourceId: cardToPlay.id,
            data: { 
                label: "Sacrifice a creature to cast " + cardToPlay.definition.name,
                hideUndo: true,
                isCostChoice: true,
                costType: 'Sacrifice',
                declaredTargets: declaredTargets || [],
                choices: legalSacrificeIds.map(id => {
                    const obj = state.battlefield.find(o => o.id === id);
                    return {
                        label: `Sacrifice ${obj?.definition.name || id}`,
                        value: id,
                        cardData: obj,
                        selectable: true
                    }
                })
            }
        };
        log(`[SACRIFICE] ${state.players[playerId].name} must choose an object to sacrifice to cast ${cardToPlay.definition.name}.`);
        return true;
    }

    // Step 2: Check Modal Choice
    if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
        // Trigger choice phase (targets are already in declaredTargets if we are here)
        const choiceEffect = spellEffects[choiceEffectIndex];
        state.pendingAction = {
            type: 'CHOICE',
            playerId: playerId,
            sourceId: cardToPlay.id,
            data: {
                label: choiceEffect.label || 'Choose an option',
                choices: choiceEffect.choices,
                isSpellCasting: true,
                declaredTargets: declaredTargets || []
            }
        };
        log(`[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
        return true;
    }

    // Step 3: Finalization
    const preSelectedChoice = (state as any).lastChoiceIndex;
    delete (state as any).lastChoiceIndex; 

    if (!ManaProcessor.canPayManaCost(player, totalMana)) {
        if (ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana)) {
            log(`Auto-tapping lands to pay ${totalMana}...`);
            ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, log, engine.tapForMana);
        } else {
            log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Effective Cost: ${totalMana})`);
            return false;
        }
    }

    if (cardToPlay.definition.name === "Teferi, Master of Time") {
        log(`[DEBUG] Playing Teferi, Master of Time: ${JSON.stringify(cardToPlay.definition, null, 2)}`);
    }
    log(`Paying ${totalMana} for ${cardToPlay.definition.name}...`);
    ManaProcessor.deductManaCost(player, totalMana);

    // Pay additional costs (CR 601.2h)
    additionalCosts.forEach(cost => {
        if (cost.type === 'Sacrifice') {
            const chosenId = (state as any).lastChosenSacrificeId;
            const obj = state.battlefield.find(o => o.id === (chosenId || cardToPlay.id));
            if (obj) {
                const { ActionProcessor } = require('../actions/ActionProcessor');
                const { TriggerProcessor } = require('../effects/TriggerProcessor');
                TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId, sourceId: obj.id, data: { object: obj } }, log);
                ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId, log);
                log(`Paid additional cost: Sacrificed ${obj.definition.name}.`);
            }
        }
    });

    // Cleanup temporary selection
    delete (state as any).lastChosenSacrificeId; 


    player.hand = player.hand.filter((c: any) => c.id !== cardInstanceId);
    cardToPlay.zone = Zone.Stack;
    (cardToPlay as any).paidCost = totalMana;

    state.turnState.spellsCastThisTurn[playerId] = (state.turnState.spellsCastThisTurn[playerId] || 0) + 1;
    if (state.turnState.spellsCastThisTurn[playerId] === 2) {
        TriggerProcessor.onEvent(state, { type: 'ON_SECOND_SPELL_CAST', playerId: playerId }, log);
    }

    const stackObj = {
        id: `spell_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        controllerId: playerId,
        sourceId: cardToPlay.id,
        type: 'Spell' as const,
        targets: declaredTargets || [],
        card: cardToPlay,
        data: {
            effects: spellEffects,
            targetDefinition: targetDefinition,
            preSelectedChoice
        }
    };

    state.stack.push(stackObj);
    state.consecutivePasses = 0;
    
    // CR 601.2i: Fire cast triggers
    TriggerProcessor.onEvent(state, { 
        type: 'ON_CAST_SPELL', 
        playerId: playerId, 
        card: cardToPlay,
        sourceId: cardToPlay.id
    }, log);

    const isNonCreature = !cardToPlay.definition.types.some((t: string) => t.toLowerCase() === 'creature');
    if (isNonCreature) {
        TriggerProcessor.onEvent(state, { 
            type: 'ON_CAST_NON_CREATURE', 
            playerId: playerId, 
            card: cardToPlay,
            sourceId: cardToPlay.id
        }, log);
    }

    log(`--------------------------------------------------`);
    log(`[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}${declaredTargets?.length ? ' targeting ' + declaredTargets.join(', ') : ''}`);
    log(`--------------------------------------------------`);

    engine.checkAutoPass(playerId);
    return true;
  }


  public static getEffectiveCosts(state: GameState, card: GameObject): { totalMana: string, additionalCosts: AbilityCost[] } {
    const baseCost = card.definition.manaCost;
    const parsed = ManaProcessor.parseManaCost(baseCost);
    let extraGeneric = 0;
    let additionalCosts: AbilityCost[] = [];

    // 1. Gather global modifiers
    const modifiers = state.ruleRegistry.continuousEffects.filter(e => {
        if ((e as any).type !== 'SpellTax' && (e as any).type !== 'CostReduction' && (e as any).type !== 'AdditionalCost') return false;
        const source = state.battlefield.find(o => o.id === e.sourceId) || state.exile.find(o => o.id === e.sourceId);
        if (source && e.activeZones && !e.activeZones.includes(source.zone)) return false;
        return true;
    });

    // 2. Add the card's OWN static additional costs (e.g. Goremand) OR inherent spell costs (e.g. Village Rites)
    const cardLogic = M21_LOGIC[card.definition.name];
    if (cardLogic && cardLogic.abilities) {
        cardLogic.abilities.forEach((a: any) => {
            // Case A: Static abilities that apply costs to the card itself (creatures)
            if (a.type === AbilityType.Static && a.activeZone === Zone.Hand) {
                a.effects?.forEach((e: any) => {
                    if (e.type === 'AdditionalCost' && e.targetMapping === 'SELF') {
                        modifiers.push({ ...e, sourceId: card.id, controllerId: card.controllerId } as any);
                    }
                });
            }
            // Case B: Inherent Costs inside the Spell ability itself (Instants/Sorceries)
            if (a.type === AbilityType.Spell && a.costs) {
                additionalCosts = [...additionalCosts, ...a.costs];
            }
        });
    }

    for (const mod of modifiers) {
        const type = (mod as any).type;
        const impacts = (mod.targetMapping === 'EACH_PLAYER') ||
                        (mod.targetMapping === 'EACH_OPPONENT' && mod.controllerId !== card.controllerId) ||
                        (mod.targetMapping === 'SELF' && mod.sourceId === card.id) ||
                        (mod.targetMapping === 'CONTROLLER' && mod.controllerId === card.controllerId);
        
        if (!impacts) continue;

        const restrictions = (mod as any).restrictions || [];
        const matches = ValidationProcessor.matchesRestrictions(state, card, (restrictions as any[] || []), card.controllerId, mod.sourceId);

        if (!matches) continue;

        if (type === 'SpellTax') extraGeneric += (mod as any).amount || 0;
        if (type === 'CostReduction') extraGeneric -= (mod as any).amount || 0;
        if (type === 'AdditionalCost') {
            const extra = (mod as any).costs || [];
            additionalCosts = [...additionalCosts, ...extra];
        }
    }

    const finalGeneric = Math.max(0, parsed.generic + extraGeneric);
    let costStr = '';
    Object.entries(parsed.colored).forEach(([symbol, count]) => {
        for (let i = 0; i < count; i++) costStr += `{${symbol}}`;
    });

    if (finalGeneric > 0 || (costStr === '' && finalGeneric === 0)) {
        costStr = `{${finalGeneric}}` + costStr;
    }

    return { totalMana: costStr, additionalCosts };
  }

  public static activateAbility(
    state: GameState,
    playerId: PlayerId,
    cardId: string,
    abilityIndex: number,
    declaredTargets: string[],
    log: (m: string) => void,
    engine: {
        passPriority: (p: PlayerId) => void;
        checkAutoPass: (p: PlayerId) => void;
    },
    bypassTargeting = false
  ): boolean {
    const obj = state.battlefield.find(o => o.id === cardId);
    if (!obj) return false;

    if (!bypassTargeting && String(state.priorityPlayerId) !== String(playerId)) {
      log(`Tried to activate ability without priority.`);
      return false;
    }

    if (state.pendingAction) {
       log(`Cannot activate ability: Pending action ${state.pendingAction.type} must be resolved first.`);
       return false;
    }

    const cardLogic = M21_LOGIC[obj.definition.name];
    if (!cardLogic || !cardLogic.abilities[abilityIndex]) return false;
    if (obj.definition.name === "Teferi, Master of Time") {
        const ability = cardLogic.abilities[abilityIndex];
        log(`[DEBUG] Activating Teferi ability index ${abilityIndex} (${ability.id}): ${JSON.stringify(obj.definition, null, 2)}`);
    }

    const ability = cardLogic.abilities[abilityIndex];
    if (ability.type !== AbilityType.Activated) return false;

    const isPlaneswalker = obj.definition.types.includes('Planeswalker');
    if (isPlaneswalker) {
      const activeId = String(state.activePlayerId).trim();
      const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
      const stackEmpty = state.stack.length === 0;
      const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));
      const isSorcerySpeed = String(playerId) === activeId && isMainPhase && stackEmpty;

      if (!canActivateAnyTime && !isSorcerySpeed) {
        log(`Illegal Activation: Planeswalker abilities can only be activated at sorcery speed.`);
        return false;
      }

      if (obj.abilitiesUsedThisTurn > 0) {
        log(`Illegal Activation: This permanent's activated abilities have already been used this turn.`);
        return false;
      }
    }

    let precalculatedTargets: string[] | undefined;
    if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && !bypassTargeting) {
        precalculatedTargets = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id)
        ].filter(tid => ValidationProcessor.isLegalTarget(state, obj.id, tid, ability.targetDefinition));

        if (precalculatedTargets.length === 0) {
            log(`Illegal Activation: No valid targets available for ${obj.definition.name}'s ability.`);
            return false;
        }
    }

    if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) {
       log(`Illegal Activation: Cannot pay costs for ${obj.definition.name}'s ability.`);
       return false;
    }
    CostProcessor.pay(state, ability.costs || [], obj.id, playerId, (m) => log(m));

    obj.abilitiesUsedThisTurn++;

    const stackId = `ability_${Date.now()}`;
    const stackObj = {
      id: stackId,
      controllerId: playerId,
      sourceId: obj.id,
      type: AbilityType.Activated,
      name: `${obj.definition.name} Ability`,
      image_url: obj.definition.image_url,
      targets: declaredTargets || [],
      abilityIndex: abilityIndex,
      data: {
        effects: (ability as any).effects || [],
        targetDefinition: ability.targetDefinition
      }
    };

    if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && precalculatedTargets && !bypassTargeting) {
       state.pendingAction = {
          type: 'TARGETING',
          playerId: playerId,
          sourceId: obj.id,
          data: {
              stackId: stackId,
              stackObj: stackObj,
              abilityIndex: abilityIndex,
              targetDefinition: ability.targetDefinition,
              legalTargetIds: precalculatedTargets 
          }
       };
       log(`[TARGETING] Player must choose targets for ${obj.definition.name}'s ability.`);
       return true;
    }

    state.stack.push(stackObj);
    log(`Activated ability of ${obj.definition.name}: ${ability.id}`);
    state.consecutivePasses = 0;
    engine.passPriority(playerId);
    return true;
  }
}
