import { EffectType } from "@shared/engine_types";
import { IEffectHandler } from "./IEffectHandler";
import { DamageHandler, GainLifeHandler, LoseLifeHandler } from "./handlers/life/LifeEffects";
import {
  AddCountersHandler,
  AttachHandler,
  CreateEmblemHandler,
  CreateTokenCopyHandler,
  CreateTokenHandler,
  DestroyHandler,
  DoubleCountersHandler,
  FightHandler,
  MoveCountersHandler,
  PrepareHandler,
  SacrificeHandler,
  TapHandler,
  UnprepareHandler,
  UntapHandler
} from "./handlers/permanent/PermanentEffects";
import { AdNauseamHandler, ApproachOfTheSecondSunHandler, CastSpellHandler, ChaosWarpHandler, ConditionalEffectHandler, ExileTopCardsExcessDamageHandler } from "./handlers/specialized/SpecializedEffects";
import { CopyAbilityHandler, CopySpellHandler, CounterAbilityHandler, CounterSpellHandler, CounterSpellOrAbilityHandler } from "./handlers/stack/CounterCopyEffects";
import { ChoiceHandler, LearnHandler } from "./handlers/system/ChoiceEffects";
import { ContinuousEffectHandler } from "./handlers/system/ContinuousEffects";
import { ControlEffectsHandler } from "./handlers/system/ControlEffects";
import { ManaHandler } from "./handlers/system/ManaEffects";
import { DisableDamagePreventionHandler, ExchangeHandAndGraveyardHandler, NecromentiaHandler, PendingActionHandler } from "./handlers/system/MiscEffects";
import { CreateDelayedTriggerHandler } from "./handlers/system/TriggerEffects";
import { MovementHandler } from "./handlers/zone/MoveEffectHandler";
import { DrawCardsHandler } from "./handlers/zone/DrawCardsHandler";
import { MillEffectHandler } from "./handlers/zone/MillEffectHandler";
import { DiscardEffectHandler } from "./handlers/zone/DiscardEffectHandler";
import { ScrySurveilHandler } from "./handlers/zone/ScrySurveilHandler";
import { SearchEffectHandler } from "./handlers/zone/SearchEffectHandler";
import { PermissionEffectHandler } from "./handlers/zone/PermissionEffectHandler";

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
    [EffectType.DrawCards]: DrawCardsHandler,
    [EffectType.Exile]: MovementHandler,
    [EffectType.ExileTopCard]: MovementHandler,
    [EffectType.ExileAllCards]: MovementHandler,
    [EffectType.ExileUntilLeaves]: MovementHandler,
    [EffectType.ReturnToHand]: MovementHandler,
    [EffectType.SearchLibrary]: SearchEffectHandler,
    [EffectType.Scry]: ScrySurveilHandler,
    [EffectType.Surveil]: ScrySurveilHandler,
    [EffectType.LookAtTopAndPick]: MovementHandler,
    [EffectType.MoveToZone]: MovementHandler,
    [EffectType.PutRemainderOnBottomRandom]: MovementHandler,
    [EffectType.PutOnBattlefield]: MovementHandler,
    [EffectType.Mill]: MillEffectHandler,
    [EffectType.AllowPlayMilledCard]: PermissionEffectHandler,
    [EffectType.AllowPlayExiled]: PermissionEffectHandler,
    [EffectType.AllowPlayFromTop]: PermissionEffectHandler,
    [EffectType.AllowCastFromGraveyard]: PermissionEffectHandler,
    [EffectType.RevealUntilCondition]: MovementHandler,
    [EffectType.DiscardCards]: DiscardEffectHandler,

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
    [EffectType.CreateDelayedTrigger]: CreateDelayedTriggerHandler,
    [EffectType.AddAdditionalTrigger]: ContinuousEffectHandler,

    // Misc
    [EffectType.ExchangeHandAndGraveyard]: ExchangeHandAndGraveyardHandler,
    [EffectType.DisableDamagePrevention]: DisableDamagePreventionHandler,
    [EffectType.PENDING_ACTION]: PendingActionHandler,
};
