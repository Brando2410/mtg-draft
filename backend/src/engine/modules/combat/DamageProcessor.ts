import {
  GameObject,
  GameObjectId,
  GameState,
  PlayerId,
  Zone,
} from "@shared/engine_types";
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from "../ProcessorRegistry";

/**
 * Rules Engine Module: Damage Handling (Rule 120)
 * Centralizes all damage application to ensure consistent event emission.
 */
export class DamageProcessor {
  /**
   * Applies damage to a creature or player.
   * Rule 120.3: Damage dealt to a creature results in that much damage being marked on it.
   * Rule 120.3a: Damage dealt to a player results in that player losing that much life.
   * @returns ActionResult detailing how much damage was actually dealt.
   */
  public static dealDamage(
    state: GameState,
    sourceId: GameObjectId,
    targetId: GameObjectId | PlayerId,
    amount: number,
    isCombat: boolean,
    log: (msg: string) => void,
  ): import("@shared/engine_types").ActionResult {
    if (amount <= 0)
      return {
        success: false,
        affectedIds: [],
        actualAmount: 0,
        stoppedBy: "ZeroAmount",
      };

    // Rule 702.16e: Protection prevents damage
    if (this.shouldPreventProtectionDamage(state, sourceId, targetId)) {
      log(`[MISS] Damage to ${targetId} prevented by Protection.`);
      return {
        success: false,
        affectedIds: [targetId],
        actualAmount: 0,
        stoppedBy: "Protection",
      };
    }

    // Rule 615: Prevention Effects
    if (
      !state.turnState.damagePreventionDisabled &&
      this.shouldPreventDamage(state, targetId, isCombat)
    ) {
      log(`[PREVENTED] Damage to ${targetId} was prevented by an effect.`);
      return {
        success: false,
        affectedIds: [targetId],
        actualAmount: 0,
        stoppedBy: "Prevention",
      };
    }

    const { layer: LP } = getProcessors(state);
    const sourceObj = RuleUtils.findObject(state, sourceId);
    const sourceStats = sourceObj
      ? LP.getEffectiveStats(sourceObj, state)
      : null;

    // 1. Resolve Damage to Permanents (Battlefield)
    const battlefieldObj = RuleUtils.findObject(state, targetId);
    if (battlefieldObj && battlefieldObj.zone === Zone.Battlefield) {
      this.applyDamageToPermanent(
        state,
        sourceObj,
        sourceStats,
        battlefieldObj,
        amount,
        isCombat,
        log,
      );
      state.turnState.lastDamageAmount = amount;
    } else {
      // 2. Resolve Damage to Players
      const targetPlayer = state.players[targetId];
      if (targetPlayer) {
        this.applyDamageToPlayer(
          state,
          sourceObj,
          targetPlayer,
          amount,
          isCombat,
          log,
        );
        state.turnState.lastDamageAmount = amount;
      } else {
        return {
          success: false,
          affectedIds: [],
          actualAmount: 0,
          stoppedBy: "InvalidTarget",
        };
      }
    }

    // 3. Handle Lifelink (Rule 702.15)
    if (sourceObj && sourceStats?.keywords.includes("Lifelink")) {
      const controllerId = sourceObj.controllerId;
      const player = state.players[controllerId];
      if (player) {
        player.life += amount;
        state.turnState.lifeGainedThisTurn[controllerId] =
          (state.turnState.lifeGainedThisTurn[controllerId] || 0) + amount;
        state.turnState.lastLifeGainedAmount = amount;
        log(
          `[LIFELINK] ${player.name} gains ${amount} life (Total: ${player.life}).`,
        );
        const { trigger: TrP } = getProcessors(state);
        TrP.onEvent(
          state,
          {
            type: "ON_LIFE_GAIN",
            playerId: controllerId,
            amount,
            payload: { sourceId: sourceObj.id },
          },
          log,
        );
      }
    }

    return {
      success: true,
      affectedIds: [targetId],
      actualAmount: amount,
    };
  }

  private static applyDamageToPermanent(
    state: GameState,
    sourceObj: any,
    sourceStats: any,
    target: GameObject,
    amount: number,
    isCombat: boolean,
    log: (m: string) => void,
  ) {
    if (RuleUtils.isPlaneswalker(target)) {
      // Rule 120.3c: Damage to planeswalker removes loyalty
      const currentLoyalty = target.counters["loyalty"] || 0;
      target.counters["loyalty"] = Math.max(0, currentLoyalty - amount);
      log(`[DAMAGE] ${target.definition.name} loses ${amount} loyalty.`);
    } else {
      // Rule 120.3: Damage to creature marks damage
      const { layer: LP } = getProcessors(state);
      const targetStats = LP.getEffectiveStats(target, state);
      const lethalNeeded = Math.max(
        0,
        targetStats.toughness - target.damageMarked,
      );
      state.turnState.lastExcessDamageAmount = Math.max(
        0,
        amount - lethalNeeded,
      );

      target.damageMarked += amount;
      log(
        `[DAMAGE] ${target.definition.name} takes ${amount} damage (Total: ${target.damageMarked}).`,
      );

      // Rule 702.2: Deathtouch
      if (sourceStats?.keywords.includes("Deathtouch")) {
        target.deathtouchMarked = true;
        log(
          `[DEATHTOUCH] ${target.definition.name} is marked by lethal poison.`,
        );
      }
    }

    const { trigger: TrP } = getProcessors(state);
    TrP.onEvent(
      state,
      {
        type: "ON_DAMAGE_TAKED",
        targetId: target.id,
        sourceId: sourceObj?.id,
        amount,
        payload: { isCombat },
      },
      log,
    );
  }

  private static applyDamageToPlayer(
    state: GameState,
    sourceObj: any,
    player: any,
    amount: number,
    isCombat: boolean,
    log: (m: string) => void,
  ) {
    const { trigger: TrP } = getProcessors(state);
    player.life -= amount;
    log(
      `[DAMAGE] Player ${player.name} takes ${amount} damage (Life: ${player.life}).`,
    );

    // Rule 120.3a: Damage dealt to opponent results in loss of life
    const sourceControllerId = sourceObj?.controllerId || state.activePlayerId;
    if (!isCombat && sourceControllerId !== player.id) {
      if (!state.turnState.noncombatDamageDealtToOpponents)
        state.turnState.noncombatDamageDealtToOpponents = {};
      state.turnState.noncombatDamageDealtToOpponents[sourceControllerId] =
        (state.turnState.noncombatDamageDealtToOpponents[sourceControllerId] ||
          0) + amount;

      TrP.onEvent(
        state,
        {
          type: "ON_NONCOMBAT_DAMAGE_OPPONENT",
          targetId: player.id,
          sourceId: sourceObj?.id,
          amount,
        },
        log,
      );
    }

    TrP.onEvent(
      state,
      {
        type: "ON_LIFE_LOSS",
        playerId: player.id,
        amount,
        payload: { sourceId: sourceObj?.id },
      },
      log,
    );
    TrP.onEvent(
      state,
      {
        type: "ON_DAMAGE_PLAYER",
        targetId: player.id,
        sourceId: sourceObj?.id,
        amount,
        payload: { isCombat },
      },
      log,
    );
  }

  public static shouldPreventDamage(
    state: GameState,
    targetId: string,
    isCombat: boolean,
  ): boolean {
    const effects = state.ruleRegistry.preventionEffects || [];
    if (effects.length === 0) return false;

    // We only care if target is a creature for Dog prevention
    const targetObj = RuleUtils.findObject(state, targetId);
    if (!targetObj || targetObj.zone !== Zone.Battlefield) return false;

    const { targeting: TP } = getProcessors(state);

    for (const eff of effects) {
      if (eff.damageType === "CombatDamage" && !isCombat) continue;

      const validIds = TP.resolveTargetMapping(
        state,
        eff.targetMapping,
        {
          sourceId: eff.sourceId,
          controllerId: eff.controllerId,
          targets: [],
          effects: [],
        } as any,
        eff,
      );
      if (validIds.includes(targetId)) return true;
    }
    return false;
  }

  /**
   * CR 702.16e: Damage that would be dealt by sources with that quality is prevented.
   */
  public static shouldPreventProtectionDamage(
    state: GameState,
    sourceId: string,
    targetId: string,
  ): boolean {
    const targetObj = RuleUtils.findObject(state, targetId);
    if (!targetObj || targetObj.zone !== Zone.Battlefield) return false;

    const source = RuleUtils.findObject(state, sourceId);
    if (!source) return false;

    const { layer: LP } = getProcessors(state);
    const keywords = LP.getEffectiveStats(
      targetObj,
      state,
    ).keywords;
    const protectionKeywords = keywords.filter((k: string) =>
      k.toLowerCase().startsWith("protection from"),
    );

    if (protectionKeywords.length > 0) {
      const { targeting: TP } = getProcessors(state);
      for (const prot of protectionKeywords) {
        const qualityStr = prot.toLowerCase().replace("protection from ", "");
        const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
        if (TP.sourceHasQualities(source, qualities, state)) {
          return true;
        }
      }
    }
    return false;
  }
}
