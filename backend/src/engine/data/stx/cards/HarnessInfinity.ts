import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const HarnessInfinity: CardDefinition = {
        name: "Harness Infinity",
        manaCost: "{1}{B}{B}{B}{G}{G}{G}",
        colors: ["B", "G"],
        types: ["Instant"],
        oracleText: "Exchange your hand and graveyard. Exile Harness Infinity.",
        abilities: [{
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.ExchangeHandAndGraveyard, targetMapping: TargetMapping.Controller },
                { type: EffectType.Exile, targetMapping: TargetMapping.Self }
            ]
        }]
    };

