import { GameState, PlayerId, Zone, Phase, GameObject } from '@shared/engine_types';
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
    const choiceEffectIndex = spellEffects.findIndex((e: any) => e.type === 'Choice');
    const hasPreSelectedChoice = (state as any).lastChoiceIndex !== undefined;
    const cost = this.getEffectiveManaCost(state, cardToPlay);

    // --- SETUP SEQUENCE: TARGETING -> CHOICE -> FINALIZATION ---
    
    // Step 1: Check Targeting
    if (targetDefinition && (!declaredTargets || declaredTargets.length === 0) && !bypassTargeting) {
        if (!ManaProcessor.canPayWithTotal(player, state.battlefield, cost)) {
            log(`Illegal Play: Not enough mana available to even start casting ${cardToPlay.definition.name}.`);
            return false;
        }

        const precalculatedTargets = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id)
        ].filter(tid => ValidationProcessor.isLegalTarget(state, cardToPlay.id, tid, targetDefinition));

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

    if (!ManaProcessor.canPayManaCost(player, cost)) {
        if (ManaProcessor.canPayWithTotal(player, state.battlefield, cost)) {
            log(`Auto-tapping lands to pay ${cost}...`);
            ManaProcessor.autoTapLandsForCost(state, playerId, cost, log, engine.tapForMana);
        } else {
            log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Effective Cost: ${cost})`);
            return false;
        }
    }

    log(`Paying ${cost} for ${cardToPlay.definition.name}...`);
    ManaProcessor.deductManaCost(player, cost);

    player.hand = player.hand.filter((c: any) => c.id !== cardInstanceId);
    cardToPlay.zone = Zone.Stack;
    (cardToPlay as any).paidCost = cost;

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
    
    log(`--------------------------------------------------`);
    log(`[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}${declaredTargets?.length ? ' targeting ' + declaredTargets.join(', ') : ''}`);
    log(`--------------------------------------------------`);

    engine.checkAutoPass(playerId);
    return true;
  }

  public static getEffectiveManaCost(state: GameState, card: GameObject): string {
    const baseCost = card.definition.manaCost;
    const parsed = ManaProcessor.parseManaCost(baseCost);
    let extraGeneric = 0;

    const modifiers = state.ruleRegistry.continuousEffects.filter(e => {
        if ((e as any).type !== 'SpellTax' && (e as any).type !== 'CostReduction' && (e as any).type !== 'AdditionalCost') return false;
        const source = state.battlefield.find(o => o.id === e.sourceId) || state.exile.find(o => o.id === e.sourceId);
        if (source && e.activeZones && !e.activeZones.includes(source.zone)) return false;
        return true;
    });

    for (const mod of modifiers) {
        const type = (mod as any).type;
        const impacts = (mod.targetMapping === 'EACH_PLAYER') ||
                        (mod.targetMapping === 'EACH_OPPONENT' && mod.controllerId !== card.controllerId) ||
                        (mod.targetMapping === 'SELF' && mod.sourceId === card.id) ||
                        (mod.targetMapping === 'CONTROLLER' && mod.controllerId === card.controllerId);
        
        if (!impacts) continue;

        const restrictions = (mod as any).restrictions || [];
        const cardTypes = card.definition.types.map((t: string) => t.toLowerCase());
        const cardSubtypes = (card.definition.subtypes || []).map((t: string) => t.toLowerCase());
        
        const matches = restrictions.every((r: string) => {
            const lowR = r.toLowerCase();
            if (lowR === 'noncreature') return !cardTypes.includes('creature');
            if (lowR === 'creature') return cardTypes.includes('creature');
            return cardTypes.includes(lowR) || cardSubtypes.includes(lowR);
        });

        if (!matches) continue;

        let amount = (mod as any).amount || 0;
        const valSymbol = (mod as any).value;
        if (typeof valSymbol === 'string' && valSymbol === 'NONCOMBAT_DAMAGE_DEALT_THIS_TURN') {
            amount = state.turnState.noncombatDamageDealtToOpponents || 0;
        }

        if (type === 'SpellTax') extraGeneric += amount;
        if (type === 'CostReduction') extraGeneric -= amount;
    }

    const finalGeneric = Math.max(0, parsed.generic + extraGeneric);
    let costStr = '';
    Object.entries(parsed.colored).forEach(([symbol, count]) => {
        for (let i = 0; i < count; i++) costStr += `{${symbol}}`;
    });

    if (finalGeneric > 0 || (costStr === '' && finalGeneric === 0)) {
        costStr = `{${finalGeneric}}` + costStr;
    }

    return costStr;
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

    const ability = cardLogic.abilities[abilityIndex];
    if (ability.type !== 'Activated') return false;

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
      type: 'ActivatedAbility' as const,
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
