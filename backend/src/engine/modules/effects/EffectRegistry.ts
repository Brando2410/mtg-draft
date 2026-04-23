import { EffectType } from "@shared/engine_types";
import { IEffectHandler } from "./IEffectHandler";
import { DamageHandler, GainLifeHandler, LoseLifeHandler } from "./handlers/life/LifeEffects";
import {
    DestroyHandler, SacrificeHandler, UntapHandler, TapHandler,
    FightHandler, AddCountersHandler, DoubleCountersHandler,
    MoveCountersHandler, CreateTokenHandler, CreateTokenCopyHandler,
    AttachHandler, PrepareHandler, UnprepareHandler, CreateEmblemHandler
} from "./handlers/permanent/PermanentEffects";
import { MovementHandler } from "./handlers/zone/MovementEffects";
import { ChoiceHandler, LearnHandler } from "./handlers/system/ChoiceEffects";
import { ContinuousEffectHandler } from "./handlers/system/ContinuousEffects";
import { CastSpellHandler, ExileTopCardsExcessDamageHandler, ConditionalEffectHandler, AdNauseamHandler, ChaosWarpHandler, ApproachOfTheSecondSunHandler } from "./handlers/specialized/SpecializedEffects";
import { CounterSpellHandler, CounterAbilityHandler, CopySpellHandler, CopyAbilityHandler, CounterSpellOrAbilityHandler } from "./handlers/stack/CounterCopyEffects";
import { ExchangeHandAndGraveyardHandler, DisableDamagePreventionHandler, PendingActionHandler, NecromentiaHandler } from "./handlers/system/MiscEffects";
import { ControlEffectsHandler } from "./handlers/system/ControlEffects";
import { ManaHandler } from "./handlers/system/ManaEffects";
import { CreateDelayedTriggerHandler } from "./handlers/system/TriggerEffects";

export const EffectRegistry: Partial<Record<EffectType | string, IEffectHandler>> = {
    // Life & Damage
    [EffectType.DealDamage]: DamageHandler,
    [EffectType.GainLife]: GainLifeHandler,
    [EffectType.LoseLife]: LoseLifeHandler,

    // Permanents
    [EffectType.Destroy]: DestroyHandler,
    [EffectType.Sacrifice]: SacrificeHandler,
    [EffectType.Untap]: UntapHandler,
    [EffectType.Tap]: TapHandler,
    [EffectType.Tapped]: TapHandler,
    [EffectType.Fight]: FightHandler,
    [EffectType.AddCounters]: AddCountersHandler,
    [EffectType.DoubleCounters]: DoubleCountersHandler,
    [EffectType.MoveCounters]: MoveCountersHandler,
    [EffectType.CreateToken]: CreateTokenHandler,
    [EffectType.CreateTokenCopy]: CreateTokenCopyHandler,
    [EffectType.Attach]: AttachHandler,
    [EffectType.Prepare]: PrepareHandler,
    [EffectType.Unprepare]: UnprepareHandler,
    [EffectType.CreateEmblem]: CreateEmblemHandler,

    // Zone Movement
    [EffectType.DrawCards]: MovementHandler,
    [EffectType.Exile]: MovementHandler,
    [EffectType.ExileTopCard]: MovementHandler,
    [EffectType.ExileAllCards]: MovementHandler,
    [EffectType.ExileUntilLeaves]: MovementHandler,
    [EffectType.ReturnToHand]: MovementHandler,
    [EffectType.SearchLibrary]: MovementHandler,
    [EffectType.Scry]: MovementHandler,
    [EffectType.Surveil]: MovementHandler,
    [EffectType.LookAtTopAndPick]: MovementHandler,
    [EffectType.MoveToZone]: MovementHandler,
    [EffectType.PutRemainderOnBottomRandom]: MovementHandler,
    [EffectType.PutOnBattlefield]: MovementHandler,
    [EffectType.Mill]: MovementHandler,
    [EffectType.RevealUntilCondition]: MovementHandler,
    [EffectType.DiscardCards]: MovementHandler,

    // Choices
    [EffectType.Choice]: ChoiceHandler,
    [EffectType.Necromentia]: NecromentiaHandler,
    [EffectType.Learn]: LearnHandler,

    // Continuous Effects
    [EffectType.ApplyContinuousEffect]: ContinuousEffectHandler,

    // Specialized Logic
    [EffectType.CastSpell]: CastSpellHandler,
    [EffectType.ExileTopCardsExcessDamage]: ExileTopCardsExcessDamageHandler,
    [EffectType.ConditionalEffect]: ConditionalEffectHandler,
    [EffectType.AdNauseam]: AdNauseamHandler,
    [EffectType.ChaosWarp]: ChaosWarpHandler,
    [EffectType.ApproachOfTheSecondSun]: ApproachOfTheSecondSunHandler,

    // Counter & Copy
    [EffectType.CounterSpell]: CounterSpellHandler,
    [EffectType.CounterAbility]: CounterAbilityHandler,
    [EffectType.CounterSpellOrAbility]: CounterSpellOrAbilityHandler,
    [EffectType.CopySpellOnStack]: CopySpellHandler,
    [EffectType.CopyAbility]: CopyAbilityHandler,

    // Control & Systems
    [EffectType.EndTurn]: ControlEffectsHandler,
    [EffectType.Shuffle]: ControlEffectsHandler,
    [EffectType.Log]: ControlEffectsHandler,
    [EffectType.AddTriggeredAbility]: ControlEffectsHandler,
    [EffectType.AddPreventionEffect]: ControlEffectsHandler,
    [EffectType.PhasedOut]: ControlEffectsHandler,
    [EffectType.AddMana]: ManaHandler,
    [EffectType.PayMana]: ManaHandler,
    [EffectType.LoseMana]: ManaHandler,
    [EffectType.CreateDelayedTrigger]: CreateDelayedTriggerHandler,
    [EffectType.AddAdditionalTrigger]: ContinuousEffectHandler,

    // Misc
    [EffectType.ExchangeHandAndGraveyard]: ExchangeHandAndGraveyardHandler,
    [EffectType.DisableDamagePrevention]: DisableDamagePreventionHandler,
    [EffectType.PENDING_ACTION]: PendingActionHandler,
};
