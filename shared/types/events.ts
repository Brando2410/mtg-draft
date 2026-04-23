// events.ts
// Event constants and interfaces

import type { GameObjectId, PlayerId } from "./core";
import { Zone } from "./core";
import type { GameObject } from "./state";

export const TriggerEvent = {
  ActivateLoyalty: "ON_ACTIVATE_LOYALTY",
  Attack: "ON_ATTACK",
  AttackOrBlock: "ON_ATTACK_OR_BLOCK",
  AttackersDeclared: "ON_ATTACKERS_DECLARED",
  BecameBlocked: "ON_BECAME_BLOCKED",
  BecomeTarget: "ON_BECOME_TARGET",
  BeginningOfCombatStep: "ON_BEGINNING_OF_COMBAT_STEP",
  Block: "ON_BLOCK",
  CastFirstInstantOrSorcery: "ON_CAST_FIRST_INSTANT_SORCERY",
  CastInstantOrSorcery: "ON_CAST_INSTANT_SORCERY",
  CastNonCreature: "ON_CAST_NON_CREATURE",
  CastSpell: "ON_CAST_SPELL",
  Cleanup: "ON_CLEANUP_STEP",
  CopySpell: "ON_COPY_SPELL",
  CountersAdded: "ON_COUNTERS_ADDED",
  CountersAddedOther: "ON_COUNTERS_ADDED_OTHER",
  DamageDealt: "ON_DAMAGE_DEALT",
  DamageDealtToCreature: "ON_DAMAGE_DEALT_TO_CREATURE",
  DamageDealtToPlayer: "ON_DAMAGE_PLAYER",
  DamageTaken: "ON_DAMAGE_TAKED",
  CombatDamagePlayer: "ON_COMBAT_DAMAGE_PLAYER",
  Damaged: "ON_DAMAGE_TAKED",
  Death: "ON_DEATH",
  DeathOther: "ON_DEATH_OTHER",
  Draw: "ON_DRAW",
  EndOfTurn: "ON_END_OF_TURN",
  EndStep: "ON_END_STEP",
  EnterBattlefield: "ON_ETB",
  EnterBattlefieldOther: "ON_ETB_OTHER",
  Landfall: "ON_LANDFALL",
  LeaveBattlefield: "ON_LEAVE_BATTLEFIELD",
  LeaveGraveyard: "ON_LEAVE_GRAVEYARD",
  LifeGain: "ON_LIFE_GAIN",
  Magecraft: "ON_MAGECRAFT",
  MagecraftOpponent: "ON_MAGECRAFT_OPPONENT",
  NoncombatDamageOpponent: "ON_NONCOMBAT_DAMAGE_OPPONENT",
  OpponentCastNonHand: "ON_OPPONENT_CAST_NON_HAND",
  PostCombatMainPhaseStart: "ON_POST_COMBAT_MAIN_PHASE_START",
  PreCombatMainPhaseStart: "ON_PRE_COMBAT_MAIN_PHASE_START",
  Sacrifice: "ON_SACRIFICE",
  SecondDraw: "ON_SECOND_DRAW",
  SecondSpellCast: "ON_SECOND_SPELL_CAST",
  StartOfCombat: "ON_START_OF_COMBAT",
  ThirdSpellCast: "ON_THIRD_SPELL_CAST",
  TriggerQueued: "ON_TRIGGER_QUEUED",
  Tap: "ON_TAP",
  Untap: "ON_UNTAP",
  Upkeep: "ON_UPKEEP_STEP",
  ValentinReplacementSuccess: "ON_VALENTIN_REPLACEMENT_SUCCESS",
  ResolveSpell: "ON_RESOLVE_SPELL",
  Opus: "ON_OPUS",
  Repartee: "ON_REPARTEE",
  Exile: "ON_EXILE",
  Discard: "ON_DISCARD",
  LifeLoss: "ON_LIFE_LOSS",
  OnTrigger: "ON_TRIGGER",
  OnShrineTrigger: "ON_SHRINE_TRIGGER",
  OnTriggerQueued: "ON_TRIGGER_QUEUED",
} as const;
export type TriggerEvent = (typeof TriggerEvent)[keyof typeof TriggerEvent];

/**
 * EventPayload - Standardized metadata for game events.
 * Eliminates ambiguous 'data', 'object', 'gameObject' properties.
 */
export interface EventPayload {
  object?: GameObject; // Primary object involved (e.g. thing entering, dying, tapped)
  card?: GameObject; // Contextual alias for object in non-battlefield zones
  targetId?: GameObjectId; // ID of an object being targeted or affected
  targetIds?: string[]; // List of affected IDs (e.g. for mass triggers)
  sourceId?: GameObjectId; // Source of the action/effect (e.g. damaging source)
  sourceObject?: GameObject; // Full object reference for the source
  targetObject?: GameObject; // Full object reference for the target
  amount?: number; // Numeric data (damage, life gain, counters)
  counterType?: string; // Type of counter added/removed
  fromZone?: Zone; // Previous zone for move events
  toZone?: Zone; // Destination zone for move events
  text?: string; // Chosen name, type, or label
  stackSnapshot?: any; // Reference snapshot for 'look-back' resolution
}

export interface GameEvent {
  type: string | TriggerEvent;
  playerId?: PlayerId; // Player who performed the action or is affected
  payload?: EventPayload; // Structured metadata

  // Legacy support (to be phased out)
  data?: any;
  sourceId?: GameObjectId;
  targetId?: GameObjectId;
  amount?: number;
  targets?: string[];
  counterType?: string;
  sourceZone?: Zone;
  card?: GameObject;
  object?: any;
}
