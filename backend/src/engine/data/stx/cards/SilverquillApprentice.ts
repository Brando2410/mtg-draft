import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const SilverquillApprentice: CardDefinition = {
    name: "Silverquill Apprentice",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Duelist"], // Scryfall: Human Duelist
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, target creature gets +1/+0 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: [{ type: 'Type', value: 'Creature' }]
            },
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 1, duration: 'UNTIL_END_OF_TURN', targetMapping: TargetMapping.Target1 }]
        }
    ]
  };


