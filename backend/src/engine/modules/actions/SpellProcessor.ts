import { GameState, PlayerId, Zone, Phase } from '@shared/engine_types';
import { M21_LOGIC } from '../../data/m21_logic';
import { ManaProcessor } from '../magic/ManaProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { ValidationProcessor } from '../state/ValidationProcessor';

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
    
    // Ensure priority is correctly assigned if we are bypassing targeting checks (action finalization)
    if (bypassTargeting) {
        state.priorityPlayerId = playerId;
    }

    if (state.pendingAction) {
       log(`Cannot cast: Pending action ${state.pendingAction.type} must be resolved first.`);
       return false;
    }

    const player = state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      log(`Player must finish discarding before playing cards.`);
      return false;
    }

    let cardToPlay;
    const cardIndex = player.hand.findIndex((c: any) => c.id === cardInstanceId);
    if (cardIndex !== -1) {
        cardToPlay = player.hand[cardIndex];
    } else if (bypassTargeting) {
        cardToPlay = state.stack.find(s => s.sourceId === cardInstanceId)?.card;
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

    const logic = M21_LOGIC[cardToPlay.definition.name];
    const targetDefinition = (logic as any)?.targetDefinition || logic?.abilities?.find(a => a.type === 'Spell')?.targetDefinition;

    // 4. Pre-flight Target Validation (Rule 601.2c)
    let precalculatedTargets: string[] | undefined;
    if (targetDefinition && (!declaredTargets || declaredTargets.length === 0) && !bypassTargeting) {
        precalculatedTargets = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id)
        ].filter(tid => ValidationProcessor.isLegalTarget(state, cardToPlay.id, tid, targetDefinition));
        
        if (precalculatedTargets.length > 0) {
            const targetNames = precalculatedTargets.map(id => {
                const obj = state.battlefield.find(o => o.id === id);
                return obj ? obj.definition.name : (state.players[id]?.name || id);
            }).join(', ');
            log(`[DEBUG] Valid targets for ${cardToPlay.definition.name}: ${targetNames}`);
        }

        if (precalculatedTargets.length === 0) {
            log(`Illegal Play: No valid targets available for ${cardToPlay.definition.name}.`);
            return false;
        }
    }

    // 5. UX IMPROVEMENT: Auto-tap lands if needed
    const cost = cardToPlay.definition.manaCost;
    if (!ManaProcessor.canPayManaCost(player, cost)) {
       if (ManaProcessor.canPayWithTotal(player, state.battlefield, cost)) {
          log(`Auto-tapping lands to pay ${cost}...`);
          ManaProcessor.autoTapLandsForCost(state, playerId, cost, log, engine.tapForMana);
       }
    }

    // 6. Mana Payment (Rule 601.2f)
    const isOnStack = cardToPlay.zone === Zone.Stack;
    if (!isOnStack) {
        if (!ManaProcessor.canPayManaCost(player, cost)) {
          log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Cost: ${cost})`);
          return false;
        }
        log(`Paying ${cost}...`);
        ManaProcessor.deductManaCost(player, cost);
    }

    // 7. Stack Placement (Rule 601.2i)
    if (cardToPlay.zone !== Zone.Stack) {
        player.hand = player.hand.filter((c: any) => c.id !== cardInstanceId);
        cardToPlay.zone = Zone.Stack;
    }
    let stackObj = state.stack.find(s => s.sourceId === cardToPlay.id);
    let stackId: string;
    
    if (!stackObj) {
        stackId = `spell_${Date.now()}`;
        stackObj = {
            id: stackId,
            controllerId: playerId,
            sourceId: cardToPlay.id,
            type: 'Spell' as const,
            targets: declaredTargets || [],
            card: cardToPlay,
            data: {
                effects: (logic as any).abilities?.find((a: any) => a.type === 'Spell')?.effects || [],
                targetDefinition: targetDefinition
            }
        };
        state.stack.push(stackObj);
        state.consecutivePasses = 0;
        if (!targetDefinition || (declaredTargets && declaredTargets.length > 0)) {
           log(`--------------------------------------------------`);
           log(`[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}`);
           if (declaredTargets && declaredTargets.length > 0) {
               log(`[STACK] Target(s): ${declaredTargets.join(', ')}`);
           }
           log(`--------------------------------------------------`);
        }
    } else {
        stackObj.targets = declaredTargets || [];
        stackId = stackObj.id;
    }

    if (targetDefinition && (!declaredTargets || declaredTargets.length === 0) && !bypassTargeting) {
       log(`[DEBUG] Entering targeting mode for ${cardToPlay.definition.name}`);
       state.pendingAction = {
          type: 'TARGETING',
          playerId: playerId,
          sourceId: cardToPlay.id,
          data: {
              stackId: stackId,
              targetDefinition,
              legalTargetIds: precalculatedTargets
          }
       };
       log(`[TARGETING] Player must choose targets for ${cardToPlay.definition.name}.`);
       return true;
    }

    log(`[DEBUG] Finalizing cast: ${cardToPlay.definition.name} moving to final resolve step.`);
    log(`Cast: ${cardToPlay.definition.name}`);
    state.consecutivePasses = 0;
    engine.checkAutoPass(playerId);
    log(`[DEBUG] playCard finished successfully.`);
    return true;
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
    
    // Ensure priority is correctly assigned if we are bypassing targeting checks (action finalization)
    if (bypassTargeting) {
        state.priorityPlayerId = playerId;
    }

    if (state.pendingAction) {
       log(`Cannot activate ability: Pending action ${state.pendingAction.type} must be resolved first.`);
       return false;
    }

    const cardLogic = M21_LOGIC[obj.definition.name];
    if (!cardLogic || !cardLogic.abilities[abilityIndex]) return false;

    const ability = cardLogic.abilities[abilityIndex];
    if (ability.type !== 'Activated') return false;

    // 1. Timing & Frequency (Rule 606.3: Planeswalkers)
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

    // Pre-flight Target Validation
    let precalculatedTargets: string[] | undefined;
    if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && !bypassTargeting) {
        precalculatedTargets = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id)
        ].filter(tid => ValidationProcessor.isLegalTarget(state, obj.id, tid, ability.targetDefinition));

        if (precalculatedTargets.length > 0) {
            const targetNames = precalculatedTargets.map(id => {
                const o = state.battlefield.find(x => x.id === id);
                return o ? o.definition.name : (state.players[id]?.name || id);
            }).join(', ');
            log(`[DEBUG] Valid targets for ability of ${obj.definition.name}: ${targetNames}`);
        }

        if (precalculatedTargets.length === 0) {
            log(`Illegal Activation: No valid targets available for ${obj.definition.name}'s ability.`);
            return false;
        }
    }

    // 2. Cost Payment
    if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) {
       log(`Illegal Activation: Cannot pay costs for ${obj.definition.name}'s ability.`);
       return false;
    }
    CostProcessor.pay(state, ability.costs || [], obj.id, playerId, (m) => log(m));

    // 3. Mark usage
    obj.abilitiesUsedThisTurn++;

    const stackId = `ability_${Date.now()}`;
    // 4. Put on stack
    state.stack.push({
      id: stackId,
      controllerId: playerId,
      sourceId: obj.id,
      type: 'ActivatedAbility',
      targets: declaredTargets || [],
      abilityIndex: abilityIndex,
      data: {
        effects: ability.effects || [],
        targetDefinition: ability.targetDefinition
      }
    });

    // Rule 601.2c: Choose targets if needed
    if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && precalculatedTargets && !bypassTargeting) {
       state.pendingAction = {
          type: 'TARGETING',
          playerId: playerId,
          sourceId: obj.id,
          data: {
              stackId: stackId,
              abilityIndex: abilityIndex,
              targetDefinition: ability.targetDefinition,
              legalTargetIds: precalculatedTargets 
          }
       };
       log(`[TARGETING] Player must choose targets for ${obj.definition.name}'s ability.`);
       return true;
    }

    log(`Activated ability of ${obj.definition.name}: ${ability.id}`);
    state.consecutivePasses = 0;
    engine.passPriority(playerId);
    return true;
  }
}
