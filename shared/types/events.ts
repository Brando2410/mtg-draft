// events.ts
// Event constants and interfaces

import type { GameObject } from './state';
import type { GameObjectId, PlayerId } from './core';
import { Zone } from './core';

export const TriggerEvent = {
    EnterBattlefield: 'ON_ETB',
    EnterBattlefieldOther: 'ON_ETB_OTHER',
    Death: 'ON_DEATH',
    DeathOther: 'ON_DEATH_OTHER',
    LeaveBattlefield: 'ON_LEAVE_BATTLEFIELD',
    Attack: 'ON_ATTACK',
    Block: 'ON_BLOCK',
    BecameBlocked: 'ON_BECAME_BLOCKED',
    AttackersDeclared: 'ON_ATTACKERS_DECLARED',
    AttackOrBlock: 'ON_ATTACK_OR_BLOCK',
    DamageDealtToCreature: 'ON_DAMAGE_DEALT_TO_CREATURE',
    DamageDealtToPlayer: 'ON_DAMAGE_PLAYER',
    DamageTaken: 'ON_DAMAGE_TAKED',
    NoncombatDamageOpponent: 'ON_NONCOMBAT_DAMAGE_OPPONENT',
    CountersAdded: 'ON_COUNTERS_ADDED',
    CountersAddedOther: 'ON_COUNTERS_ADDED_OTHER',
    CastInstantOrSorcery: 'ON_CAST_INSTANT_SORCERY',
    CastFirstInstantOrSorcery: 'ON_CAST_FIRST_INSTANT_SORCERY',
    CastNonCreature: 'ON_CAST_NON_CREATURE',
    CastSpell: 'ON_CAST_SPELL',
    OpponentCastNonHand: 'ON_OPPONENT_CAST_NON_HAND',
    SecondSpellCast: 'ON_SECOND_SPELL_CAST',
    ThirdSpellCast: 'ON_THIRD_SPELL_CAST',
    CopySpell: 'ON_COPY_SPELL',
    Magecraft: 'ON_MAGECRAFT',
    MagecraftOpponent: 'ON_MAGECRAFT_OPPONENT',
    Draw: 'ON_DRAW',
    SecondDraw: 'ON_SECOND_DRAW',
    BecomeTarget: 'ON_BECOME_TARGET',
    LifeGain: 'ON_LIFE_GAIN',
    Sacrifice: 'ON_SACRIFICE',
    Untap: 'ON_UNTAP',
    EndOfTurn: 'ON_END_OF_TURN',
    EndStep: 'ON_END_STEP',
    StartOfCombat: 'ON_START_OF_COMBAT',
    BeginningOfCombatStep: 'ON_BEGINNING_OF_COMBAT_STEP',
    PreCombatMainPhaseStart: 'ON_PRE_COMBAT_MAIN_PHASE_START',
    PostCombatMainPhaseStart: 'ON_POST_COMBAT_MAIN_PHASE_START',
    Upkeep: 'ON_UPKEEP_STEP',
    Cleanup: 'ON_CLEANUP_STEP',
    LeaveGraveyard: 'ON_LEAVE_GRAVEYARD',
    ValentinReplacementSuccess: 'ON_VALENTIN_REPLACEMENT_SUCCESS',
    ActivateLoyalty: 'ON_ACTIVATE_LOYALTY',
    TriggerQueued: 'ON_TRIGGER_QUEUED',
    DamageDealt: 'ON_DAMAGE_DEALT',
    Landfall: 'ON_LANDFALL'
} as const;
export type TriggerEvent = (typeof TriggerEvent)[keyof typeof TriggerEvent];

export interface GameEvent {
    type: string;
    playerId?: PlayerId;
    sourceId?: GameObjectId;
    targetId?: GameObjectId;
    targets?: string[];
    amount?: number;
    counterType?: string;
    sourceZone?: Zone;
    card?: GameObject;
    object?: any;
    gameObject?: any;
    data?: any;
}
