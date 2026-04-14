import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const WitherbloomApprentice: CardDefinition = {
    name: "Witherbloom Apprentice",
    manaCost: "{B}{G}",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Human", "Druid"],
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 1 life and you gain 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
  };

